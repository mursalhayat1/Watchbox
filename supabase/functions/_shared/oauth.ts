/**
 * Shared OAuth utilities for Watchbox ChatGPT integration.
 * Used by oauth-authorize, oauth-token, oauth-userinfo, and mcp-server functions.
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';

// ── Environment ───────────────────────────────────────────────────────────────

export function getServiceClient() {
  const url = Deno.env.get('SUPABASE_URL')!;
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function getAuthedClient(accessToken: string) {
  const url = Deno.env.get('SUPABASE_URL')!;
  const key = Deno.env.get('SUPABASE_ANON_KEY')!;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

// ── Crypto helpers ────────────────────────────────────────────────────────────

/** SHA-256 hex digest — used for hashing tokens before storage */
export async function sha256Hex(value: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/** PKCE: SHA-256 of the verifier, base64url-encoded */
export async function pkceChallenge(verifier: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(verifier),
  );
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/** Cryptographically random URL-safe token of given byte length */
export function randomToken(bytes = 32): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── CORS ──────────────────────────────────────────────────────────────────────

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type, Accept',
};

export function corsOptions(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

export function oauthError(
  error: string,
  description: string,
  status = 400,
): Response {
  return json({ error, error_description: description }, status);
}

// ── Token validation ──────────────────────────────────────────────────────────

export interface TokenContext {
  userId: string;
  clientId: string;
  scopes: string[];
}

/**
 * Validate an OAuth Bearer token from Authorization header.
 * Returns TokenContext — userId is always derived from the token, never from caller input.
 */
export async function validateBearerToken(
  authHeader: string | null,
): Promise<TokenContext> {
  if (!authHeader?.startsWith('Bearer ')) {
    throw { status: 401, error: 'invalid_token', description: 'Missing or malformed Authorization header.' };
  }
  const rawToken = authHeader.slice(7).trim();
  const tokenHash = await sha256Hex(rawToken);

  const db = getServiceClient();
  const { data, error } = await db
    .from('oauth_tokens')
    .select('user_id, client_id, scopes, access_token_expires_at, revoked')
    .eq('access_token_hash', tokenHash)
    .maybeSingle();

  if (error || !data) {
    throw { status: 401, error: 'invalid_token', description: 'Token not found.' };
  }
  if (data.revoked) {
    throw { status: 401, error: 'invalid_token', description: 'Token has been revoked.' };
  }
  if (new Date(data.access_token_expires_at) < new Date()) {
    throw { status: 401, error: 'invalid_token', description: 'Token has expired.' };
  }

  return { userId: data.user_id, clientId: data.client_id, scopes: data.scopes };
}

// ── Client validation ─────────────────────────────────────────────────────────

export interface OAuthClient {
  client_id: string;
  client_secret_hash: string;
  name: string;
  redirect_uris: string[];
  allowed_scopes: string[];
  is_public: boolean;
  token_endpoint_auth_method: string;
}

export async function getOAuthClient(clientId: string): Promise<OAuthClient | null> {
  const db = getServiceClient();
  const { data } = await db
    .from('oauth_clients')
    .select('client_id, client_secret_hash, name, redirect_uris, allowed_scopes, is_public, token_endpoint_auth_method')
    .eq('client_id', clientId)
    .maybeSingle();
  return data as OAuthClient | null;
}

export function isValidRedirectUri(client: OAuthClient, redirectUri: string): boolean {
  return client.redirect_uris.includes(redirectUri);
}
