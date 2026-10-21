# Watchbox MCP server and Manus deployment

## Current status and safety boundary

The repository now includes an official TypeScript MCP SDK Streamable HTTP server, a Supabase Auth token verifier, schema-validated Watchbox tools, a user-token-scoped Supabase repository, a consent page, and fixture-only protocol tests. It never uses a service-role key. The server is configured to fail closed until OAuth client IDs are explicitly allow-listed.

OpenCode is preconfigured in the project-level [`opencode.json`](../opencode.json). See the [OpenCode setup section](MCP_SETUP.md#opencode) for the Supabase OAuth client registration and local sign-in steps.

**Do not publish a Supabase-connected public release until the live database RLS state is checked and the owner approves any required fix.** Migrations 00002–00015 create the permissive policies `library_all`, `anon_watchlist`, and `anon_favorites` and later account policies do not drop those names. If those migrations were applied as written, the broad policies remain permissive because PostgreSQL ORs permissive policies. The live database could not be inspected. Draft `supabase/migrations/00017_harden_personal_data_rls.sql` only drops those three policies; it changes no rows, but disables anonymous/guest access. It is deliberately unapplied. Review the live policies and test guest behavior before applying it.

The existing app data project and the project hosting a legacy MCP endpoint were not proven to be the same. The legacy endpoint was not modified or claimed as inspected. No Manus-managed database is configured.

## Local development and testing

Install the existing pnpm lockfile and run the website and MCP service separately:

```powershell
pnpm install --frozen-lockfile
pnpm run dev
pnpm run dev:mcp
pnpm run build:server
pnpm run test:mcp
pnpm run build
```

Vite uses the Session preview port supplied by Webdev (currently 5173). The local MCP listener defaults to `http://127.0.0.1:8787/mcp`. `server/dev.ts` reads the ignored root `.env` at runtime only if required values are not already in the process environment. The local static runtime-config sentinel lets Vite continue to use its normal `VITE_*` env fallback; the production server replaces it with dynamic browser-safe values.

The test suite starts an ephemeral loopback server, uses the official MCP SDK client/Streamable HTTP transport, and uses fake users/repositories. It never connects to Supabase or changes real Watchbox records. For interactive Inspector debugging, start the MCP service and run the official Inspector against `http://127.0.0.1:8787/mcp`; a real authenticated inspection still requires valid Supabase OAuth setup and an explicitly allowed OAuth client. Prefer a dedicated test account/project for any manual write check.

## MCP protocol endpoints

- Streamable HTTP MCP endpoint: `POST /mcp` (stateless server; `GET` is not an SSE stream).
- Protected-resource metadata: `GET /.well-known/oauth-protected-resource/mcp` and the compatible root metadata path.
- Browser-safe runtime configuration: `GET /api/runtime-config.js`; `/api/config` is JSON.
- Public read/write capability lookup for the consent screen: `GET /api/oauth/client-permissions?client_id=...`.
- Health: unauthenticated `GET /_app/health`.

The MCP server advertises Supabase as its authorization server. An empty `MCP_READ_CLIENT_IDS` denies all client access; writes are permitted only when a client ID appears in both `MCP_READ_CLIENT_IDS` and `MCP_WRITE_CLIENT_IDS`. Treat those IDs as explicit operator-controlled access configuration, not user arguments. `watchbox_remove_from_watchlist` requires `confirm_remove=true` and only targets one title.

## Runtime values

Supply values through protected Manus runtime configuration; never commit real values in `.env`, the example file, or source code. Never configure a service-role key.

| Name | Purpose | Browser-visible? |
| --- | --- | --- |
| `SUPABASE_URL` | Existing data-owning Supabase URL; also used by the frontend runtime config. | Yes, project URL. |
| `SUPABASE_ANON_KEY` | Existing anon/publishable browser-safe key used for RLS-scoped data access. | Yes, public client key. |
| `TMDB_API_KEY` | Existing movie/TV API integration; the current client app also uses it. | Yes, this current frontend integration exposes it to browsers. |
| `MCP_PUBLIC_URL` | Exact canonical published HTTPS origin, no path or trailing slash; required for absolute OAuth metadata. | Yes, origin only. |
| `MCP_READ_CLIENT_IDS` | Comma-separated, explicitly allowed OAuth `client_id` values. Empty means deny all. | No. |
| `MCP_WRITE_CLIENT_IDS` | Comma-separated IDs granted write access; must also be read-allowed. | No. |
| `VITE_APP_ID` | Optional display/configuration value used by existing admin pages. | Yes. |

The actual Supabase OAuth client IDs are not known until a client registers. Start with empty access lists; add only reviewed client IDs after registration. Leave `MCP_WRITE_CLIENT_IDS` empty for read-only access. The `PORT` variable is platform supplied in production; the server listens on 3000 only as a local/default fallback.

During local development, `server/dev.ts` uses `WATCHBOX_MCP_CLIENT_ID` as `MCP_READ_CLIENT_IDS` when that variable is empty, so the OpenCode client can be allow-listed once instead of twice. Production always requires an explicit `MCP_READ_CLIENT_IDS`; the convenience does not apply when `NODE_ENV=production`.

## Required Supabase OAuth configuration

These settings are external to this repository and are not active until checked/configured in the actual data-owning Supabase project:

1. Confirm the Supabase project that owns real Watchbox user data. Do not infer it from the legacy endpoint URL.
2. Enable Supabase Auth OAuth Server and confirm its authorization-server metadata/JWKS endpoints and any allowed dynamic client registration settings.
3. Configure the published Watchbox origin and the `/oauth/consent` authorization path/redirect allowlist using the exact settings supported by the Supabase Dashboard version in use.
4. Confirm the existing login providers and auth callback URLs remain valid for the public site; preserve the current Google/Discord/email behavior.
5. Register the intended MCP client using its supported OAuth 2.1 Authorization Code + PKCE flow. Inspect its verified `client_id`; add it to `MCP_READ_CLIENT_IDS` only after the owner approves that client. Add it to `MCP_WRITE_CLIENT_IDS` only if writes are intended.
6. Validate token issuer, audience, `sub`, `client_id`, expiry/not-before, and current-user checks. The server uses the user's access token plus anon/publishable key so database RLS applies; no client-supplied user ID is trusted.
7. Review effective production policies. The draft migration is not an authorization substitute for checking the live migration state and is not applied automatically by this app or Docker build.
8. Verify that MCP client revocation and token-lifetime behavior match the chosen Supabase OAuth settings. User existence is rechecked per request; JWT access-token validity is ultimately bounded by Supabase token verification/expiry behavior.

See [mcp-auth-references.md](mcp-auth-references.md) for the official Supabase documentation links and the exact repository policy finding.

## Manus hosting contract

The intended hybrid release uses:

- Static build: `corepack enable && corepack prepare pnpm@12.4.2 --activate && pnpm install --frozen-lockfile && pnpm run build`, output `dist/`.
- Container: root `Dockerfile`, built frontend and server, platform `PORT`, health path `/_app/health`.
- Ordered routes: `/api/*`, `/.well-known/*`, `/mcp`, and `/_app/*` to the server; hashed `/assets/*` and stable `/images/*` to static; final `/*` to static with SPA fallback.
- No Manus database. The existing Supabase database remains the source of user data.

Publication must wait for protected runtime values, a known canonical HTTPS origin, verified Supabase OAuth/client setup, and approval/verification of production RLS. A successful local build/test is not a deployed or public website.
