
# `safe-ts-commit` 🛡️  
> **Stop bad commits before they happen.** Automatically block Git commits if any TypeScript errors are detected in your staged files.

[![npm version](https://img.shields.io/npm/v/safe-ts-commit.svg)](https://www.npmjs.com/package/safe-ts-commit)
[![npm downloads](https://img.shields.io/npm/dm/safe-ts-commit.svg)](https://www.npmjs.com/package/safe-ts-commit)
[![license](https://img.shields.io/npm/l/safe-ts-commit.svg)](./LICENSE)

---

## ✨ What is `safe-ts-commit`?

`safe-ts-commit` is a **production-ready CLI tool** designed to protect your codebase by **blocking Git commits** if TypeScript type errors are present in your staged files.

Perfect for teams and solo devs who value code quality and type safety.

---

## 🚀 Why use this?

- ✅ **Type-Safe Commits** – Prevent buggy or broken commits due to TS errors.
- ⚡ **Fast & Lightweight** – Only checks staged `.ts` / `.tsx` files.
- 🎯 **Zero Config** – No extra setup required beyond install.
- 🔌 **Husky-Ready** – Integrates seamlessly as a Git pre-commit hook.
- 🎨 **Readable Output** – Colorful and actionable terminal messages.

---

## 🔧 Features

- 🧠 Detects only staged TypeScript files
- 🚫 Aborts commit if errors are found
- ✅ Allows commit to proceed if everything passes
- 🧼 Supports filenames with spaces/special characters
- 🖍️ Clean and colorful CLI messages
- 🧪 One-line setup: Auto-installs Husky and configures pre-commit hook.

---

## 📦 Prerequisites

- Node.js v12+
- TypeScript installed locally (`npm install typescript --save-dev`)
- Git (with initialized repo)

---

## 📥 Installation

```bash
npm install --save-dev safe-ts-commit
```

---

## ⚡ One-Liner Setup (Auto-Install)

Don’t want to manually configure Husky? Run this:

```bash
npx safe-ts-commit --install
```

This will:

- ✅ Install Husky (if not already installed)
- ✅ Add `prepare` script to your `package.json`
- ✅ Create a `.husky/pre-commit` hook that runs `safe-ts-commit`
- ✅ Lock your commits behind type safety in seconds

> Perfect for teams or quick setups. One command and you’re protected.

---

## ⚙️ Setup with Husky (Manual)

1. Install Husky:

```bash
npm install husky --save-dev
npx husky install
```

2. Add a `prepare` script in your `package.json`:

```json
"scripts": {
  "prepare": "husky install"
}
```

3. Add a pre-commit hook:

```bash
npx husky add .husky/pre-commit "npx safe-ts-commit"
```

---

## 🛠 How it Works

When a commit is attempted, `safe-ts-commit`:

1. Collects staged files via `git diff --cached --name-only`
2. Filters `.ts` and `.tsx` files
3. Runs `tsc --noEmit` on those files
4. If any type errors are found:
   - ❌ The commit is blocked with a detailed error report
5. If all files pass:
   - ✅ The commit proceeds as normal

---

## 🧪 Manual Usage

You can run it manually without a Git hook:

```bash
npx safe-ts-commit
```

---

## 🔄 Optional CLI Flags

```bash
safe-ts-commit [options]

--install        Run auto-setup with Husky
--debug          Print detailed debug logs
--silent         Hide output unless there's an error
--tsconfig       Path to custom tsconfig.json
```

---

## 🧰 Troubleshooting

| Issue                        | Solution                                                                 |
|-----------------------------|--------------------------------------------------------------------------|
| TypeScript not found        | Ensure you installed TypeScript locally (`npm install typescript`)       |
| No files being checked      | Make sure your TypeScript files are staged (`git add path/to/file.ts`)   |
| Hook not running            | Ensure Husky is installed and the pre-commit hook is executable          |

---

## 🗂 Project Structure

```
safe-ts-commit/
├── bin/
│   └── cli.js            # CLI entry (compiled from src/cli.ts)
├── src/
│   ├── getStagedFiles.ts
│   ├── checkTsErrors.ts
│   └── utils.ts
├── .husky/               # Husky hooks
├── tsconfig.json
├── package.json
└── README.md
```

---

## 📜 License

MIT — feel free to fork, improve, and contribute!
