#!/usr/bin/env node

const { execSync } = require('child_process');

try {
  const stagedFiles = execSync('git diff --cached --name-only').toString().split('\n');
  const tsFiles = stagedFiles.filter(file => file.endsWith('.ts') || file.endsWith('.tsx'));

  if (tsFiles.length > 0) {
    execSync(`tsc --noEmit ${tsFiles.join(' ')}`);
  }
} catch (error) {
  console.error('TypeScript errors found. Aborting commit.');
  process.exit(1);
}

