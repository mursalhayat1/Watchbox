
-- ─────────────────────────────────────────────────────────────────────────────
-- Dynamic Sections System
-- Replaces the simple home_sections table with a full-featured sections table
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Migrate existing home_sections data to a temp backup, then drop
CREATE TABLE IF NOT EXISTS _home_sections_backup AS SELECT * FROM home_sections;

-- 2. Drop old table
DROP TABLE IF EXISTS home_sections CASCADE;

-- 3. Create the full sections table
CREATE TABLE sections (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text        NOT NULL,
  description     text,

  -- Section type: dynamic | manual | hybrid
  section_type    text        NOT NULL DEFAULT 'dynamic'
                              CHECK (section_type IN ('dynamic', 'manual', 'hybrid')),

  -- Content type: movie | tv | all
  content_type    text        NOT NULL DEFAULT 'all'
                              CHECK (content_type IN ('movie', 'tv', 'all')),

  -- Status lifecycle
  status          text        NOT NULL DEFAULT 'draft'
                              CHECK (status IN ('draft', 'published', 'scheduled', 'disabled', 'expired')),

  -- Display
  position        integer     NOT NULL DEFAULT 0,
  layout          text        NOT NULL DEFAULT 'carousel'
                              CHECK (layout IN ('carousel', 'large_cards', 'small_cards', 'grid', 'compact_list', 'featured_carousel', 'hero_cards')),
  item_limit      integer     NOT NULL DEFAULT 20,
  display_options jsonb       NOT NULL DEFAULT '{
    "show_title": true,
    "show_rating": true,
    "show_year": true,
    "show_genre": false,
    "show_language": false,
    "show_country": false,
    "show_content_type": true,
    "show_badges": true
  }'::jsonb,

  -- Filters (JSONB for flexibility)
  filters         jsonb       NOT NULL DEFAULT '{}'::jsonb,
  /*
    Example filters structure:
    {
      "logic": "AND",           -- "AND" | "OR"
      "genres": {"include": [28, 878], "exclude": []},
      "languages": {"include": ["en", "ko"], "exclude": []},
      "countries": {"include": ["US"], "exclude": []},
      "keywords": {"include": [1721], "exclude": [], "match": "ANY"},
      "rating": {"min": 7.0, "max": 10.0},
      "vote_count": {"min": 200, "max": null},
      "popularity": {"min": null, "max": null},
      "release_date": {"preset": "last_year", "from": null, "to": null},
      "runtime": {"min": null, "max": null},
      "actors": {"include": [123], "exclude": []},
      "directors": {"include": [], "exclude": []},
      "collections": []
    }
  */

  -- Sorting
  sort_by         text        NOT NULL DEFAULT 'popularity'
                              CHECK (sort_by IN (
                                'popularity', 'top_rated', 'trending_today', 'trending_week',
                                'trending_month', 'most_watched', 'recently_added',
                                'recently_updated', 'newest_release', 'oldest_release',
                                'highest_vote_count', 'lowest_vote_count', 'az', 'za',
                                'random', 'relevance'
                              )),
  sort_direction  text        NOT NULL DEFAULT 'desc'
                              CHECK (sort_direction IN ('asc', 'desc')),
  -- Min votes required for top_rated sort (prevents low-vote dominance)
  min_vote_count  integer,

  -- Manual / Hybrid: ordered list of TMDB IDs
  pinned_items    jsonb       NOT NULL DEFAULT '[]'::jsonb,
  /*
    [{tmdb_id: 550, media_type: "movie", title: "Fight Club", poster_path: "/path.jpg"}]
  */
  excluded_items  jsonb       NOT NULL DEFAULT '[]'::jsonb,
  /* same structure as pinned_items */

  -- Scheduling
  start_at        timestamptz,
  end_at          timestamptz,

  -- Metadata
  section_label   text,       -- optional override for the sub-label shown above title
  view_all_link   text,

  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- 4. Indexes
CREATE INDEX idx_sections_status   ON sections (status);
CREATE INDEX idx_sections_position ON sections (position);
CREATE INDEX idx_sections_start_at ON sections (start_at) WHERE start_at IS NOT NULL;
CREATE INDEX idx_sections_end_at   ON sections (end_at)   WHERE end_at   IS NOT NULL;

-- 5. Auto-update updated_at
CREATE OR REPLACE FUNCTION sections_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sections_updated_at
  BEFORE UPDATE ON sections
  FOR EACH ROW EXECUTE FUNCTION sections_set_updated_at();

-- 6. RLS
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;

-- Public/authenticated: read only published sections (status = 'published' OR auto-active scheduled)
CREATE POLICY "sections_public_select" ON sections
  FOR SELECT
  USING (
    status = 'published'
    OR (
      status = 'scheduled'
      AND start_at IS NOT NULL
      AND start_at <= now()
      AND (end_at IS NULL OR end_at > now())
    )
  );

-- Admins: full access
CREATE POLICY "sections_admin_select" ON sections
  FOR SELECT
  USING (is_admin());

CREATE POLICY "sections_admin_insert" ON sections
  FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "sections_admin_update" ON sections
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "sections_admin_delete" ON sections
  FOR DELETE
  USING (is_admin());

-- 7. Admin RPC — list all sections (admin only, no RLS filter)
CREATE OR REPLACE FUNCTION admin_list_sections()
RETURNS SETOF sections
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF get_user_role(auth.uid()) <> 'admin' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  RETURN QUERY SELECT * FROM sections ORDER BY position ASC, created_at ASC;
END;
$$;

-- 8. Admin RPC — reorder sections (bulk position update)
CREATE OR REPLACE FUNCTION admin_reorder_sections(p_ids uuid[], p_positions integer[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  i integer;
BEGIN
  IF get_user_role(auth.uid()) <> 'admin' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  FOR i IN 1..array_length(p_ids, 1) LOOP
    UPDATE sections SET position = p_positions[i] WHERE id = p_ids[i];
  END LOOP;
END;
$$;

-- 9. Admin RPC — duplicate a section
CREATE OR REPLACE FUNCTION admin_duplicate_section(p_id uuid)
RETURNS sections
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_src  sections;
  v_new  sections;
  v_maxpos integer;
BEGIN
  IF get_user_role(auth.uid()) <> 'admin' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  SELECT * INTO v_src FROM sections WHERE id = p_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Section not found'; END IF;
  SELECT COALESCE(MAX(position), 0) + 10 INTO v_maxpos FROM sections;
  INSERT INTO sections (
    name, description, section_type, content_type, status, position,
    layout, item_limit, display_options, filters, sort_by, sort_direction,
    min_vote_count, pinned_items, excluded_items, start_at, end_at,
    section_label, view_all_link
  ) VALUES (
    v_src.name || ' (Copy)', v_src.description, v_src.section_type,
    v_src.content_type, 'draft', v_maxpos,
    v_src.layout, v_src.item_limit, v_src.display_options,
    v_src.filters, v_src.sort_by, v_src.sort_direction,
    v_src.min_vote_count, v_src.pinned_items, v_src.excluded_items,
    NULL, NULL,
    v_src.section_label, v_src.view_all_link
  )
  RETURNING * INTO v_new;
  RETURN v_new;
END;
$$;

-- 10. Migrate existing data from backup into new schema
INSERT INTO sections (
  name, content_type, section_type, status, position,
  layout, item_limit, filters, sort_by, sort_direction,
  section_label, view_all_link,
  created_at, updated_at
)
SELECT
  b.title,
  CASE
    WHEN b.media_type = 'movie' THEN 'movie'
    WHEN b.media_type = 'tv'    THEN 'tv'
    ELSE 'all'
  END,
  'dynamic',
  CASE WHEN b.enabled THEN 'published' ELSE 'disabled' END,
  b.sort_order,
  'carousel',
  20,
  COALESCE(b.filters, '{}'::jsonb),
  CASE
    WHEN b.source_type = 'trending'  THEN 'trending_week'
    WHEN b.source_type = 'top_rated' THEN 'top_rated'
    ELSE 'popularity'
  END,
  'desc',
  b.section_label,
  b.view_all_link,
  b.created_at,
  b.updated_at
FROM _home_sections_backup b;
