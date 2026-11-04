# Watchbox Manus hosting and MCP implementation plan

## Scope and verified project facts

Watchbox is an existing React/Vite/TypeScript SPA using pnpm, Supabase Auth/Postgres, and TMDB. The repository includes the official TypeScript MCP SDK and a legacy Supabase Edge Function OAuth/tool helper, but no deployed MCP Edge Function entrypoint. The legacy helper uses a service-role database client and is not safe to deploy as-is.

The data-owning Supabase project and the project named by the documented legacy MCP endpoint were not proven to be the same. The legacy endpoint's implementation and project configuration were not available for inspection; an unauthenticated public probe returned 401. Leave it untouched and do not claim it was examined.

Migration review found broad permissive policies named `library_all`, `anon_watchlist`, and `anon_favorites` created in migration `00002`. Later migrations create account-owned policies but do not drop those exact names. PostgreSQL permissive policies combine with OR. The actual production policy state, Supabase OAuth Server configuration and provider credentials cannot be inspected through the available local Supabase CLI. A row-preserving draft migration is kept at `supabase/migrations/00017_harden_personal_data_rls.sql` and must not be applied without explicit approval and live-state review. Do not publish a Supabase-connected public site or claim production user isolation while this remains unresolved.

Manus server hosting is already enabled as a one-way capability; the Manus database remains disabled. Preserve the external data project and do not provision duplicate tables or a second database. The required production runtime values must be supplied through the protected Manus configuration card. Never use a service-role key.

## Serving and application approach

Serve the existing Vite SPA as static output and the MCP/API runtime from a single Node container. The static build command uses the committed pnpm 12.4.2 lockfile and outputs `dist/`; the Dockerfile separately compiles the MCP TypeScript server and starts it on the platform `PORT` (3000 fallback). The Node server handles `/mcp`, `/.well-known/*`, `/api/*`, and `/_app/*`; Manus routing sends those paths to the container, sends hashed `/assets/*` to static output with immutable caching, and uses a static SPA fallback for remaining paths. Do not use an all-path container route or create a Manus database.

Inject only browser-safe values from `/api/runtime-config.js`: Supabase project URL, anon/publishable key, TMDB key, site URL and optional app ID. These settings are runtime-provided so secrets are not baked into the Vite artifact. Supabase and TMDB values already used by the frontend are visible to browsers as required by those client integrations; TMDB credentials must never be mistaken for server-only secrets. Never send any service-role credential to the browser.

Preserve the Watchbox design and routes, including `/oauth/consent`. The consent screen uses the existing Supabase JS consent APIs, shows the requesting application and configured Watchbox permissions, and safely preserves the signed-in user's authorization request through login.

## MCP and authorization approach

Use the installed official TypeScript MCP SDK and Zod with a stateless Streamable HTTP transport. The actual protocol server performs MCP initialization, tool discovery/invocation, SDK version negotiation and notifications; it is not a REST imitation. Publish OAuth protected-resource metadata at the MCP well-known paths and identify the existing Supabase Auth issuer. Local Inspector testing uses `server/dev.ts` on 127.0.0.1:8787; the app's Session-local preview remains 127.0.0.1:5173.

For each request, validate the Supabase JWT with `auth.getClaims`, check issuer, audience, authenticated role, expiry/not-before and required `client_id`, then verify the current user with `auth.getUser`. Use the same bearer token and the data project's anon/publishable key for user-scoped database access; derive `user_id` only from the verified user and constrain every repository read/write/delete to that ID. Supabase's OIDC scopes identify user claims, not database permissions; explicit `MCP_READ_CLIENT_IDS` and `MCP_WRITE_CLIENT_IDS` allowlists provide the server-side access boundary. Empty read allowlists fail closed; writers must appear in both lists. No user-ID argument, arbitrary SQL, arbitrary code or bulk deletion tool is exposed.

## Existing Watchbox operations and compatibility

Reuse the inspected tables and fields in `library_items`, `watchlist_items`, `favorite_items`, and `episode_progress`. Library statuses are `Watching`, `Completed`, `Plan to Watch`, `On Hold`, and `Dropped`; ratings are 0–10 in 0.1 increments. The separate browser watchlist helper now reads/updates by authenticated `user_id` when signed in and retains the legacy `session_id` fallback for unsigned sessions. MCP Watchlist writes use the same account ownership constraint. Do not add a replacement library or ownership table.

Tools cover current-user library/search, Watchlist/favorites/statistics, episode progress, TMDB search/discovery, metadata-backed Korean thriller discovery and Korean TV drama ratings, Watchlist add/remove, library add/update, and episode progress writes. Each input is schema-validated; write clients are separately allowlisted; destructive removal is one-item only and requires explicit confirmation.

## Project structure

- `src/`: existing React/Vite client, Supabase Auth/data access, route and runtime-config integration.
- `src/pages/OAuthConsentPage.tsx` and `src/lib/safe-return-path.ts`: Supabase authorization approval/denial and same-origin login return safety.
- `src/lib/runtime-config.ts` and `public/api/runtime-config.js`: runtime-safe browser settings and local Vite fallback.
- `public/manus-routes.json`: complete React page-route inventory, excluding APIs/assets.
- `server/`: Node HTTP server, official MCP SDK transport, Supabase token verification, scoped repository, schema-validated tools, OAuth metadata and health/static handling.
- `tests/`: fixture-only official SDK HTTP tests; never write to real user records.
- `supabase/migrations/00017_harden_personal_data_rls.sql`: draft only; drops three legacy broad policies without touching rows and is not applied.
- `docs/`: OAuth/RLS references, external Supabase setup, local Inspector, configuration and deployment instructions.
- Root `Dockerfile`: pinned pnpm/Node frontend/server build and runtime on platform port.
