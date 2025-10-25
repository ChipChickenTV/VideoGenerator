import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { promises as fsPromises } from 'fs';
import os from 'os';
import path from 'path';

const TOKEN_DIRECTORY = path.join(os.homedir() || '.', '.video-web3');
export const TOKEN_FILE_PATH = path.join(TOKEN_DIRECTORY, 'google-tokens.json');

function ensureTokenDirectory(): void {
  if (!existsSync(TOKEN_DIRECTORY)) {
    mkdirSync(TOKEN_DIRECTORY, { recursive: true });
  }
}

export function loadPersistedRefreshTokenSync(): string | null {
  try {
    const raw = readFileSync(TOKEN_FILE_PATH, 'utf8');
    const parsed = JSON.parse(raw) as { refresh_token?: string };
    return typeof parsed.refresh_token === 'string' && parsed.refresh_token.trim() ? parsed.refresh_token : null;
  } catch {
    return null;
  }
}

export async function loadPersistedRefreshToken(): Promise<string | null> {
  try {
    const raw = await fsPromises.readFile(TOKEN_FILE_PATH, 'utf8');
    const parsed = JSON.parse(raw) as { refresh_token?: string };
    return typeof parsed.refresh_token === 'string' && parsed.refresh_token.trim() ? parsed.refresh_token : null;
  } catch {
    return null;
  }
}

export function persistRefreshTokenSync(refreshToken: string): void {
  ensureTokenDirectory();
  const payload = JSON.stringify({ refresh_token: refreshToken, updated_at: new Date().toISOString() }, null, 2);
  writeFileSync(TOKEN_FILE_PATH, payload, 'utf8');
}

export async function persistRefreshToken(refreshToken: string): Promise<void> {
  ensureTokenDirectory();
  const payload = JSON.stringify({ refresh_token: refreshToken, updated_at: new Date().toISOString() }, null, 2);
  await fsPromises.writeFile(TOKEN_FILE_PATH, payload, 'utf8');
}

