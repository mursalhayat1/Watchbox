import { createClient } from '@supabase/supabase-js';

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
// New Supabase projects expose the publishable key; keep the legacy anon key as a fallback.
const key = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined
  ?? import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
)?.trim();

if (!url) {
  throw new Error(
    'Supabase is not configured: VITE_SUPABASE_URL is missing from the Vite environment.',
  );
}

if (!key) {
  throw new Error(
    'Supabase is not configured: VITE_SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_ANON_KEY is missing from the Vite environment.',
  );
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
