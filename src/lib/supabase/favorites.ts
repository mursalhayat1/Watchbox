import { supabase } from './client';

export interface FavoriteItem {
  id: string;
  user_id: string | null;
  tmdb_id: number;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date: string | null;
  added_at: string;
}

type AddPayload = Omit<FavoriteItem, 'id' | 'user_id' | 'added_at'>;

async function currentUserId(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
}

export async function getFavorites(): Promise<FavoriteItem[]> {
  const uid = await currentUserId();
  if (!uid) return [];
  const { data, error } = await supabase
    .from('favorite_items')
    .select('*')
    .eq('user_id', uid)
    .order('added_at', { ascending: false })
    .limit(500);
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function isFavorited(
  tmdbId: number,
  mediaType: 'movie' | 'tv',
): Promise<boolean> {
  const uid = await currentUserId();
  if (!uid) return false;
  const { data } = await supabase
    .from('favorite_items')
    .select('id')
    .eq('user_id', uid)
    .eq('tmdb_id', tmdbId)
    .eq('media_type', mediaType)
    .maybeSingle();
  return data !== null;
}

export async function toggleFavorite(payload: AddPayload): Promise<boolean> {
  const uid = await currentUserId();
  if (!uid) throw new Error('Not signed in');
  const existing = await isFavorited(payload.tmdb_id, payload.media_type);
  if (existing) {
    const { error } = await supabase
      .from('favorite_items')
      .delete()
      .eq('user_id', uid)
      .eq('tmdb_id', payload.tmdb_id)
      .eq('media_type', payload.media_type);
    if (error) throw error;
    return false;
  } else {
    const { error } = await supabase
      .from('favorite_items')
      .upsert({ ...payload, user_id: uid }, { onConflict: 'user_id,tmdb_id,media_type' });
    if (error) throw error;
    return true;
  }
}
