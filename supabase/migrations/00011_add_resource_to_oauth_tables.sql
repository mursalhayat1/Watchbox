-- Add resource column to oauth tables for RFC 8707 resource parameter support
-- This lets tokens be scoped to a specific protected resource (the MCP server URL).

ALTER TABLE public.oauth_auth_codes
  ADD COLUMN IF NOT EXISTS resource text;

ALTER TABLE public.oauth_tokens
  ADD COLUMN IF NOT EXISTS resource text;

COMMENT ON COLUMN public.oauth_auth_codes.resource IS
  'RFC 8707 resource parameter — the protected resource this code was issued for. '
  'Null = legacy code issued before resource parameter support.';

COMMENT ON COLUMN public.oauth_tokens.resource IS
  'RFC 8707 resource parameter — the protected resource this token is bound to. '
  'Null = legacy token; accepted for any resource (backward compat).';
