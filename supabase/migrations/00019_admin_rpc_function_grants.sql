-- ═════════════════════════════════════════════════════════════════════════════
-- WatchBox Admin — Restore EXECUTE privileges for admin RPC functions
-- Added: 2026-10-27 after production diagnostics.
--
-- PROBLEM
--   Every browser call from the admin dashboard failed with HTTP 403:
--   admin_get_stats, admin_get_activity, admin_get_top_titles,
--   admin_get_media_distribution, admin_get_status_distribution, admin_list_users,
--   ... and any RLS query evaluated through the is_admin() helper.
--
-- ROOT CAUSE (verified by direct PostgREST probes on 2026-10-27)
--   Calling each function with the anon key returned
--     {"code":"42501","message":"permission denied for function <name>"}
--   while truly nonexistent names returned PGRST202 "not found in schema cache".
--   => The functions EXIST, but EXECUTE was never granted to anon/authenticated.
--   Migrations 00015/00016 bundle RLS policies but contain zero GRANT statements,
--   and the connected project runs with hardened default privileges, so new
--   functions are not executable by REST roles until granted explicitly
--   (documented Supabase behavior — see
--    https://supabase.com/docs/guides/api/securing-your-api: "Missing grants
--    cause PostgREST to return a 42501 error. Bundle grants with your RLS setup
--    in the same migration.")
--
-- SAFETY
--   Changes privileges only. Does not alter or recreate any function, table,
--   policy or row. Re-running is idempotent.
--
-- DESIGN
--   1. RLS helper functions are self-gating (they SELECT profiles WHERE
--      auth.uid() = ...), so granting EXECUTE exposes no data:
--        - is_admin()      -> anon + authenticated (policies in 00015/00016 are
--                             not role-qualified and therefore ARE evaluated
--                             under the anon role; auth.uid() is NULL for anon,
--                             so the result is simply false)
--        - get_user_role() -> authenticated (policies in 00002/00003/00004 are
--                             "TO authenticated", and admin RPC guards run
--                             get_user_role inside SECURITY DEFINER functions,
--                             where PostgreSQL grants owner privilege implicitly)
--   2. Every admin_* function: least-privilege, exactly per Supabase docs for
--      admin-ish endpoints:
--        REVOKE ALL from PUBLIC, anon; GRANT EXECUTE to authenticated.
--      Grants are discovered from pg_proc so exact argument signatures are read
--      from the catalog — no signature guessing, and admin_* RPCs that exist
--      only in the connected project (not yet committed as migrations) are
--      covered by the same pass.
--   3. Hardening: future functions created by postgres (dashboard SQL editor)
--      no longer get EXECUTE granted to PUBLIC automatically; each migration
--      that adds an API function must bundle its own GRANTs.
--
-- EXPECTED RESULTS AFTER APPLYING (probe: scripts/diagnostics/admin-rpc-probe.mjs)
--   - As anon (the probe): admin_get_* / admin_list_* still return
--     401 "permission denied for function ..." — now BY DESIGN (least
--     privilege); the anon probe can therefore NOT verify this fix.
--   - profiles queried with the anon key → 200 with an empty array instead of a
--     42501 access error (is_admin is now callable during policy evaluation).
--   - Browser sessions (role=authenticated): /admin dashboard widgets, users,
--     sections, watch data and logs finish loading without 403s — this is the
--     definitive verification. All role checks remain inside the SECURITY
--     DEFINER function bodies; non-admin callers receive a controlled
--     "Unauthorized" exception.
-- ═════════════════════════════════════════════════════════════════════════════

-- ── 1. RLS invoker helpers ──────────────────────────────────────────────────
-- Executed during policy evaluation AS the invoking role, so REST roles need
-- EXECUTE. Bodies are auth.uid()-gated — granting EXECUTE leaks no data.

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;

-- ── 2. All admin_* RPC functions → authenticated only ───────────────────────
-- Covers the RPCs defined by migrations 00015/00016 plus the ones that exist
-- only in the connected project (not yet committed as migrations):
-- admin_get_stats, admin_get_user_growth, admin_get_activity,
-- admin_get_top_titles, admin_get_media_distribution,
-- admin_get_status_distribution, admin_get_user_details, admin_update_user,
-- admin_log_action.

DO $$
DECLARE
  r record;
  v_count int := 0;
BEGIN
  FOR r IN
    SELECT p.proname,
           pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname LIKE 'admin\_%'
      AND p.prokind = 'f'                                  -- plain functions
  LOOP
    BEGIN
      EXECUTE format(
        'REVOKE ALL ON FUNCTION public.%I(%s) FROM PUBLIC, anon', r.proname, r.args);
      EXECUTE format(
        'GRANT EXECUTE ON FUNCTION public.%I(%s) TO authenticated', r.proname, r.args);
      v_count := v_count + 1;
      RAISE NOTICE 'granted EXECUTE on public.%( % ) to authenticated', r.proname, r.args;
    EXCEPTION
      WHEN insufficient_privilege THEN
        RAISE WARNING 'skipped public.% (ownership/privilege issue): %', r.proname, SQLERRM;
    END;
  END LOOP;
  RAISE NOTICE 'admin function grants updated: %', v_count;
END
$$;

-- ── 3. Default privilege hardening ──────────────────────────────────────────
-- Matches the connected project's current posture: functions created in the
-- future stay unexposed via the REST API until their migration grants EXECUTE
-- explicitly (per Supabase "Restrict function execution permissions by role").

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
