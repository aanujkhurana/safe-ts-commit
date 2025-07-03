import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { saveCache } from './utils';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
};

export function checkTypeScriptErrors(
  tsFiles: string[],
  tscPath: string,
  cache: Record<string, { hash: string; lastChecked: number; hadErrors: boolean }>,
  hashes: Record<string, string>
): boolean {
  if (tsFiles.length === 0) return false;

  console.log(`${colors.blue}Checking TypeScript errors in ${tsFiles.length} staged files...${colors.reset}`);

  const tempFilePath = path.join(process.cwd(), '.ts-files-to-check.txt');
  fs.writeFileSync(tempFilePath, tsFiles.join('\n'));

  try {
    const result = spawnSync(tscPath, ['--noEmit', '--pretty', '@' + tempFilePath], {
      stdio: 'pipe',
      encoding: 'utf-8',
      shell: process.platform === 'win32',
    });

    fs.unlinkSync(tempFilePath);

    if (result.status !== 0) {
      console.error(`\n${colors.red}${colors.bold}TypeScript errors found:${colors.reset}\n`);
      console.error(result.stderr || result.stdout);
      console.error(`\n${colors.yellow}${colors.bold}Commit aborted. Please fix the TypeScript errors and try again.${colors.reset}\n`);
      for (const file of tsFiles) {
        cache[file] = { hash: hashes[file], lastChecked: Date.now(), hadErrors: true };
      }
      saveCache(cache);
      process.exit(1);
    }

    for (const file of tsFiles) {
      cache[file] = { hash: hashes[file], lastChecked: Date.now(), hadErrors: false };
    }
    saveCache(cache);
    console.log(`${colors.green}No TypeScript errors found. Proceeding with commit.${colors.reset}`);
    return false;
  } catch (error: any) {
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    throw new Error(`${colors.red}${colors.bold}Error running TypeScript compiler:${colors.reset} ${error.message}`);
  }
} 