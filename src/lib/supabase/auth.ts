import { supabase } from './client';
import type { User } from '@supabase/supabase-js';

export interface AuthCredentials {
  email: string;
  password: string;
}

// Register a new user with email + password
export async function signUp({ email, password }: AuthCredentials): Promise<User> {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  if (!data.user) throw new Error('Sign-up succeeded but no user was returned');
  return data.user;
}

// Sign in an existing user
export async function signIn({ email, password }: AuthCredentials): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (!data.user) throw new Error('Sign-in succeeded but no user was returned');
  return data.user;
}

// Sign out the current session
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Return the currently authenticated user, or null if not signed in
export async function getUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}
