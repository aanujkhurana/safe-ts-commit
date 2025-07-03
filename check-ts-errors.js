#!/usr/bin/env node

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m'
};

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

function checkTypeScriptErrors(tsFiles, tscPath) {
  if (tsFiles.length === 0) {
    return;
  }

  console.log(`${colors.blue}Checking TypeScript errors in ${tsFiles.length} staged files...${colors.reset}`);
  
  // Create a temporary file with the list of files to check
  // This avoids issues with command line length limits and spaces in filenames
  const tempFilePath = path.join(process.cwd(), '.ts-files-to-check.txt');
  fs.writeFileSync(tempFilePath, tsFiles.join('\n'));

  try {
    // Use --listFiles to see which files are being checked
    const result = spawnSync(tscPath, ['--noEmit', '--pretty', '@' + tempFilePath], {
      stdio: 'pipe',
      encoding: 'utf-8',
      shell: process.platform === 'win32' // Use shell on Windows to handle paths with spaces
    });

    // Clean up temp file
    fs.unlinkSync(tempFilePath);

    if (result.status !== 0) {
      console.error(`\n${colors.red}${colors.bold}TypeScript errors found:${colors.reset}\n`);
      console.error(result.stderr || result.stdout);
      console.error(`\n${colors.yellow}${colors.bold}Commit aborted. Please fix the TypeScript errors and try again.${colors.reset}\n`);
      process.exit(1);
    }

    console.log(`${colors.green}No TypeScript errors found. Proceeding with commit.${colors.reset}`);
  } catch (error) {
    // Clean up temp file in case of error
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

  if (tsFiles.length > 0) {
    checkTypeScriptErrors(tsFiles, tsResult.path);
  } else {
    console.log(`${colors.blue}No TypeScript files staged for commit.${colors.reset}`);
  }
} catch (error) {
  console.error(`${colors.red}${colors.bold}Unexpected error:${colors.reset}`, error.message);
  process.exit(1);
}

