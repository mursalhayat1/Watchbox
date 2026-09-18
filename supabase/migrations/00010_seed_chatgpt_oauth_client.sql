
-- Seed the ChatGPT OAuth client registration.
-- client_secret_hash is SHA-256 of the secret stored in Supabase Vault (OAUTH_CLIENT_SECRET).
-- The plaintext secret is injected via the OAUTH_CLIENT_SECRET env var in Edge Functions only.
-- IMPORTANT: update redirect_uris after ChatGPT App registration to add the real callback URL.
INSERT INTO public.oauth_clients (
  client_id,
  client_secret_hash,
  name,
  description,
  redirect_uris,
  allowed_scopes
) VALUES (
  'chatgpt-watchbox',
  -- SHA-256 of 'REPLACE_WITH_OAUTH_CLIENT_SECRET_AFTER_GENERATION'
  -- Run: echo -n "YOUR_SECRET" | openssl dgst -sha256 to regenerate
  'PLACEHOLDER_REPLACE_WITH_SHA256_OF_YOUR_CLIENT_SECRET',
  'ChatGPT',
  'OpenAI ChatGPT — Watchbox MCP integration',
  ARRAY[
    'https://chatgpt.com/aip/g-PLACEHOLDER/oauth/callback',
    'https://chat.openai.com/aip/g-PLACEHOLDER/oauth/callback'
  ],
  ARRAY['read', 'write']
)
ON CONFLICT (client_id) DO UPDATE SET
  name        = EXCLUDED.name,
  description = EXCLUDED.description;
