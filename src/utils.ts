import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export const CACHE_FILE = path.join(process.cwd(), '.ts-check-commit-cache.json');

export function hashFile(filePath: string): string {
  const data = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(data).digest('hex');
}

export function loadCache(): Record<string, { hash: string; lastChecked: number; hadErrors: boolean }> {
  if (fs.existsSync(CACHE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    } catch {
      return {};
    }
  }
  return {};
}

export function saveCache(cache: Record<string, { hash: string; lastChecked: number; hadErrors: boolean }>): void {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

export function filterTypeScriptFiles(files: string[]): string[] {
  return files.filter(file => (file.endsWith('.ts') || file.endsWith('.tsx')) && fs.existsSync(file));
} 