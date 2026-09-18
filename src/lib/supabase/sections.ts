/**
 * Sections API — client-side data access for the Dynamic Sections system.
 * Admin mutations call SECURITY DEFINER RPCs; public reads hit the table
 * directly (RLS restricts to published/active sections for non-admins).
 */
import { supabase } from './client';

// ── Types ─────────────────────────────────────────────────────────────────────

export type SectionType      = 'dynamic' | 'manual' | 'hybrid';
export type SectionStatus    = 'draft' | 'published' | 'scheduled' | 'disabled' | 'expired';
export type ContentType      = 'movie' | 'tv' | 'all';
export type LayoutType       = 'carousel' | 'large_cards' | 'small_cards' | 'grid' | 'compact_list' | 'featured_carousel' | 'hero_cards';
export type SortBy =
  | 'popularity' | 'top_rated' | 'trending_today' | 'trending_week' | 'trending_month'
  | 'most_watched' | 'recently_added' | 'recently_updated'
  | 'newest_release' | 'oldest_release' | 'upcoming'
  | 'highest_vote_count' | 'lowest_vote_count'
  | 'az' | 'za' | 'random' | 'relevance';
export type SortDirection = 'asc' | 'desc';
export type ReleaseDatePreset =
  | 'today' | 'this_week' | 'this_month' | 'this_year'
  | 'last_7_days' | 'last_30_days' | 'last_90_days'
  | 'last_6_months' | 'last_year' | 'previous_year' | 'custom' | 'last_x_days';

export interface PinnedItem {
  tmdb_id:     number;
  media_type:  'movie' | 'tv';
  title:       string;
  poster_path: string | null;
}

export interface SectionFilters {
  logic?:       'AND' | 'OR';
  genres?:      { include: number[];  exclude: number[] };
  languages?:   { include: string[];  exclude: string[] };
  countries?:   { include: string[];  exclude: string[] };
  keywords?:    { include: number[];  exclude: number[]; match: 'ANY' | 'ALL' };
  rating?:      { min: number | null; max: number | null };
  vote_count?:  { min: number | null; max: number | null };
  popularity?:  { min: number | null; max: number | null };
  release_date?: {
    preset?:    ReleaseDatePreset | null;
    from?:      string | null;
    to?:        string | null;
    last_x?:    number | null; // used when preset = 'last_x_days'
  };
  runtime?:     { min: number | null; max: number | null };
  actors?:      { include: number[];  exclude: number[] };
  directors?:   { include: number[];  exclude: number[] };
  collections?: number[];
}

export interface DisplayOptions {
  show_title:        boolean;
  show_rating:       boolean;
  show_year:         boolean;
  show_genre:        boolean;
  show_language:     boolean;
  show_country:      boolean;
  show_content_type: boolean;
  show_badges:       boolean;
}

export const DEFAULT_DISPLAY_OPTIONS: DisplayOptions = {
  show_title:        true,
  show_rating:       true,
  show_year:         true,
  show_genre:        false,
  show_language:     false,
  show_country:      false,
  show_content_type: true,
  show_badges:       true,
};

export interface Section {
  id:              string;
  name:            string;
  description:     string | null;
  section_type:    SectionType;
  content_type:    ContentType;
  status:          SectionStatus;
  position:        number;
  layout:          LayoutType;
  item_limit:      number;
  display_options: DisplayOptions;
  filters:         SectionFilters;
  sort_by:         SortBy;
  sort_direction:  SortDirection;
  min_vote_count:  number | null;
  pinned_items:    PinnedItem[];
  excluded_items:  PinnedItem[];
  start_at:        string | null;
  end_at:          string | null;
  section_label:   string | null;
  view_all_link:   string | null;
  created_at:      string;
  updated_at:      string;
}

export type SectionInsert = Omit<Section, 'id' | 'created_at' | 'updated_at'>;
export type SectionUpdate = Partial<SectionInsert>;

// ── Helpers ───────────────────────────────────────────────────────────────────

function coerce(row: unknown): Section {
  const s = row as Record<string, unknown>;
  const base = { ...s } as unknown as Section;
  return {
    ...base,
    display_options: (s.display_options as DisplayOptions) ?? DEFAULT_DISPLAY_OPTIONS,
    filters:         (s.filters        as SectionFilters)  ?? {},
    pinned_items:    (s.pinned_items   as PinnedItem[])    ?? [],
    excluded_items:  (s.excluded_items as PinnedItem[])    ?? [],
  };
}

// ── Public reads ──────────────────────────────────────────────────────────────

/** Fetch active sections for the homepage (respects RLS — no auth needed). */
export async function getActiveSections(): Promise<Section[]> {
  const { data, error } = await supabase
    .from('sections')
    .select('*')
    .order('position', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(coerce);
}

/** Fetch a single section by ID (public). */
export async function getSection(id: string): Promise<Section | null> {
  const { data, error } = await supabase
    .from('sections')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data ? coerce(data) : null;
}

// ── Admin reads ───────────────────────────────────────────────────────────────

/** Admin: list ALL sections regardless of status (calls SECURITY DEFINER RPC). */
export async function adminListSections(): Promise<Section[]> {
  const { data, error } = await supabase.rpc('admin_list_sections');
  if (error) throw error;
  return (data ?? []).map(coerce);
}

// ── Admin writes ──────────────────────────────────────────────────────────────

/** Create a new section (admin). */
export async function adminCreateSection(payload: SectionInsert): Promise<Section> {
  const { data, error } = await supabase
    .from('sections')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return coerce(data);
}

/** Update a section (admin). */
export async function adminUpdateSection(id: string, payload: SectionUpdate): Promise<Section> {
  const { data, error } = await supabase
    .from('sections')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return coerce(data);
}

/** Delete a section (admin). */
export async function adminDeleteSection(id: string): Promise<void> {
  const { error } = await supabase.from('sections').delete().eq('id', id);
  if (error) throw error;
}

/** Duplicate a section (admin). */
export async function adminDuplicateSection(id: string): Promise<Section> {
  const { data, error } = await supabase.rpc('admin_duplicate_section', { p_id: id });
  if (error) throw error;
  return coerce(data);
}

/** Bulk reorder sections (admin). */
export async function adminReorderSections(
  ids: string[],
  positions: number[],
): Promise<void> {
  const { error } = await supabase.rpc('admin_reorder_sections', {
    p_ids:       ids,
    p_positions: positions,
  });
  if (error) throw error;
}

// ── Computed status helper ────────────────────────────────────────────────────

/** Derive the *effective* status accounting for schedule expiry/activation. */
export function effectiveStatus(s: Section): SectionStatus {
  const now = new Date();
  if (s.status === 'expired')  return 'expired';
  if (s.status === 'disabled') return 'disabled';
  if (s.status === 'draft')    return 'draft';
  if (s.status === 'scheduled') {
    if (s.start_at && new Date(s.start_at) <= now) {
      if (!s.end_at || new Date(s.end_at) > now) return 'published';
    }
    return 'scheduled';
  }
  if (s.status === 'published') {
    if (s.end_at && new Date(s.end_at) <= now) return 'expired';
    return 'published';
  }
  return s.status;
}

// ── Presets ───────────────────────────────────────────────────────────────────

export interface SectionPreset {
  key:      string;
  label:    string;
  config:   Partial<SectionInsert>;
}

export const SECTION_PRESETS: SectionPreset[] = [
  {
    key: 'trending_now',
    label: 'Trending Now',
    config: {
      name: 'Trending Now', content_type: 'all', sort_by: 'trending_week',
      filters: {}, section_type: 'dynamic', layout: 'carousel', item_limit: 20,
    },
  },
  {
    key: 'top_rated',
    label: 'Top Rated',
    config: {
      name: 'Top Rated', content_type: 'all', sort_by: 'top_rated',
      filters: { vote_count: { min: 500, max: null } },
      section_type: 'dynamic', layout: 'carousel', item_limit: 20, min_vote_count: 500,
    },
  },
  {
    key: 'new_releases',
    label: 'New Releases',
    config: {
      name: 'New Releases', content_type: 'all', sort_by: 'newest_release',
      filters: { release_date: { preset: 'last_90_days' } },
      section_type: 'dynamic', layout: 'carousel', item_limit: 20,
    },
  },
  {
    key: 'popular_movies',
    label: 'Popular Movies',
    config: {
      name: 'Popular Movies', content_type: 'movie', sort_by: 'popularity',
      filters: {}, section_type: 'dynamic', layout: 'carousel', item_limit: 20,
    },
  },
  {
    key: 'popular_tv',
    label: 'Popular TV Shows',
    config: {
      name: 'Popular TV Shows', content_type: 'tv', sort_by: 'popularity',
      filters: {}, section_type: 'dynamic', layout: 'carousel', item_limit: 20,
    },
  },
  {
    key: 'korean_movies',
    label: 'Korean Movies',
    config: {
      name: 'Korean Movies', content_type: 'movie', sort_by: 'popularity',
      filters: { languages: { include: ['ko'], exclude: [] } },
      section_type: 'dynamic', layout: 'carousel', item_limit: 20,
    },
  },
  {
    key: 'japanese_movies',
    label: 'Japanese Movies',
    config: {
      name: 'Japanese Movies', content_type: 'movie', sort_by: 'popularity',
      filters: { languages: { include: ['ja'], exclude: [] } },
      section_type: 'dynamic', layout: 'carousel', item_limit: 20,
    },
  },
  {
    key: 'hindi_movies',
    label: 'Hindi Movies',
    config: {
      name: 'Hindi Movies', content_type: 'movie', sort_by: 'popularity',
      filters: { languages: { include: ['hi'], exclude: [] } },
      section_type: 'dynamic', layout: 'carousel', item_limit: 20,
    },
  },
  {
    key: 'action_movies',
    label: 'Action Movies',
    config: {
      name: 'Action Movies', content_type: 'movie', sort_by: 'popularity',
      filters: { genres: { include: [28], exclude: [] } },
      section_type: 'dynamic', layout: 'carousel', item_limit: 20,
    },
  },
  {
    key: 'scifi_movies',
    label: 'Sci-Fi Movies',
    config: {
      name: 'Sci-Fi Movies', content_type: 'movie', sort_by: 'popularity',
      filters: { genres: { include: [878], exclude: [] } },
      section_type: 'dynamic', layout: 'carousel', item_limit: 20,
    },
  },
  {
    key: 'highly_rated',
    label: 'Highly Rated',
    config: {
      name: 'Highly Rated', content_type: 'all', sort_by: 'top_rated',
      filters: { rating: { min: 8.0, max: null }, vote_count: { min: 1000, max: null } },
      section_type: 'dynamic', layout: 'carousel', item_limit: 20, min_vote_count: 1000,
    },
  },
  {
    key: 'most_watched',
    label: 'Most Watched',
    config: {
      name: 'Most Watched', content_type: 'all', sort_by: 'most_watched',
      filters: {}, section_type: 'dynamic', layout: 'carousel', item_limit: 20,
    },
  },
];
