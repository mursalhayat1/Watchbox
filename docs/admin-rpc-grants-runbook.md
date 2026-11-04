# Admin RPC grants — diagnosis, fix and verification

Date: 2026-10-27 · Trigger: admin dashboard 403s in production · Fix: `supabase/migrations/00019_admin_rpc_function_grants.sql` — **APPLIED to the connected project via Supabase MCP on 2026-10-27 (recorded version `20261027032708`)**

## 1. What was failing

`/admin` dashboard console showed HTTP 403 for every admin API call:

```
.../rest/v1/rpc/admin_get_stats           403
.../rest/v1/rpc/admin_get_activity        403
.../rest/v1/rpc/admin_get_top_titles      403
.../rest/v1/rpc/admin_get_media_distribution  403
.../rest/v1/rpc/admin_get_status_distribution 403
.../rest/v1/rpc/admin_list_users          403
```

## 2. Root cause (evidence-based)

A read-only probe (`scripts/diagnostics/admin-rpc-probe.mjs`, uses the anon key,
prints no secrets) called each RPC directly against the connected project
(`hveckbndlnkokfgzrztn.supabase.co`):

| Probe | Result before fix |
|---|---|
| `admin_get_stats`, `admin_get_activity`, `admin_get_top_titles`, `admin_get_media_distribution`, `admin_get_status_distribution`, `admin_list_users`, `admin_get_user_details`, `admin_get_watch_data`, `admin_get_audit_logs`, `admin_log_action` | `401 42501 permission denied for function <name>` |
| synthetic name that does not exist (`admin_media_distribution`) | `404 PGRST202 "not found in the schema cache"` |
| `GET /rest/v1/profiles?select=id&limit=1` (anon) | `401 42501 permission denied for function is_admin` |

Interpretation: the functions **exist** in the connected project, but no REST
role could **EXECUTE** them — PostgREST maps this SQLSTATE 42501 to 403 for
browser (authenticated) requests. The same defect also breaks RLS policies that
evaluate `is_admin()` (profiles query fails as anon instead of returning rows).
Migrations `00015`/`00016` never contained `GRANT` statements and the project
runs with hardened default privileges, so dashboard-applied SQL left REST roles
without EXECUTE. This exact symptom is documented in Supabase's
"Securing your API" guide (missing grants ⇒ PostgREST 42501).

## 3. The fix

`supabase/migrations/00019_admin_rpc_function_grants.sql` (locally numbered
00019 because the connected project's own recorded `00018` is
`fix_rls_favorites_library_per_user`):

1. `is_admin()` — granted EXECUTE to `anon, authenticated` (self-gating via
   `auth.uid()`; policies from 00015/00016 are evaluated under anon too).
2. `get_user_role(uuid)` — granted EXECUTE to `authenticated` (policies marked
   `TO authenticated`; SECURITY DEFINER admin RPCs call it as their owner).
3. All `public.admin_*` functions — `REVOKE ALL FROM PUBLIC, anon`, then
   `GRANT EXECUTE TO authenticated`. Signatures are discovered from `pg_proc`,
   so this also fixes the nine admin RPCs that exist only in the connected
   project (see §5). Emits a `NOTICE` per function; warnings on skipped ones.
4. Hardening: `ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
   REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC`, so future functions stay hidden
   from the REST API until their migration bundles explicit grants.

Privileges only — no function/table/policy/row is changed; re-running is safe.

## 4. Apply & verify

**Status on the connected project (hveckbndlnkokfgzrztn): ALREADY APPLIED and
committed into its `schema_migrations` via the Supabase MCP `apply_migration`
on 2026-10-27.** MCP-assisted migrations get timestamp versions:
`20261027032708:admin_rpc_function_grants`. The manual steps below are only
needed for OTHER (fresh) environments, where the CLI runs the file as `00019`.

**Apply (choose one):**

- Dashboard: Supabase → SQL Editor → paste the contents of
  `supabase/migrations/00019_admin_rpc_function_grants.sql` → **Run**. Expect
  `NOTICE granted EXECUTE on ...` lines — count should be ≥ 16.
- CLI: `supabase link --project-ref <ref>` (once, needs your access token),
  then `supabase db push`.

**Verify:**

```powershell
node .\scripts\diagnostics\admin-rpc-probe.mjs
```

| Probe | Result after fix |
|---|---|
| `is_admin` | `200 false` (granted; anon evaluates to false) |
| `profiles` direct query (anon) | `200 []` instead of `42501 is_admin` error |
| every `admin_*` probe | still `401 42501 permission denied ...` — **expected**: least privilege now denies anon BY DESIGN |

The anon probe therefore cannot prove the browser fix; the definitive
verification is opening `/admin` in a logged-in admin session: all widgets,
user lists, sections, watch-data and audit logs must load without 403s.
Non-admin users keep getting a controlled `Unauthorized` error because every
admin RPC still checks the role inside its SECURITY DEFINER body.

## 5. Migration integrity — RESOLVED (definitions recovered & committed)

The connected project contained nine admin RPC definitions that **no repository
migration created** (they were applied via dashboard SQL and never committed):
`admin_get_stats`, `admin_get_user_growth`, `admin_get_activity`,
`admin_get_top_titles`, `admin_get_media_distribution`,
`admin_get_status_distribution`, `admin_get_user_details`, `admin_update_user`,
`admin_log_action`.

**RESOLVED 2026-10-27** — via the Supabase MCP, the *live* definitions were
recovered with `pg_get_functiondef()` (not reconstructed from memory) and
committed as `supabase/migrations/00020_admin_production_rpcs.sql`
(MCP record: `20261027033008:admin_production_rpcs`). The file:

- Preserves the live governance model verbatim: SECURITY DEFINER,
  `SET search_path = 'public'`, `IF NOT public.is_admin() THEN RAISE EXCEPTION
  'Unauthorized'` guards. `admin_get_user_growth` is intentionally SECURITY
  INVOKER (STABLE) — that is its real prod state, kept as-is.
- Is fully guarded with `to_regprocedure`: on any database that already has a
  function, the definition is left untouched (so applying it to prod is a
  no-op except for the one repair below).
- Bundles least-privilege grants (REVOKE PUBLIC/anon, GRANT authenticated) per
  function + a final catalog-wide grant pass that also covers 00015/00016
  functions on fresh environments (the grants file runs before them there).
- **Repair applied to production**: live `profiles` was missing
  `is_suspended` (while `admin_list_users` selects it and `admin_update_user`
  writes it, they would have failed with `column does not exist` right after
  the grant fix). `00020` adds `is_suspended boolean NOT NULL DEFAULT false`
  — verified live after applying.
- Also ensures on fresh environments: `public.user_role` enum,
  `profiles.role` typed `public.user_role` (default `'user'`), and
  `admin_audit_logs` (exact live shape: `auth.users` FK `ON DELETE SET NULL`,
  `status text DEFAULT 'success'` without CHECK, index on `created_at DESC`)
  with `is_admin()`-gated select/insert policies.

**Repo-side hardening in the same pass:** `00015_admin_rls_and_rpcs.sql` now
creates `admin_audit_logs` inline (guarded) so `admin_get_audit_logs`/
`admin_log_action` parse on fresh DBs, and guards everything touching
`home_sections` (the repo's 00016 ships the dynamic `sections` system
instead, so `home_sections` never exists on a fresh repo run).

**Production/repo drift noted for the record (not yet reconciled):**

- The prod `schema_migrations` records its own `00015:admin_dashboard_setup`,
  `00016:home_sections`, `00017:fix_home_sections_rls`,
  `00018:fix_rls_favorites_library_per_user` — different content from the repo
  files at those numbers. The dynamic-sections rewrite (repo file 00016) was
  applied to prod *without* a migration record.
- Live prod policies include stacks the repo models differently, e.g.
  `Anyone can read library items` (public SELECT) and session-id-based
  watchlist public policies. Full prod↔repo reconciliation is a separate
  decision (see TODO.md).

## 6. Console noise on the admin page (not bugs)

- `/_vercel/insights|speed-insights/script.js: ERR_BLOCKED_BY_CLIENT` —
  privacy) blocks those scripts locally. Not an app bug; the same requests load
  on clean browsers. Silence the console by pausing the blocker on this site if
  desired.
- `THREE.WebGLRenderer: Context Lost` — the Silk background canvas loses the GPU
  context (background tab / GPU reset). Transient and cosmetic; Silk recreates
  the renderer on demand. If it becomes frequent, wire a `webglcontextlost`
  handler that cancels the render loop and re-renders on `webglcontextrestored`
  — deliberately not bundled with this fix.
