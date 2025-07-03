# What it does? 

Stops a Git commit if there are any TypeScript errors in staged or committed files.

# ts-check-commit-cli

A Git hook utility that prevents committing TypeScript files with type errors. This package helps maintain code quality by ensuring that all TypeScript files staged for commit pass the TypeScript compiler's type checking.

## Features

- 🔍 Checks only staged TypeScript files (`.ts` and `.tsx`)
- 🚫 Blocks commits when TypeScript errors are found
- ✅ Allows commits to proceed when no errors are detected
- 🎨 Colorful terminal output for better readability
- 🛡️ Handles file paths with spaces and special characters

## Prerequisites

- Node.js (v12 or higher recommended)
- TypeScript installed in your project
- Git

## Installation

```bash
npm install ts-check-commit-cli --save-dev
```

## Setup with Husky

1. Install husky if you haven't already:
   ```bash
   npm install husky --save-dev
   npx husky install
   ```

2. Add the prepare script to your package.json (if not already present):
   ```json
   {
     "scripts": {
       "prepare": "husky"
     }
   }
   ```

3. Create a pre-commit hook:
   ```bash
   npx husky add .husky/pre-commit "npx ts-check-commit"
   ```

## How It Works

When you attempt to commit changes, the pre-commit hook will:

1. Get the list of staged files using `git diff --cached --name-only`
2. Filter for TypeScript files (`.ts` and `.tsx`)
3. Run the TypeScript compiler (`tsc --noEmit`) on those files
4. If any TypeScript errors are found, the commit will be aborted with detailed error messages
5. If no errors are found, the commit will proceed normally

## Manual Usage

You can also run the check manually without committing:

```bash
npx ts-check-commit
```

## Troubleshooting

- **TypeScript not found**: Make sure TypeScript is installed in your project (`npm install typescript --save-dev`)
- **No files being checked**: Ensure your TypeScript files are staged for commit (`git add path/to/your/file.ts`)
- **Hook not running**: Verify that Husky is properly installed and the pre-commit hook is executable

## License

MIT

# Project Structure

```
safe-ts-commit/
├── bin/
│   └── cli.js           # Entry CLI file (compiled from cli.ts)
├── src/
│   ├── getStagedFiles.ts
│   ├── checkTsErrors.ts
│   └── utils.ts
├── tsconfig.json        # TypeScript config
├── package.json
├── README.md
└── .husky/
```

- All core logic is in `src/` as TypeScript modules.
- CLI entry point is in `bin/cli.ts` (compiled to `bin/cli.js`).
- Husky hooks and cache are supported as before.
