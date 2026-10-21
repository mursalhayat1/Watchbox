import { createClient } from '@supabase/supabase-js';
import { publicRuntimeConfig } from '@/lib/runtime-config';

const url = publicRuntimeConfig.supabaseUrl;
// Supabase JS client requires the browser-safe JWT anon key, never the service-role key.
const key = publicRuntimeConfig.supabaseAnonKey;
if (!url || !key) {
  throw new Error('Watchbox is not configured. Add the existing Supabase URL and anon key to the deployment runtime.');
}

// Persistent browser session ID — identifies the user without Auth
function getSessionId(): string {
  const STORAGE_KEY = 'miaoda_session_id';
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

export const SESSION_ID = getSessionId();

export const supabase = createClient(url, key, {
  global: {
    headers: { 'x-session-id': SESSION_ID },
  },
});
