import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import type { WatchboxConfig } from './config.js';
import { authIssuer } from './config.js';

export interface AuthenticatedMcpUser {
  userId: string;
  clientId: string;
  scopes: string[];
  user: User;
}

export class AuthenticationError extends Error {
  constructor(message = 'A valid Watchbox OAuth access token is required.') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

function tokenFromHeader(header: string | string[] | undefined): string {
  if (typeof header !== 'string') throw new AuthenticationError();
  const match = /^Bearer\s+([^\s]+)$/i.exec(header.trim());
  if (!match?.[1] || match[1].length > 16_384) throw new AuthenticationError();
  return match[1];
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function hasAudience(value: unknown, expected: string): boolean {
  return typeof value === 'string'
    ? value === expected
    : Array.isArray(value) && value.includes(expected);
}

export function createUserScopedSupabase(config: WatchboxConfig, accessToken: string): SupabaseClient {
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    throw new Error('Watchbox Supabase runtime configuration is incomplete.');
  }

  return createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  });
}

/**
 * Verify the signed Supabase JWT, constrain it to this Auth project and the
 * authenticated role, then ask Supabase Auth to verify that the user still exists.
 * The caller never supplies a user ID; it comes only from these verified claims.
 */
export async function authenticateRequest(
  authorization: string | string[] | undefined,
  config: WatchboxConfig,
): Promise<{ auth: AuthenticatedMcpUser; supabase: SupabaseClient }> {
  const accessToken = tokenFromHeader(authorization);
  if (!config.supabaseUrl || !config.supabaseAnonKey) throw new AuthenticationError();

  const supabase = createUserScopedSupabase(config, accessToken);
  const { data: claimData, error: claimError } = await supabase.auth.getClaims(accessToken);
  if (claimError || !claimData?.claims) throw new AuthenticationError();

  const claims = claimData.claims as Record<string, unknown>;
  const userId = asString(claims.sub);
  const clientId = asString(claims.client_id);
  const issuer = asString(claims.iss);
  const role = asString(claims.role);
  const now = Math.floor(Date.now() / 1000);
  const exp = typeof claims.exp === 'number' ? claims.exp : Number.NaN;
  const nbf = typeof claims.nbf === 'number' ? claims.nbf : null;
  const scopeClaim = asString(claims.scope) ?? '';
  const audienceValid = hasAudience(claims.aud, 'authenticated');
  const issuerValid = issuer === authIssuer(config.supabaseUrl);

  if (
    !userId ||
    !clientId ||
    !issuerValid ||
    !audienceValid ||
    role !== 'authenticated' ||
    !Number.isFinite(exp) ||
    exp <= now ||
    (nbf !== null && (!Number.isFinite(nbf) || nbf > now + 30))
  ) {
    throw new AuthenticationError();
  }

  const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
  if (userError || !userData.user || userData.user.id !== userId) throw new AuthenticationError();

  return {
    auth: {
      userId,
      clientId,
      scopes: scopeClaim.split(/\s+/).filter(Boolean),
      user: userData.user,
    },
    supabase,
  };
}
