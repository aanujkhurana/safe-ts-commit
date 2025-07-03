#!/usr/bin/env node

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m'
};

const CACHE_FILE = path.join(process.cwd(), '.ts-check-commit-cache.json');

function hashFile(filePath) {
  const data = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(data).digest('hex');
}

function loadCache() {
  if (fs.existsSync(CACHE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    } catch {
      return {};
    }
  }
  return {};
}

function saveCache(cache) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

function getFilesToCheck(tsFiles, cache) {
  const toCheck = [];
  const hashes = {};
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

function updateCacheWithResults(cache, files, hashes, hadErrors) {
  for (const file of files) {
    cache[file] = { hash: hashes[file], lastChecked: Date.now(), hadErrors };
  }
}

function checkTypeScriptInstalled() {
  try {
    // Try to use local TypeScript installation first
    const tscPath = path.join(process.cwd(), 'node_modules', '.bin', 'tsc');
    if (fs.existsSync(tscPath)) {
      execSync(`"${tscPath}" --version`, { stdio: 'ignore' });
      return { installed: true, path: tscPath };
    }
    
    // Fall back to global TypeScript
    execSync('tsc --version', { stdio: 'ignore' });
    return { installed: true, path: 'tsc' };
  } catch (error) {
    return { installed: false };
  }
}

function getStagedFiles() {
  try {
    // Get list of staged files
    const output = execSync('git diff --cached --name-only').toString().trim();
    if (!output) {
      return [];
    }
    return output.split('\n');
  } catch (error) {
    console.error(`${colors.red}${colors.bold}Error getting staged files:${colors.reset}`, error.message);
    process.exit(1);
  }
}

function filterTypeScriptFiles(files) {
  return files.filter(file => {
    return (file.endsWith('.ts') || file.endsWith('.tsx')) && fs.existsSync(file);
  });
}

function checkTypeScriptErrors(tsFiles, tscPath, cache, hashes) {
  if (tsFiles.length === 0) {
    return false;
  }

  console.log(`${colors.blue}Checking TypeScript errors in ${tsFiles.length} staged files...${colors.reset}`);

  const tempFilePath = path.join(process.cwd(), '.ts-files-to-check.txt');
  fs.writeFileSync(tempFilePath, tsFiles.join('\n'));

  try {
    const result = spawnSync(tscPath, ['--noEmit', '--pretty', '@' + tempFilePath], {
      stdio: 'pipe',
      encoding: 'utf-8',
      shell: process.platform === 'win32'
    });

    fs.unlinkSync(tempFilePath);

    if (result.status !== 0) {
      console.error(`\n${colors.red}${colors.bold}TypeScript errors found:${colors.reset}\n`);
      console.error(result.stderr || result.stdout);
      console.error(`\n${colors.yellow}${colors.bold}Commit aborted. Please fix the TypeScript errors and try again.${colors.reset}\n`);
      updateCacheWithResults(cache, tsFiles, hashes, true);
      saveCache(cache);
      process.exit(1);
    }

    updateCacheWithResults(cache, tsFiles, hashes, false);
    saveCache(cache);
    console.log(`${colors.green}No TypeScript errors found. Proceeding with commit.${colors.reset}`);
    return false;
  } catch (error) {
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    console.error(`${colors.red}${colors.bold}Error running TypeScript compiler:${colors.reset}`, error.message);
    process.exit(1);
  }
}

// Main execution
try {
  const tsResult = checkTypeScriptInstalled();
  if (!tsResult.installed) {
    console.error(`${colors.red}${colors.bold}Error:${colors.reset} TypeScript is not installed. Please install TypeScript and try again.`);
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
      console.error(`\n${colors.red}${colors.bold}TypeScript errors found (from cache):${colors.reset}\n`);
      console.error(`\n${colors.yellow}${colors.bold}Commit aborted. Please fix the TypeScript errors and try again.${colors.reset}\n`);
      process.exit(1);
    } else {
      console.log(`${colors.green}No TypeScript errors found (from cache). Proceeding with commit.${colors.reset}`);
    }
  } else {
    console.log(`${colors.blue}No TypeScript files staged for commit.${colors.reset}`);
  }
} catch (error) {
  console.error(`${colors.red}${colors.bold}Unexpected error:${colors.reset}`, error.message);
  process.exit(1);
}

