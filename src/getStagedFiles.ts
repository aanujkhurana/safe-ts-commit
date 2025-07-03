import { execSync } from 'child_process';

export function getStagedFiles(): string[] {
  try {
    const output = execSync('git diff --cached --name-only').toString().trim();
    if (!output) return [];
    return output.split('\n');
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Error getting staged files: ${error.message}`);
    } else {
      throw new Error('Error getting staged files: Unknown error');
    }
  }
} 