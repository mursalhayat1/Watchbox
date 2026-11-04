-- ═════════════════════════════════════════════════════════════════════════════
-- WatchBox Admin — Commit the production-only admin RPC function definitions
-- Added: 2026-10-27. Recovered (NOT reconstructed) from the connected Supabase
-- project "Watch Box" (hveckbndlnkokfgzrztn) via pg_get_functiondef after the
-- production 403 incident.
--
-- PROBLEM
--   Nine admin dashboard RPC functions existed ONLY in the production database
--   (applied by hand through the dashboard SQL editor, never committed):
--     admin_get_stats, admin_get_user_growth, admin_get_activity,
--     admin_get_top_titles, admin_get_media_distribution,
--     admin_get_status_distribution, admin_get_user_details, admin_update_user,
--     admin_log_action
--   A fresh environment would return PGRST202 "Could not find the function ..."
--   for every one of them.
--
-- WHAT THIS MIGRATION DOES
--   1. Support DDL so the function bodies resolve on fresh environments
--      (public.user_role enum, profiles.role column type, profiles.is_suspended,
--      public.admin_audit_logs + RLS). Every step is guarded/idempotent — on the
--      connected project most steps are no-ops EXCEPT the is_suspended column
--      repair, which is REQUIRED there (verified missing on 2026-10-27, while
--      admin_list_users selects it and admin_update_user writes it).
--   2. Creates the nine functions with their EXACT production governance model:
--      SECURITY DEFINER, SET search_path = public, and the
--      "IF NOT public.is_admin() THEN RAISE EXCEPTION 'Unauthorized'" guard.
--      Each creation is guarded by to_regprocedure — on any environment that
--      already has the function, the definition is left untouched.
--
-- PRESERVED PRODUCTION QUIRKS (intentional — do not "fix" without testing)
--   - admin_get_user_growth is LANGUAGE sql STABLE with NO SECURITY DEFINER
--     (SECURITY INVOKER). It relies on the caller's RLS policies; granting
--     EXECUTE alone is sufficient for admin callers.
--   - admin_update_user casts p_role via p_role::public.user_role and performs
--     no explicit role-value validation and no explicit not-found error.
--   - admin_log_action performs no validation of p_status.
--
-- PROVENANCE NOTE
--   The connected production project records migrations by name in its own
--   schema_migrations with different content for versions 00015..00018 and
--   assigns timestamp versions to MCP-applied migrations (e.g. 20261027032708 =
--   "admin_rpc_function_grants"). This file's numeric name follows the repo's
--   local convention and is next after 00019 (the grants migration).
-- ═════════════════════════════════════════════════════════════════════════════

-- ── 1a. public.user_role enum ───────────────────────────────────────────────
DO $mig$ BEGIN
  IF to_regtype('public.user_role') IS NULL THEN
    EXECUTE 'CREATE TYPE public.user_role AS ENUM (''user'', ''admin'')';
    RAISE NOTICE 'created type public.user_role';
  ELSE
    RAISE NOTICE 'type public.user_role already exists — skipped';
  END IF;
END $mig$;

-- ── 1b. profiles.role column (type + default) ───────────────────────────────
DO $mig$ DECLARE v_count int; BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role'
  ) THEN
    EXECUTE 'ALTER TABLE public.profiles ADD COLUMN role public.user_role NOT NULL DEFAULT ''user''';
    RAISE NOTICE 'added profiles.role (public.user_role)';
  ELSE
    SELECT COUNT(*) INTO v_count
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles'
      AND column_name = 'role' AND udt_name <> 'user_role';
    IF v_count > 0 THEN
      -- legacy/text column: convert safely (values in this codebase are only
      -- 'user' and 'admin')
      EXECUTE 'ALTER TABLE public.profiles ALTER COLUMN role DROP DEFAULT';
      EXECUTE 'ALTER TABLE public.profiles ALTER COLUMN role TYPE public.user_role USING role::text::public.user_role';
      EXECUTE 'ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT ''user''::public.user_role';
      RAISE NOTICE 'converted profiles.role to public.user_role';
    ELSE
      RAISE NOTICE 'profiles.role already public.user_role — skipped';
    END IF;
  END IF;
END $mig$;

-- ── 1c. profiles.is_suspended ───────────────────────────────────────────────
-- Referenced by admin_list_users (SELECT p.is_suspended) and admin_update_user
-- (SET is_suspended = ...). Original prod "admin_dashboard_setup" migration
-- added it; the connected project is missing it (verified 2026-10-27) — this
-- line repairs production AND provisions fresh environments.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_suspended boolean NOT NULL DEFAULT false;

-- ── 2. public.admin_audit_logs (fresh environments) ─────────────────────────
-- Exact live shape on the connected project (verified 2026-10-27): user_id FK
-- to auth.users with ON DELETE SET NULL, status defaults to 'success' with no
-- CHECK constraint, one secondary index on created_at DESC.
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_email text,
  action      text NOT NULL,
  target_type text,
  target_id   text,
  details     jsonb,
  status      text NOT NULL DEFAULT 'success',
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created
  ON public.admin_audit_logs (created_at DESC);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

DO $mig$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'admin_audit_logs'
      AND policyname = 'audit_logs_select_admin'
  ) THEN
    CREATE POLICY audit_logs_select_admin ON public.admin_audit_logs
      FOR SELECT TO authenticated
      USING (public.is_admin());
    RAISE NOTICE 'created policy admin_audit_logs.audit_logs_select_admin';
  ELSE
    RAISE NOTICE 'policy admin_audit_logs.audit_logs_select_admin already exists — skipped';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'admin_audit_logs'
      AND policyname = 'audit_logs_insert_admin'
  ) THEN
    CREATE POLICY audit_logs_insert_admin ON public.admin_audit_logs
      FOR INSERT TO authenticated
      WITH CHECK (public.is_admin());
    RAISE NOTICE 'created policy admin_audit_logs.audit_logs_insert_admin';
  ELSE
    RAISE NOTICE 'policy admin_audit_logs.audit_logs_insert_admin already exists — skipped';
  END IF;
END $mig$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. The nine production-vetted functions (verbatim bodies)
--    Security model on every function: SECURITY DEFINER + SET search_path TO
--    'public' + is_admin() guard (admin_get_user_growth intentionally INVOKER).
--    Least-privilege grants are bundled with each creation, matching
--    00019's posture: no PUBLIC/anon, authenticated only.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── admin_get_stats(p_days integer DEFAULT NULL) — dashboard overview widget ─
DO $mig$ BEGIN
  IF to_regprocedure('public.admin_get_stats(integer)') IS NULL THEN
CREATE OR REPLACE FUNCTION public.admin_get_stats(p_days integer DEFAULT NULL::integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_cutoff timestamptz;
  v_total_users bigint;
  v_new_users bigint;
  v_total_library bigint;
  v_new_library bigint;
  v_total_favorites bigint;
  v_total_watchlist bigint;
  v_total_episode_progress bigint;
  v_watching_users bigint;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  v_cutoff := CASE WHEN p_days IS NOT NULL THEN now() - (p_days || ' days')::interval ELSE NULL END;

  SELECT COUNT(*) INTO v_total_users FROM public.profiles;
  SELECT COUNT(*) INTO v_new_users FROM public.profiles
    WHERE (v_cutoff IS NULL OR created_at >= v_cutoff);

  SELECT COUNT(*) INTO v_total_library FROM public.library_items;
  SELECT COUNT(*) INTO v_new_library FROM public.library_items
    WHERE (v_cutoff IS NULL OR added_at >= v_cutoff);

  SELECT COUNT(*) INTO v_total_favorites FROM public.favorite_items;
  SELECT COUNT(*) INTO v_total_watchlist FROM public.watchlist_items;
  SELECT COUNT(*) INTO v_total_episode_progress FROM public.episode_progress;

  SELECT COUNT(DISTINCT user_id) INTO v_watching_users
    FROM public.library_items WHERE status = 'Watching';

  RETURN jsonb_build_object(
    'total_users', v_total_users,
    'new_users', v_new_users,
    'total_library_items', v_total_library,
    'new_library_items', v_new_library,
    'total_favorites', v_total_favorites,
    'total_watchlist_items', v_total_watchlist,
    'total_episode_progress', v_total_episode_progress,
    'currently_watching_users', v_watching_users
  );
END;
$function$;
    REVOKE ALL ON FUNCTION public.admin_get_stats(integer) FROM PUBLIC, anon;
    GRANT EXECUTE ON FUNCTION public.admin_get_stats(integer) TO authenticated;
    RAISE NOTICE 'created public.admin_get_stats';
  ELSE
    RAISE NOTICE 'public.admin_get_stats already exists — skipped';
  END IF;
END $mig$;

-- ── admin_get_user_growth(p_days integer DEFAULT 30) — user-growth chart ────
-- NOTE: intentionally SECURITY INVOKER (no SECURITY DEFINER), STABLE — this is
-- exactly how it exists in production today.
DO $mig$ BEGIN
  IF to_regprocedure('public.admin_get_user_growth(integer)') IS NULL THEN
CREATE OR REPLACE FUNCTION public.admin_get_user_growth(p_days integer DEFAULT 30)
 RETURNS TABLE(day date, new_users bigint, cumulative_users bigint)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  WITH daily AS (
    SELECT date_trunc('day', created_at)::date AS day,
           COUNT(*) AS cnt
    FROM public.profiles
    WHERE created_at >= now() - (p_days || ' days')::interval
    GROUP BY 1
  ),
  series AS (
    SELECT generate_series(
      (now() - (p_days || ' days')::interval)::date,
      now()::date,
      '1 day'::interval
    )::date AS day
  )
  SELECT
    s.day,
    COALESCE(d.cnt, 0)::bigint AS new_users,
    SUM(COALESCE(d.cnt, 0)) OVER (ORDER BY s.day)::bigint AS cumulative_users
  FROM series s
  LEFT JOIN daily d ON d.day = s.day
  ORDER BY s.day;
$function$;
    REVOKE ALL ON FUNCTION public.admin_get_user_growth(integer) FROM PUBLIC, anon;
    GRANT EXECUTE ON FUNCTION public.admin_get_user_growth(integer) TO authenticated;
    RAISE NOTICE 'created public.admin_get_user_growth';
  ELSE
    RAISE NOTICE 'public.admin_get_user_growth already exists — skipped';
  END IF;
END $mig$;

-- ── admin_get_activity(p_days integer DEFAULT 30) — activity chart ──────────
DO $mig$ BEGIN
  IF to_regprocedure('public.admin_get_activity(integer)') IS NULL THEN
CREATE OR REPLACE FUNCTION public.admin_get_activity(p_days integer DEFAULT 30)
 RETURNS TABLE(day date, library_adds bigint, favorites_adds bigint, watchlist_adds bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH series AS (
    SELECT generate_series(
      (now() - (p_days || ' days')::interval)::date,
      now()::date,
      '1 day'::interval
    )::date AS day
  ),
  lib AS (
    SELECT date_trunc('day', added_at)::date AS day, COUNT(*) AS cnt
    FROM public.library_items
    WHERE added_at >= now() - (p_days || ' days')::interval
    GROUP BY 1
  ),
  fav AS (
    SELECT date_trunc('day', added_at)::date AS day, COUNT(*) AS cnt
    FROM public.favorite_items
    WHERE added_at >= now() - (p_days || ' days')::interval
    GROUP BY 1
  ),
  wl AS (
    SELECT date_trunc('day', added_at)::date AS day, COUNT(*) AS cnt
    FROM public.watchlist_items
    WHERE added_at >= now() - (p_days || ' days')::interval
    GROUP BY 1
  )
  SELECT
    s.day,
    COALESCE(l.cnt, 0)::bigint AS library_adds,
    COALESCE(f.cnt, 0)::bigint AS favorites_adds,
    COALESCE(w.cnt, 0)::bigint AS watchlist_adds
  FROM series s
  LEFT JOIN lib l ON l.day = s.day
  LEFT JOIN fav f ON f.day = s.day
  LEFT JOIN wl  w ON w.day = s.day
  ORDER BY s.day;
$function$;
    REVOKE ALL ON FUNCTION public.admin_get_activity(integer) FROM PUBLIC, anon;
    GRANT EXECUTE ON FUNCTION public.admin_get_activity(integer) TO authenticated;
    RAISE NOTICE 'created public.admin_get_activity';
  ELSE
    RAISE NOTICE 'public.admin_get_activity already exists — skipped';
  END IF;
END $mig$;

-- ── admin_get_top_titles(p_limit, p_media_type) — top-titles widget ─────────
DO $mig$ BEGIN
  IF to_regprocedure('public.admin_get_top_titles(integer,text)') IS NULL THEN
CREATE OR REPLACE FUNCTION public.admin_get_top_titles(p_limit integer DEFAULT 10, p_media_type text DEFAULT NULL::text)
 RETURNS TABLE(tmdb_id integer, title text, media_type text, save_count bigint, poster_path text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    tmdb_id,
    title,
    media_type,
    COUNT(*)::bigint AS save_count,
    MAX(poster_path) AS poster_path
  FROM public.library_items
  WHERE (p_media_type IS NULL OR media_type = p_media_type)
  GROUP BY tmdb_id, title, media_type
  ORDER BY save_count DESC
  LIMIT p_limit;
$function$;
    REVOKE ALL ON FUNCTION public.admin_get_top_titles(integer,text) FROM PUBLIC, anon;
    GRANT EXECUTE ON FUNCTION public.admin_get_top_titles(integer,text) TO authenticated;
    RAISE NOTICE 'created public.admin_get_top_titles';
  ELSE
    RAISE NOTICE 'public.admin_get_top_titles already exists — skipped';
  END IF;
END $mig$;

-- ── admin_get_media_distribution() — media-split chart ──────────────────────
DO $mig$ BEGIN
  IF to_regprocedure('public.admin_get_media_distribution()') IS NULL THEN
CREATE OR REPLACE FUNCTION public.admin_get_media_distribution()
 RETURNS TABLE(media_type text, cnt bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT media_type, COUNT(*)::bigint AS cnt
  FROM public.library_items
  GROUP BY media_type;
$function$;
    REVOKE ALL ON FUNCTION public.admin_get_media_distribution() FROM PUBLIC, anon;
    GRANT EXECUTE ON FUNCTION public.admin_get_media_distribution() TO authenticated;
    RAISE NOTICE 'created public.admin_get_media_distribution';
  ELSE
    RAISE NOTICE 'public.admin_get_media_distribution already exists — skipped';
  END IF;
END $mig$;

-- ── admin_get_status_distribution() — status-split chart ────────────────────
DO $mig$ BEGIN
  IF to_regprocedure('public.admin_get_status_distribution()') IS NULL THEN
CREATE OR REPLACE FUNCTION public.admin_get_status_distribution()
 RETURNS TABLE(status text, cnt bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT status, COUNT(*)::bigint AS cnt
  FROM public.library_items
  GROUP BY status
  ORDER BY cnt DESC;
$function$;
    REVOKE ALL ON FUNCTION public.admin_get_status_distribution() FROM PUBLIC, anon;
    GRANT EXECUTE ON FUNCTION public.admin_get_status_distribution() TO authenticated;
    RAISE NOTICE 'created public.admin_get_status_distribution';
  ELSE
    RAISE NOTICE 'public.admin_get_status_distribution already exists — skipped';
  END IF;
END $mig$;

-- ── admin_get_user_details(p_user_id uuid) — users drill-down panel ─────────
DO $mig$ BEGIN
  IF to_regprocedure('public.admin_get_user_details(uuid)') IS NULL THEN
CREATE OR REPLACE FUNCTION public.admin_get_user_details(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_profile jsonb;
  v_library_count bigint;
  v_favorites_count bigint;
  v_watchlist_count bigint;
  v_watching_count bigint;
  v_completed_count bigint;
  v_episode_count bigint;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT to_jsonb(p) INTO v_profile
  FROM public.profiles p WHERE id = p_user_id;

  SELECT COUNT(*) INTO v_library_count FROM public.library_items WHERE user_id = p_user_id;
  SELECT COUNT(*) INTO v_favorites_count FROM public.favorite_items WHERE user_id = p_user_id;
  SELECT COUNT(*) INTO v_watchlist_count FROM public.watchlist_items WHERE user_id = p_user_id;
  SELECT COUNT(*) INTO v_watching_count FROM public.library_items WHERE user_id = p_user_id AND status = 'Watching';
  SELECT COUNT(*) INTO v_completed_count FROM public.library_items WHERE user_id = p_user_id AND status = 'Completed';
  SELECT COUNT(*) INTO v_episode_count FROM public.episode_progress WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'profile', v_profile,
    'library_count', v_library_count,
    'favorites_count', v_favorites_count,
    'watchlist_count', v_watchlist_count,
    'watching_count', v_watching_count,
    'completed_count', v_completed_count,
    'episode_progress_count', v_episode_count
  );
END;
$function$;
    REVOKE ALL ON FUNCTION public.admin_get_user_details(uuid) FROM PUBLIC, anon;
    GRANT EXECUTE ON FUNCTION public.admin_get_user_details(uuid) TO authenticated;
    RAISE NOTICE 'created public.admin_get_user_details';
  ELSE
    RAISE NOTICE 'public.admin_get_user_details already exists — skipped';
  END IF;
END $mig$;

-- ── admin_update_user(p_user_id, p_is_suspended, p_role) — user mgmt action ─
DO $mig$ BEGIN
  IF to_regprocedure('public.admin_update_user(uuid,boolean,text)') IS NULL THEN
CREATE OR REPLACE FUNCTION public.admin_update_user(p_user_id uuid, p_is_suspended boolean DEFAULT NULL::boolean, p_role text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot modify your own account';
  END IF;

  UPDATE public.profiles
  SET
    is_suspended = COALESCE(p_is_suspended, is_suspended),
    role = COALESCE(p_role::public.user_role, role),
    updated_at = now()
  WHERE id = p_user_id;
END;
$function$;
    REVOKE ALL ON FUNCTION public.admin_update_user(uuid,boolean,text) FROM PUBLIC, anon;
    GRANT EXECUTE ON FUNCTION public.admin_update_user(uuid,boolean,text) TO authenticated;
    RAISE NOTICE 'created public.admin_update_user';
  ELSE
    RAISE NOTICE 'public.admin_update_user already exists — skipped';
  END IF;
END $mig$;

-- ── admin_log_action(...) — audit-trail recorder ────────────────────────────
DO $mig$ BEGIN
  IF to_regprocedure('public.admin_log_action(text,text,text,jsonb,text)') IS NULL THEN
CREATE OR REPLACE FUNCTION public.admin_log_action(p_action text, p_target_type text DEFAULT NULL::text, p_target_id text DEFAULT NULL::text, p_details jsonb DEFAULT NULL::jsonb, p_status text DEFAULT 'success'::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  INSERT INTO public.admin_audit_logs(admin_id, admin_email, action, target_type, target_id, details, status)
  SELECT
    auth.uid(),
    p.email,
    p_action,
    p_target_type,
    p_target_id,
    p_details,
    p_status
  FROM public.profiles p WHERE p.id = auth.uid();
END;
$function$;
    REVOKE ALL ON FUNCTION public.admin_log_action(text,text,text,jsonb,text) FROM PUBLIC, anon;
    GRANT EXECUTE ON FUNCTION public.admin_log_action(text,text,text,jsonb,text) TO authenticated;
    RAISE NOTICE 'created public.admin_log_action';
  ELSE
    RAISE NOTICE 'public.admin_log_action already exists — skipped';
  END IF;
END $mig$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. Final EXECUTE pass — resolves grants for ALL admin_% functions present
--    in the catalog, INCLUDING the ones committed by 00015 (admin_list_users,
--    admin_get_watch_data, admin_get_audit_logs, admin_delete_user) and the
--    sections RPCs from 00016. Needed because 00019 (grants) runs BEFORE the
--    functions it covers exist on a fresh environment. Idempotent.
-- ═══════════════════════════════════════════════════════════════════════════

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;

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
    EXCEPTION
      WHEN insufficient_privilege THEN
        RAISE WARNING 'skipped public.% (ownership/privilege issue): %', r.proname, SQLERRM;
    END;
  END LOOP;
  RAISE NOTICE 'final admin function grant pass completed: % functions', v_count;
END
$$;
