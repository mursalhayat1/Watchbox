import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
// Supabase JS client requires the JWT anon key (eyJ… format), not the publishable key
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

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
