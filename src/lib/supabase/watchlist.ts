import { supabase, SESSION_ID } from './client';

export interface WatchlistItem {
  id: string;
  session_id: string | null;
  tmdb_id: number;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  vote_average: number;
  release_date: string | null;
  added_at: string;
}

type AddPayload = Omit<WatchlistItem, 'id' | 'session_id' | 'added_at'>;

// Fetch the account watchlist when signed in; retain the legacy device-session fallback otherwise.
export async function getWatchlist(): Promise<WatchlistItem[]> {
  const { data: { user } } = await supabase.auth.getUser();
  let query = supabase.from('watchlist_items').select('*');
  query = user ? query.eq('user_id', user.id) : query.eq('session_id', SESSION_ID);
  const { data, error } = await query.order('added_at', { ascending: false }).limit(500);
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// Add a title to the account watchlist when signed in, or to the legacy session list otherwise.
export async function addToWatchlist(payload: AddPayload): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  const row = { ...payload, session_id: SESSION_ID, ...(user ? { user_id: user.id } : {}) };
  const onConflict = user ? 'user_id,tmdb_id,media_type' : 'session_id,tmdb_id,media_type';
  const { error } = await supabase.from('watchlist_items').upsert(row, { onConflict });
  if (error) throw error;
}

// Remove a title from the watchlist by row ID
export async function removeFromWatchlist(id: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  let query = supabase.from('watchlist_items').delete().eq('id', id);
  query = user ? query.eq('user_id', user.id) : query.eq('session_id', SESSION_ID);
  const { error } = await query;
  if (error) throw error;
}
