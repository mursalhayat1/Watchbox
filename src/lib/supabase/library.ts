import { supabase } from './client';

export type LibraryStatus = 'Watching' | 'Completed' | 'Plan to Watch' | 'On Hold' | 'Dropped';

export const LIBRARY_STATUSES: LibraryStatus[] = [
  'Watching', 'Completed', 'Plan to Watch', 'On Hold', 'Dropped',
];

export interface LibraryItem {
  id: string;
  user_id: string | null;
  tmdb_id: number;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date: string | null;
  status: LibraryStatus;
  note: string | null;
  user_rating: number | null;
  added_at: string;
  updated_at: string;
}

// Payload the caller provides — user_id is resolved server-side via auth.uid()
export type AddPayload = Omit<LibraryItem, 'id' | 'user_id' | 'added_at' | 'updated_at'>;

/** Save or clear a note + user rating on an existing library item. */
export async function updateLibraryNoteRating(
  id: string,
  note: string | null,
  userRating: number | null,
): Promise<void> {
  const uid = await currentUserId();
  if (!uid) throw new Error('Not signed in');
  const { error } = await supabase
    .from('library_items')
    .update({ note, user_rating: userRating })
    .eq('id', id)
    .eq('user_id', uid);
  if (error) throw error;
}

/** Returns null (not throws) when the user is not signed in. */
async function currentUserId(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
}

export async function getLibrary(): Promise<LibraryItem[]> {
  const uid = await currentUserId();
  if (!uid) return [];
  const { data, error } = await supabase
    .from('library_items')
    .select('*')
    .eq('user_id', uid)
    .order('added_at', { ascending: false })
    .limit(500);
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getLibraryItem(
  tmdbId: number,
  mediaType: 'movie' | 'tv',
): Promise<LibraryItem | null> {
  const uid = await currentUserId();
  if (!uid) return null;
  const { data } = await supabase
    .from('library_items')
    .select('*')
    .eq('user_id', uid)
    .eq('tmdb_id', tmdbId)
    .eq('media_type', mediaType)
    .maybeSingle();
  return data ?? null;
}

export async function addToLibrary(payload: AddPayload): Promise<void> {
  const uid = await currentUserId();
  if (!uid) throw new Error('Not signed in');
  const { error } = await supabase
    .from('library_items')
    .upsert(
      { ...payload, user_id: uid },
      { onConflict: 'user_id,tmdb_id,media_type' },
    );
  if (error) throw error;
}

export async function updateLibraryStatus(id: string, status: LibraryStatus): Promise<void> {
  const uid = await currentUserId();
  if (!uid) throw new Error('Not signed in');
  const { error } = await supabase
    .from('library_items')
    .update({ status })
    .eq('id', id)
    .eq('user_id', uid);
  if (error) throw error;
}

export async function removeFromLibrary(id: string): Promise<void> {
  const uid = await currentUserId();
  if (!uid) throw new Error('Not signed in');
  const { error } = await supabase
    .from('library_items')
    .delete()
    .eq('id', id)
    .eq('user_id', uid);
  if (error) throw error;
}
