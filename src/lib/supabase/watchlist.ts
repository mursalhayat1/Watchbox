import { supabase, SESSION_ID } from './client';

export interface WatchlistItem {
  id: string;
  session_id: string;
  tmdb_id: number;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  vote_average: number;
  release_date: string | null;
  added_at: string;
}

type AddPayload = Omit<WatchlistItem, 'id' | 'session_id' | 'added_at'>;

// Fetch all watchlist items for the current session
export async function getWatchlist(): Promise<WatchlistItem[]> {
  const { data, error } = await supabase
    .from('watchlist_items')
    .select('*')
    .eq('session_id', SESSION_ID)
    .order('added_at', { ascending: false })
    .limit(500);
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// Add a title to the watchlist (upserts on session_id + tmdb_id + media_type)
export async function addToWatchlist(payload: AddPayload): Promise<void> {
  const { error } = await supabase
    .from('watchlist_items')
    .upsert(
      { ...payload, session_id: SESSION_ID },
      { onConflict: 'session_id,tmdb_id,media_type' },
    );
  if (error) throw error;
}

// Remove a title from the watchlist by row ID
export async function removeFromWatchlist(id: string): Promise<void> {
  const { error } = await supabase
    .from('watchlist_items')
    .delete()
    .eq('id', id)
    .eq('session_id', SESSION_ID);
  if (error) throw error;
}
