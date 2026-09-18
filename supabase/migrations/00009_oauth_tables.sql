
-- ══════════════════════════════════════════════════════════════════
-- Watchbox OAuth 2.0 tables
-- Supports ChatGPT Web "Sign in with Watchbox" Authorization Code + PKCE flow
-- ══════════════════════════════════════════════════════════════════

-- 1. OAuth clients (registered AI apps, e.g. ChatGPT)
CREATE TABLE IF NOT EXISTS public.oauth_clients (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id            text NOT NULL UNIQUE,
  client_secret_hash   text NOT NULL,           -- bcrypt hash of the secret
  name                 text NOT NULL,
  description          text,
  redirect_uris        text[] NOT NULL DEFAULT '{}',
  allowed_scopes       text[] NOT NULL DEFAULT ARRAY['read','write'],
  logo_url             text,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.oauth_clients ENABLE ROW LEVEL SECURITY;
-- No public access — only service role (edge functions) can touch this
CREATE POLICY "no_public_access" ON public.oauth_clients
  FOR ALL TO anon, authenticated USING (false);

-- 2. OAuth authorization codes (short-lived, PKCE)
CREATE TABLE IF NOT EXISTS public.oauth_auth_codes (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code                 text NOT NULL UNIQUE,
  client_id            text NOT NULL,
  user_id              uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  redirect_uri         text NOT NULL,
  scopes               text[] NOT NULL DEFAULT ARRAY['read','write'],
  code_challenge       text,                    -- PKCE S256
  code_challenge_method text,
  used                 boolean NOT NULL DEFAULT false,
  expires_at           timestamptz NOT NULL DEFAULT (now() + interval '10 minutes'),
  created_at           timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS oauth_auth_codes_code_idx ON public.oauth_auth_codes (code);
CREATE INDEX IF NOT EXISTS oauth_auth_codes_expires_idx ON public.oauth_auth_codes (expires_at);

ALTER TABLE public.oauth_auth_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "no_public_access" ON public.oauth_auth_codes
  FOR ALL TO anon, authenticated USING (false);

-- 3. OAuth access + refresh tokens
CREATE TABLE IF NOT EXISTS public.oauth_tokens (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  access_token_hash    text NOT NULL UNIQUE,    -- SHA-256 hex of the bearer token
  refresh_token_hash   text NOT NULL UNIQUE,    -- SHA-256 hex of the refresh token
  client_id            text NOT NULL,
  user_id              uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scopes               text[] NOT NULL DEFAULT ARRAY['read','write'],
  access_token_expires_at  timestamptz NOT NULL DEFAULT (now() + interval '1 hour'),
  refresh_token_expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  revoked              boolean NOT NULL DEFAULT false,
  created_at           timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS oauth_tokens_access_hash_idx  ON public.oauth_tokens (access_token_hash);
CREATE INDEX IF NOT EXISTS oauth_tokens_refresh_hash_idx ON public.oauth_tokens (refresh_token_hash);
CREATE INDEX IF NOT EXISTS oauth_tokens_user_idx         ON public.oauth_tokens (user_id);
CREATE INDEX IF NOT EXISTS oauth_tokens_expires_idx      ON public.oauth_tokens (access_token_expires_at);

ALTER TABLE public.oauth_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "no_public_access" ON public.oauth_tokens
  FOR ALL TO anon, authenticated USING (false);

-- 4. Cleanup function — called by edge functions periodically
CREATE OR REPLACE FUNCTION public.cleanup_expired_oauth()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  DELETE FROM public.oauth_auth_codes WHERE expires_at < now() OR used = true;
  DELETE FROM public.oauth_tokens     WHERE access_token_expires_at < now() - interval '7 days';
END;
$$;
