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

  console.log(`${colors.blue}🔍 Checking staged TypeScript files...${colors.reset}`);

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
      // Parse error output to extract files with errors
      const errorOutput = result.stderr || result.stdout || '';
      const errorFiles = Array.from(new Set(
        errorOutput
          .split('\n')
          .map(line => line.match(/^(.*\.(ts|tsx))\(/)?.[1])
          .filter(Boolean)
      ));
      console.error(`\n${colors.red}${colors.bold}❌ TypeScript errors found in ${errorFiles.length} file${errorFiles.length !== 1 ? 's' : ''}:${colors.reset}`);
      for (const file of errorFiles) {
        console.error(` - ${file}`);
      }
      // Optionally, print the first few lines of errorOutput for context
      // console.error(errorOutput.split('\n').slice(0, 10).join('\n'));
      console.error(`\n${colors.yellow}${colors.bold}💥 Commit aborted. Fix TS errors before proceeding.${colors.reset}\n`);
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
  } catch (error: unknown) {
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    if (error instanceof Error) {
      throw new Error(`${colors.red}${colors.bold}Error running TypeScript compiler:${colors.reset} ${error.message}`);
    } else {
      throw new Error(`${colors.red}${colors.bold}Error running TypeScript compiler:${colors.reset} Unknown error`);
    }
  }
} 