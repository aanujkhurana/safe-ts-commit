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
      // Parse error output to extract files with errors and their locations
      const errorOutput = result.stderr || result.stdout || '';
      const errorLines = errorOutput.split('\n');
      // Robust regex: matches file:line:col - error TSxxxx: message, and file(line,col): error TSxxxx: message
      const errorDetails = errorLines
        .map(line => {
          // Try colon format: file:line:col - error TSxxxx: message
          let match = line.match(/^(.*\.(ts|tsx|js|jsx)):(\d+):(\d+) - (error TS\d+: .+)/);
          if (match) {
            return {
              file: match[1],
              line: match[3],
              col: match[4],
              message: match[5],
            };
          }
          // Try paren format: file(line,col): error TSxxxx: message
          match = line.match(/^(.*\.(ts|tsx|js|jsx))\((\d+),(\d+)\): (error TS\d+: .+)/);
          if (match) {
            return {
              file: match[1],
              line: match[2],
              col: match[3],
              message: match[4],
            };
          }
          return null;
        })
        .filter(Boolean) as { file: string; line: string; col: string; message: string }[];
      const errorFiles = Array.from(new Set(errorDetails.map(e => e.file)));
      console.error(`\n${colors.red}${colors.bold}❌ TypeScript errors found in ${errorFiles.length} file${errorFiles.length !== 1 ? 's' : ''}:${colors.reset}`);
      for (const file of errorFiles) {
        console.error(` - ${file}`);
      }
      // Show detailed error locations and messages
      console.error(`\n${colors.red}${colors.bold}Details:${colors.reset}`);
      if (errorDetails.length > 0) {
        for (const detail of errorDetails) {
          console.error(`  ${colors.yellow}${detail.file}:${detail.line}:${detail.col}${colors.reset} - ${detail.message}`);
        }
      } else {
        // Fallback: print raw error output if no details matched
        console.error(errorOutput);
      }
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