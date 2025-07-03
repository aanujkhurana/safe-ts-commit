# ts-check-commit

This package prevents you from committing TypeScript files with errors.

## Installation

```bash
npm install ts-check-commit --save-dev
```

## Usage

1. Install husky:
   ```bash
   npx husky install
   ```
2. Create a pre-commit hook:
   ```bash
   npx husky add .husky/pre-commit "npx ts-check-commit"
   ```

Now, when you try to commit a TypeScript file with errors, the commit will be aborted.
