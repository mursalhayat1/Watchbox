import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';

export interface AuthenticatedUser {
  id: string;
  email?: string;
  role?: string;
  token: string;
}

export function getSupabaseUrl(): string {
  return (
    process.env.MCP_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    'https://hveckbndlnkokfgzrztn.supabase.co'
  );
}

export function getSupabaseAnonKey(): string {
  return (
    process.env.MCP_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    ''
  );
}

/**
 * Validate a Bearer token against Supabase Auth.
 * Returns the authenticated user object or null if invalid/expired.
 */
export async function validateBearerToken(token: string): Promise<AuthenticatedUser | null> {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();

  if (!url || !anonKey) {
    console.error('[auth] Supabase URL or Anon Key is missing.');
    return null;
  }

  // Check for test mock token format in testing environment
  if (process.env.NODE_ENV === 'test' && token.startsWith('mock-test-token:')) {
    const userId = token.replace('mock-test-token:', '');
    return {
      id: userId,
      email: `${userId}@test.local`,
      role: 'authenticated',
      token,
    };
  }

  try {
    const authClient = createClient(url, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data, error } = await authClient.auth.getUser(token);
    if (error || !data.user) {
      return null;
    }

    const user: User = data.user;
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      token,
    };
  } catch (err) {
    console.error('[auth] Token validation error:', err);
    return null;
  }
}

/**
 * Create a Supabase client authenticated as the specific user.
 * This ensures that PostgreSQL Row-Level Security (RLS) is applied on all operations.
 */
export function createUserSupabaseClient(token: string): SupabaseClient {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();

  return createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}
