
-- ═══════════════════════════════════════════════════════════════════════════
-- WatchBox Admin — RLS Policies + Missing Admin RPCs
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Enable RLS on every user-data table ───────────────────────────────────
ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE actor_favorites   ENABLE ROW LEVEL SECURITY;
ALTER TABLE episode_progress  ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_sections     ENABLE ROW LEVEL SECURITY;

-- ── Helper: is the current session an admin? ──────────────────────────────
-- SECURITY DEFINER so it bypasses RLS on profiles
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ── profiles ──────────────────────────────────────────────────────────────
CREATE POLICY profiles_select_own
  ON profiles FOR SELECT
  USING (auth.uid() = id OR is_admin());

CREATE POLICY profiles_update_own
  ON profiles FOR UPDATE
  USING (auth.uid() = id OR is_admin())
  WITH CHECK (auth.uid() = id OR is_admin());

CREATE POLICY profiles_insert_own
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY profiles_delete_admin
  ON profiles FOR DELETE
  USING (is_admin());

-- ── library_items ─────────────────────────────────────────────────────────
CREATE POLICY library_items_select
  ON library_items FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY library_items_insert
  ON library_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY library_items_update
  ON library_items FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY library_items_delete
  ON library_items FOR DELETE
  USING (auth.uid() = user_id OR is_admin());

-- ── favorite_items ────────────────────────────────────────────────────────
CREATE POLICY favorite_items_select
  ON favorite_items FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY favorite_items_insert
  ON favorite_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY favorite_items_delete
  ON favorite_items FOR DELETE
  USING (auth.uid() = user_id OR is_admin());

-- ── watchlist_items ───────────────────────────────────────────────────────
CREATE POLICY watchlist_items_select
  ON watchlist_items FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY watchlist_items_insert
  ON watchlist_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY watchlist_items_delete
  ON watchlist_items FOR DELETE
  USING (auth.uid() = user_id OR is_admin());

-- ── actor_favorites ───────────────────────────────────────────────────────
CREATE POLICY actor_favorites_select
  ON actor_favorites FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY actor_favorites_insert
  ON actor_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY actor_favorites_delete
  ON actor_favorites FOR DELETE
  USING (auth.uid() = user_id OR is_admin());

-- ── episode_progress ──────────────────────────────────────────────────────
CREATE POLICY episode_progress_select
  ON episode_progress FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY episode_progress_insert
  ON episode_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY episode_progress_update
  ON episode_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY episode_progress_delete
  ON episode_progress FOR DELETE
  USING (auth.uid() = user_id OR is_admin());

-- ── admin_audit_logs ──────────────────────────────────────────────────────
CREATE POLICY audit_logs_select_admin
  ON admin_audit_logs FOR SELECT
  USING (is_admin());

-- inserts only via admin_log_action() SECURITY DEFINER, no direct INSERT policy needed
-- but we need one for the function itself to insert
CREATE POLICY audit_logs_insert_admin
  ON admin_audit_logs FOR INSERT
  WITH CHECK (is_admin());

-- ── home_sections ─────────────────────────────────────────────────────────
CREATE POLICY home_sections_select_all
  ON home_sections FOR SELECT
  USING (true);

CREATE POLICY home_sections_write_admin
  ON home_sections FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ═══════════════════════════════════════════════════════════════════════════
-- New admin RPCs needed by the dashboard
-- ═══════════════════════════════════════════════════════════════════════════

-- admin_list_users: paginated user list with per-user counts
CREATE OR REPLACE FUNCTION public.admin_list_users(
  p_search   text    DEFAULT NULL,
  p_limit    int     DEFAULT 20,
  p_offset   int     DEFAULT 0,
  p_sort_by  text    DEFAULT 'created_at',
  p_sort_dir text    DEFAULT 'desc'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total bigint;
  v_rows  jsonb;
BEGIN
  IF get_user_role(auth.uid()) <> 'admin' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- total count for pagination
  SELECT COUNT(*) INTO v_total
  FROM profiles p
  WHERE p_search IS NULL
     OR p.email ILIKE '%' || p_search || '%'
     OR p.full_name ILIKE '%' || p_search || '%'
     OR p.username ILIKE '%' || p_search || '%';

  SELECT jsonb_agg(row_to_json(t)) INTO v_rows
  FROM (
    SELECT
      p.id,
      p.email,
      p.full_name,
      p.display_name,
      p.username,
      p.avatar_url,
      p.provider_avatar_url,
      p.role,
      p.is_suspended,
      p.onboarded,
      p.created_at,
      p.updated_at,
      COUNT(DISTINCT li.id)   AS library_count,
      COUNT(DISTINCT fi.id)   AS favorites_count,
      COUNT(DISTINCT wi.id)   AS watchlist_count
    FROM profiles p
    LEFT JOIN library_items  li ON li.user_id = p.id
    LEFT JOIN favorite_items fi ON fi.user_id = p.id
    LEFT JOIN watchlist_items wi ON wi.user_id = p.id
    WHERE p_search IS NULL
       OR p.email ILIKE '%' || p_search || '%'
       OR p.full_name ILIKE '%' || p_search || '%'
       OR p.username ILIKE '%' || p_search || '%'
    GROUP BY p.id
    ORDER BY
      CASE WHEN p_sort_by = 'created_at' AND p_sort_dir = 'desc' THEN p.created_at END DESC NULLS LAST,
      CASE WHEN p_sort_by = 'created_at' AND p_sort_dir = 'asc'  THEN p.created_at END ASC  NULLS LAST,
      CASE WHEN p_sort_by = 'email'      AND p_sort_dir = 'desc' THEN p.email      END DESC NULLS LAST,
      CASE WHEN p_sort_by = 'email'      AND p_sort_dir = 'asc'  THEN p.email      END ASC  NULLS LAST,
      p.created_at DESC
    LIMIT p_limit OFFSET p_offset
  ) t;

  RETURN jsonb_build_object(
    'total', v_total,
    'rows',  COALESCE(v_rows, '[]'::jsonb)
  );
END;
$$;

-- admin_get_watch_data: paginated unified watch data
CREATE OR REPLACE FUNCTION public.admin_get_watch_data(
  p_table    text    DEFAULT 'library_items',  -- 'library_items' | 'favorite_items' | 'watchlist_items'
  p_search   text    DEFAULT NULL,
  p_limit    int     DEFAULT 25,
  p_offset   int     DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total bigint;
  v_rows  jsonb;
BEGIN
  IF get_user_role(auth.uid()) <> 'admin' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF p_table = 'library_items' THEN
    SELECT COUNT(*) INTO v_total FROM library_items li
      JOIN profiles p ON p.id = li.user_id
      WHERE p_search IS NULL
         OR li.title ILIKE '%' || p_search || '%'
         OR p.email  ILIKE '%' || p_search || '%';

    SELECT jsonb_agg(row_to_json(t)) INTO v_rows FROM (
      SELECT li.id, li.user_id, p.email AS user_email, p.full_name AS user_name,
             li.tmdb_id, li.title, li.media_type, li.status,
             li.vote_average, li.release_date, li.poster_path, li.added_at, li.updated_at
      FROM library_items li
      JOIN profiles p ON p.id = li.user_id
      WHERE p_search IS NULL
         OR li.title ILIKE '%' || p_search || '%'
         OR p.email  ILIKE '%' || p_search || '%'
      ORDER BY li.added_at DESC
      LIMIT p_limit OFFSET p_offset
    ) t;

  ELSIF p_table = 'favorite_items' THEN
    SELECT COUNT(*) INTO v_total FROM favorite_items fi
      JOIN profiles p ON p.id = fi.user_id
      WHERE p_search IS NULL
         OR fi.title ILIKE '%' || p_search || '%'
         OR p.email  ILIKE '%' || p_search || '%';

    SELECT jsonb_agg(row_to_json(t)) INTO v_rows FROM (
      SELECT fi.id, fi.user_id, p.email AS user_email, p.full_name AS user_name,
             fi.tmdb_id, fi.title, fi.media_type,
             fi.vote_average, fi.release_date, fi.poster_path, fi.added_at
      FROM favorite_items fi
      JOIN profiles p ON p.id = fi.user_id
      WHERE p_search IS NULL
         OR fi.title ILIKE '%' || p_search || '%'
         OR p.email  ILIKE '%' || p_search || '%'
      ORDER BY fi.added_at DESC
      LIMIT p_limit OFFSET p_offset
    ) t;

  ELSIF p_table = 'watchlist_items' THEN
    SELECT COUNT(*) INTO v_total FROM watchlist_items wi
      JOIN profiles p ON p.id = wi.user_id
      WHERE p_search IS NULL
         OR wi.title ILIKE '%' || p_search || '%'
         OR p.email  ILIKE '%' || p_search || '%';

    SELECT jsonb_agg(row_to_json(t)) INTO v_rows FROM (
      SELECT wi.id, wi.user_id, p.email AS user_email, p.full_name AS user_name,
             wi.tmdb_id, wi.title, wi.media_type,
             wi.vote_average, wi.release_date, wi.poster_path, wi.added_at
      FROM watchlist_items wi
      JOIN profiles p ON p.id = wi.user_id
      WHERE p_search IS NULL
         OR wi.title ILIKE '%' || p_search || '%'
         OR p.email  ILIKE '%' || p_search || '%'
      ORDER BY wi.added_at DESC
      LIMIT p_limit OFFSET p_offset
    ) t;

  ELSE
    RAISE EXCEPTION 'Invalid table name: %', p_table;
  END IF;

  RETURN jsonb_build_object(
    'total', COALESCE(v_total, 0),
    'rows',  COALESCE(v_rows, '[]'::jsonb)
  );
END;
$$;

-- admin_get_audit_logs: paginated audit logs
CREATE OR REPLACE FUNCTION public.admin_get_audit_logs(
  p_limit  int DEFAULT 25,
  p_offset int DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total bigint;
  v_rows  jsonb;
BEGIN
  IF get_user_role(auth.uid()) <> 'admin' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT COUNT(*) INTO v_total FROM admin_audit_logs;

  SELECT jsonb_agg(row_to_json(t)) INTO v_rows FROM (
    SELECT id, admin_id, admin_email, action, target_type, target_id, status, created_at,
           -- exclude sensitive details keys
           (details - ARRAY['token','password','secret','key']) AS details
    FROM admin_audit_logs
    ORDER BY created_at DESC
    LIMIT p_limit OFFSET p_offset
  ) t;

  RETURN jsonb_build_object(
    'total', v_total,
    'rows',  COALESCE(v_rows, '[]'::jsonb)
  );
END;
$$;

-- admin_delete_user: soft delete / full delete
CREATE OR REPLACE FUNCTION public.admin_delete_user(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF get_user_role(auth.uid()) <> 'admin' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot delete your own account';
  END IF;
  -- Remove all user data
  DELETE FROM library_items    WHERE user_id = p_user_id;
  DELETE FROM favorite_items   WHERE user_id = p_user_id;
  DELETE FROM watchlist_items  WHERE user_id = p_user_id;
  DELETE FROM actor_favorites  WHERE user_id = p_user_id;
  DELETE FROM episode_progress WHERE user_id = p_user_id;
  DELETE FROM profiles         WHERE id      = p_user_id;
END;
$$;
