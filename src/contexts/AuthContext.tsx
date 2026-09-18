import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/db/supabase';
import type { User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  email: string | null;
  username: string | null;
  full_name: string | null;
  display_name: string | null;
  /** Avatar uploaded by the user (overrides provider) */
  avatar_url: string | null;
  /** Avatar from OAuth provider (Google / Discord) */
  provider_avatar_url: string | null;
  banner_url: string | null;
  bio: string | null;
  role: 'user' | 'admin';
  onboarded: boolean;
  created_at: string;
  updated_at: string;
}

/** The best available display name for a profile */
export function getDisplayName(profile: Profile | null): string {
  return profile?.full_name || profile?.display_name || profile?.username || 'User';
}

/** The best available avatar URL (user upload > OAuth provider > null) */
export function getAvatarUrl(profile: Profile | null): string | null {
  return profile?.avatar_url || profile?.provider_avatar_url || null;
}

/**
 * Returns the OAuth provider the user signed up with ('google' | 'discord' | 'email').
 * Reads from user.app_metadata.provider (set by Supabase).
 */
export function getAuthProvider(user: import('@supabase/supabase-js').User | null): 'google' | 'discord' | 'email' {
  const provider = user?.app_metadata?.provider as string | undefined;
  if (provider === 'google') return 'google';
  if (provider === 'discord') return 'discord';
  return 'email';
}

/**
 * Returns true when the user authenticated via an OAuth provider (Google / Discord)
 * that supplies a profile picture — so we should show their avatar instead of an initial.
 */
export function hasProviderAvatar(profile: Profile | null, user: import('@supabase/supabase-js').User | null): boolean {
  const provider = getAuthProvider(user);
  return (provider === 'google' || provider === 'discord') && !!(profile?.avatar_url || profile?.provider_avatar_url);
}

/** First letter of the display name, uppercased — used as the email-user initial badge. */
export function getNameInitial(profile: Profile | null): string {
  const name = getDisplayName(profile);
  return name.charAt(0).toUpperCase();
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithDiscord: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  return data ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async (uid?: string) => {
    const id = uid ?? user?.id;
    if (!id) { setProfile(null); return; }
    const p = await fetchProfile(id);
    setProfile(p);
  };

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        if (session?.user) fetchProfile(session.user.id).then(setProfile);
      })
      .finally(() => setLoading(false));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).then(setProfile);
      } else {
        setProfile(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const { data } = await supabase.auth.signInWithSSO({
      domain: 'miaoda-gg.com',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (data?.url) window.open(data.url, '_self');
  };

  const signInWithDiscord = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      signInWithGoogle, signInWithDiscord,
      signInWithEmail, signUpWithEmail,
      signOut, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

