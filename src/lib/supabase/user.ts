import { supabase } from './client';

export interface UserProfile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  updated_at: string;
}

export type ProfileUpdate = Partial<Pick<UserProfile, 'username' | 'avatar_url' | 'bio'>>;

// Fetch the profile row for a given user ID
export async function getProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

// Upsert profile fields for the given user ID
export async function updateProfile(
  userId: string,
  updates: ProfileUpdate,
): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...updates, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data;
}
