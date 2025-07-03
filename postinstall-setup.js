#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function hasHusky() {
  return fs.existsSync(path.join(process.cwd(), '.husky'));
}

function hasPreCommitHook() {
  return fs.existsSync(path.join(process.cwd(), '.husky', 'pre-commit'));
}

function addPreCommitHook() {
  try {
    execSync('npx husky add .husky/pre-commit "npx ts-check-commit"', { stdio: 'inherit' });
    console.log('✅ Husky pre-commit hook for ts-check-commit added.');
  } catch (err) {
    console.error('❌ Failed to add Husky pre-commit hook:', err.message);
  }
}

function main() {
  if (!hasHusky()) {
    console.log('ℹ️ Husky is not installed or .husky directory not found. Skipping pre-commit hook setup.');
    return;
  }
  if (hasPreCommitHook()) {
    console.log('ℹ️ Husky pre-commit hook already exists.');
    return;
  }
  addPreCommitHook();
}

main(); 