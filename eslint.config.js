// ESLint configuration for TypeScript project (ESLint v9+)
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts', 'src/**/*.tsx', 'bin/**/*.ts', 'bin/**/*.tsx'],
    ignores: ['dist/**', '*.js', 'check-ts-errors.js', 'test-ts-check.js', 'postinstall-setup.js'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
      },
    },
    rules: {
      // Add or override rules here
    },
  },
]; 