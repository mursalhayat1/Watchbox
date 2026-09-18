
-- Support RFC 7591 Dynamic Client Registration
-- Add columns needed for dynamically-registered clients (e.g. Claude)

ALTER TABLE public.oauth_clients
  ADD COLUMN IF NOT EXISTS is_public               boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS token_endpoint_auth_method text NOT NULL DEFAULT 'client_secret_basic',
  ADD COLUMN IF NOT EXISTS client_uri              text,
  ADD COLUMN IF NOT EXISTS grant_types             text[] NOT NULL DEFAULT ARRAY['authorization_code'],
  ADD COLUMN IF NOT EXISTS response_types          text[] NOT NULL DEFAULT ARRAY['code'],
  ADD COLUMN IF NOT EXISTS dynamically_registered  boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS registered_at           timestamptz NOT NULL DEFAULT now();

COMMENT ON COLUMN public.oauth_clients.is_public IS
  'True for public clients (PKCE only, no client_secret required). '
  'False for confidential clients that authenticate with client_secret.';

COMMENT ON COLUMN public.oauth_clients.token_endpoint_auth_method IS
  'RFC 7591 token_endpoint_auth_method: none (public/PKCE), client_secret_post, client_secret_basic.';

COMMENT ON COLUMN public.oauth_clients.dynamically_registered IS
  'True for clients registered via RFC 7591 Dynamic Client Registration endpoint.';
