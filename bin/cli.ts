#!/usr/bin/env node
import * as path from 'path';
import * as fs from 'fs';
import { getStagedFiles } from '../src/getStagedFiles';
import { filterTypeScriptFiles, hashFile, loadCache } from '../src/utils';
import { checkTypeScriptErrors } from '../src/checkTsErrors';

function checkTypeScriptInstalled(): { installed: boolean; path?: string } {
  try {
    // Try to use local TypeScript installation first
    const tscPath = path.join(process.cwd(), 'node_modules', '.bin', 'tsc');
    if (fs.existsSync(tscPath)) {
      return { installed: true, path: tscPath };
    }
    // Fall back to global TypeScript
    return { installed: true, path: 'tsc' };
  } catch {
    return { installed: false };
  }
}

function getFilesToCheck(tsFiles: string[], cache: Record<string, { hash: string; lastChecked: number; hadErrors: boolean }>) {
  const toCheck: string[] = [];
  const hashes: Record<string, string> = {};
  for (const file of tsFiles) {
    try {
      const hash = hashFile(file);
      hashes[file] = hash;
      if (!cache[file] || cache[file].hash !== hash) {
        toCheck.push(file);
      }
    } catch {
      toCheck.push(file);
    }
  }
  return { toCheck, hashes };
}

function main() {
  const tsResult = checkTypeScriptInstalled();
  if (!tsResult.installed || !tsResult.path) {
    console.error('TypeScript is not installed. Please install TypeScript and try again.');
    process.exit(1);
  }

  const stagedFiles = getStagedFiles();
  const tsFiles = filterTypeScriptFiles(stagedFiles);
  const cache = loadCache();
  const { toCheck, hashes } = getFilesToCheck(tsFiles, cache);

  if (toCheck.length > 0) {
    checkTypeScriptErrors(toCheck, tsResult.path, cache, hashes);
  } else if (tsFiles.length > 0) {
    // All files unchanged and previously checked
    const hasPrevErrors = tsFiles.some(f => cache[f] && cache[f].hadErrors);
    if (hasPrevErrors) {
      // Rerun the check to show detailed error output
      checkTypeScriptErrors(tsFiles, tsResult.path, cache, hashes);
    } else {
      console.log('No TypeScript errors found (from cache). Proceeding with commit.');
    }
  } else {
    console.log('No TypeScript files staged for commit.');
  }
}

main(); 