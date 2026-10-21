import { existsSync } from 'node:fs';
import { startServer } from './index.js';

if (!process.env.NODE_ENV) process.env.NODE_ENV = 'development';
if (!process.env.MCP_PORT && !process.env.PORT) process.env.MCP_PORT = '8787';
if (!process.env.PORT && process.env.MCP_PORT) process.env.PORT = process.env.MCP_PORT;

if (existsSync('.env') && !process.env.SUPABASE_URL && !process.env.VITE_SUPABASE_URL) {
  try {
    process.loadEnvFile('.env');
  } catch {
    console.error('[watchbox] Could not load the local .env file. Set the required runtime variables in the process environment.');
    process.exitCode = 1;
  }
}

// Local OpenCode client convenience: when exactly one OAuth client is configured
// for OpenCode, allow it to read without duplicating the ID in MCP_READ_CLIENT_IDS.
// Production still requires an explicit, non-empty allowlist.
if (
  process.env.NODE_ENV !== 'production' &&
  process.env.WATCHBOX_MCP_CLIENT_ID &&
  !process.env.MCP_READ_CLIENT_IDS
) {
  process.env.MCP_READ_CLIENT_IDS = process.env.WATCHBOX_MCP_CLIENT_ID;
}

if (!process.exitCode) startServer();
