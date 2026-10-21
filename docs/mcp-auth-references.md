# Supabase OAuth for Watchbox MCP: implementation references

This note records the current official Supabase documentation that informs the Watchbox MCP design. It does not assert that the production Supabase Auth settings are enabled.

## MCP OAuth integration

[Supabase MCP Authentication](https://supabase.com/docs/guides/auth/oauth-server/mcp-authentication) documents using the existing Supabase Auth user base for MCP, with OAuth 2.1 Authorization Code + PKCE, discovery, optional dynamic client registration, explicit user approval, and existing Row Level Security. It recommends the Supabase middleware helpers `withOAuthProtectedResource()` and `withSupabase({ auth: 'user' })` for Edge Functions or fetch-style runtimes so tools receive a user-scoped client. The guide says OAuth Server must first be enabled in the owning Supabase project.

[OAuth Server setup](https://supabase.com/docs/guides/auth/oauth-server/getting-started) documents the project endpoints, site URL plus configured authorization path, Supabase JS authorization consent methods (`getAuthorizationDetails`, `approveAuthorization`, `denyAuthorization`), and optional Dynamic Client Registration. A Watchbox consent page must retain `authorization_id` through login and clearly show the requesting application before approval.

## Permission model

[Token Security and Row Level Security](https://supabase.com/docs/guides/auth/oauth-server/token-security) states that the standard OAuth scopes (`openid`, `email`, `profile`, `phone`) govern identity claims and UserInfo—not database/table access. Supabase OAuth access tokens contain `client_id`, and RLS can use that claim to apply client-specific data permissions. It also documents Custom Access Token Hooks as a way to add trusted client-specific claims. Accordingly, MCP read/write authorization cannot be inferred from OIDC scopes alone; it must be enforced by the server and RLS using a trusted client permission mapping or an equivalent verified mechanism.

[OAuth flows](https://supabase.com/docs/guides/auth/oauth-server/oauth-flows) documents the authorization-code/PKCE and refresh-token flow, token claims, discovery documents, JWKS, and server-side token validation guidance. Watchbox's remote tool server must still enforce its own audience/resource expectations and use the authenticated user token rather than a caller-supplied user ID.

## Configuration not yet verified

The repo's local `supabase/config.toml` currently has no OAuth Server configuration. Production Dashboard settings, OAuth Server enablement, Site URL, authorization path, dynamic registration setting, signing keys, deployed client registrations, and live RLS policies are not inspectable through the available local CLI (its Windows npm shim has no matching binary). These must be verified/configured against the actual data-owning Supabase project before claiming remote OAuth is live.


## Repository security finding — production release blocker

Migration history creates permissive policies named `library_all`, `anon_watchlist`, and `anon_favorites` with `USING (true)` and `WITH CHECK (true)`. Later migrations add account-owned policies but do not drop those exact broad policy names. PostgreSQL permissive policies combine with OR, so the authenticated account policies do not neutralize the earlier broad policies if this migration history was applied as written. The live production policy state cannot be inspected with the available credentials.

A row-preserving draft migration is at `supabase/migrations/00017_harden_personal_data_rls.sql`. It only drops the three identified broad policies and does not modify rows. Applying it will intentionally remove anonymous/guest access to those personal-data tables. **It has not been applied. Do not publish the Supabase-connected public site or claim production user isolation until the owner reviews the live policy state, approves any required migration, and the resulting policies are verified.**

The MCP server does not use a service-role key. It validates Supabase access tokens per request, derives the account ID from the verified user, constrains database operations to that identity, and uses the user's bearer token with the anon/publishable key so RLS applies. OAuth client read/write authorization is fail-closed and requires explicit allowlists; write-capable clients must be deliberately configured.
