import { supabase } from './client';

export interface ActorFavorite {
  id: string;
  user_id: string;
  person_id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string | null;
  added_at: string;
}

async function currentUserId(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
}

export async function getFavoriteActors(): Promise<ActorFavorite[]> {
  const uid = await currentUserId();
  if (!uid) return [];
  const { data, error } = await supabase
    .from('actor_favorites')
    .select('*')
    .eq('user_id', uid)
    .order('added_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function isFavoriteActor(personId: number): Promise<boolean> {
  const uid = await currentUserId();
  if (!uid) return false;
  const { data } = await supabase
    .from('actor_favorites')
    .select('id')
    .eq('user_id', uid)
    .eq('person_id', personId)
    .maybeSingle();
  return data !== null;
}

export interface ActorPayload {
  person_id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string | null;
}

/** Toggle favorite — returns true if now favorited */
export async function toggleFavoriteActor(payload: ActorPayload): Promise<boolean> {
  const uid = await currentUserId();
  if (!uid) throw new Error('Not signed in');

  const exists = await isFavoriteActor(payload.person_id);
  if (exists) {
    const { error } = await supabase
      .from('actor_favorites')
      .delete()
      .eq('user_id', uid)
      .eq('person_id', payload.person_id);
    if (error) throw error;
    return false;
  } else {
    const { error } = await supabase
      .from('actor_favorites')
      .upsert({ ...payload, user_id: uid }, { onConflict: 'user_id,person_id' });
    if (error) throw error;
    return true;
  }
}
