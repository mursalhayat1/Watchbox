/**
 * Section Resolver — translates a Section's rules into TMDB API calls
 * and returns a Movie[] ready for rendering.
 *
 * Design goals:
 * - No N+1 queries: each section = 1-2 TMDB fetches max
 * - Pinned items appear first (manual/hybrid)
 * - Excluded items are stripped
 * - Release date presets computed client-side
 * - Caches results in memory per session to avoid redundant fetches
 */
import type { Section, PinnedItem, SectionFilters } from '@/lib/supabase/sections';
import type { Movie } from '@/services/tmdb';
import { tmdbFetch } from '@/services/tmdb';
export { tmdbImageUrl } from '@/services/tmdb';

// ── In-memory result cache (keyed by section.id + section.updated_at) ─────────
const _cache = new Map<string, { data: Movie[]; ts: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min

function cacheKey(section: Section): string {
  return `${section.id}__${section.updated_at}`;
}

// ── Date preset → ISO range ───────────────────────────────────────────────────
function releaseDateRange(filters: SectionFilters): { from?: string; to?: string } | null {
  const rd = filters.release_date;
  if (!rd) return null;

  const now = new Date();
  const fmt  = (d: Date) => d.toISOString().slice(0, 10);
  const ago  = (days: number) => { const d = new Date(now); d.setDate(d.getDate() - days); return d; };
  const fy   = (d: Date) => { const r = new Date(d); r.setMonth(0, 1); return r; };

  if (rd.preset === 'custom') {
    return { from: rd.from ?? undefined, to: rd.to ?? undefined };
  }
  if (rd.preset === 'last_x_days' && rd.last_x) {
    return { from: fmt(ago(rd.last_x)), to: fmt(now) };
  }

  const map: Record<string, () => { from: string; to: string }> = {
    today:         () => ({ from: fmt(now), to: fmt(now) }),
    this_week:     () => ({ from: fmt(ago(7)), to: fmt(now) }),
    this_month:    () => ({ from: fmt(new Date(now.getFullYear(), now.getMonth(), 1)), to: fmt(now) }),
    this_year:     () => ({ from: fmt(fy(now)), to: fmt(now) }),
    last_7_days:   () => ({ from: fmt(ago(7)), to: fmt(now) }),
    last_30_days:  () => ({ from: fmt(ago(30)), to: fmt(now) }),
    last_90_days:  () => ({ from: fmt(ago(90)), to: fmt(now) }),
    last_6_months: () => ({ from: fmt(ago(180)), to: fmt(now) }),
    last_year:     () => ({ from: fmt(ago(365)), to: fmt(now) }),
    previous_year: () => {
      const py = now.getFullYear() - 1;
      return { from: `${py}-01-01`, to: `${py}-12-31` };
    },
  };

  if (rd.preset && map[rd.preset]) return map[rd.preset]();
  return null;
}

// ── Build TMDB /discover params from SectionFilters ──────────────────────────
function buildDiscoverParams(
  section: Section,
): Record<string, string> {
  const f = section.filters ?? {};
  const params: Record<string, string> = {};

  // Sort
  const sortMap: Record<string, string> = {
    popularity:        'popularity.desc',
    top_rated:         'vote_average.desc',
    trending_week:     'popularity.desc',   // trending uses its own endpoint
    trending_today:    'popularity.desc',
    trending_month:    'popularity.desc',
    newest_release:    section.content_type === 'tv' ? 'first_air_date.desc' : 'primary_release_date.desc',
    oldest_release:    section.content_type === 'tv' ? 'first_air_date.asc'  : 'primary_release_date.asc',
    upcoming:          section.content_type === 'tv' ? 'first_air_date.asc'  : 'primary_release_date.asc',
    highest_vote_count:'vote_count.desc',
    lowest_vote_count: 'vote_count.asc',
    az:                'original_title.asc',
    za:                'original_title.desc',
    recently_added:    'popularity.desc',
    recently_updated:  'popularity.desc',
    most_watched:      'popularity.desc',
    relevance:         'popularity.desc',
    random:            'popularity.desc',
  };
  params.sort_by = sortMap[section.sort_by] ?? 'popularity.desc';
  if (section.sort_direction === 'asc' && params.sort_by.endsWith('.desc')) {
    params.sort_by = params.sort_by.replace('.desc', '.asc');
  }

  // Upcoming: constrain to future release dates (override any user-set date filter)
  if (section.sort_by === 'upcoming') {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const from = tomorrow.toISOString().slice(0, 10);
    if (section.content_type === 'tv') {
      params['first_air_date.gte'] = from;
    } else {
      params['primary_release_date.gte'] = from;
    }
  }

  // Min vote count
  const minVotes = section.min_vote_count ?? (section.sort_by === 'top_rated' ? 200 : undefined);
  if (minVotes) params['vote_count.gte'] = String(minVotes);

  // Genres (include → AND, separator = ','; include OR → '|')
  if (f.genres?.include?.length) {
    const sep = f.logic === 'OR' ? '|' : ',';
    params.with_genres = f.genres.include.join(sep);
  }
  if (f.genres?.exclude?.length) {
    params.without_genres = f.genres.exclude.join(',');
  }

  // Languages
  if (f.languages?.include?.length === 1) {
    params.with_original_language = f.languages.include[0];
  }

  // Countries
  if (f.countries?.include?.length) {
    params.with_origin_country = f.countries.include.join('|');
  }

  // Keywords
  if (f.keywords?.include?.length) {
    const sep = f.keywords.match === 'ALL' ? ',' : '|';
    params.with_keywords = f.keywords.include.join(sep);
  }
  if (f.keywords?.exclude?.length) {
    params.without_keywords = f.keywords.exclude.join(',');
  }

  // Rating
  if (f.rating?.min != null) params['vote_average.gte'] = String(f.rating.min);
  if (f.rating?.max != null) params['vote_average.lte'] = String(f.rating.max);

  // Vote count
  if (f.vote_count?.min != null) params['vote_count.gte'] = String(f.vote_count.min);
  if (f.vote_count?.max != null) params['vote_count.lte'] = String(f.vote_count.max);

  // Popularity
  if (f.popularity?.min != null) params['popularity.gte'] = String(f.popularity.min);
  if (f.popularity?.max != null) params['popularity.lte'] = String(f.popularity.max);

  // Release date
  const dateRange = releaseDateRange(f);
  if (dateRange) {
    if (section.content_type === 'tv') {
      if (dateRange.from) params['first_air_date.gte'] = dateRange.from;
      if (dateRange.to)   params['first_air_date.lte'] = dateRange.to;
    } else {
      if (dateRange.from) params['primary_release_date.gte'] = dateRange.from;
      if (dateRange.to)   params['primary_release_date.lte'] = dateRange.to;
    }
  }

  // Runtime
  if (f.runtime?.min != null) params['with_runtime.gte'] = String(f.runtime.min);
  if (f.runtime?.max != null) params['with_runtime.lte'] = String(f.runtime.max);

  // Cast / Crew (actors/directors are person IDs)
  if (f.actors?.include?.length) {
    params.with_cast = f.actors.include.join(',');
  }
  if (f.directors?.include?.length) {
    params.with_crew = f.directors.include.join(',');
  }

  return params;
}

// ── Fetch dynamic results via TMDB ────────────────────────────────────────────
async function fetchDynamic(section: Section): Promise<Movie[]> {
  const limit = Math.min(section.item_limit, 40);
  const mediaType = section.content_type === 'all' ? 'movie' : section.content_type;
  const results: Movie[] = [];

  // Trending endpoint
  if (
    section.sort_by === 'trending_today' ||
    section.sort_by === 'trending_week' ||
    section.sort_by === 'trending_month'
  ) {
    const window = section.sort_by === 'trending_today' ? 'day' : 'week';
    const tmdbType = section.content_type === 'all' ? 'all' : section.content_type;
    try {
      const res = await tmdbFetch<{ results: Movie[] }>(`/trending/${tmdbType}/${window}`, { page: '1' });
      results.push(...(res.results ?? []));
    } catch { /* ignore */ }
    // For 'all', also fetch page 2 if needed
    if (section.content_type === 'all' && results.length < limit) {
      try {
        const res2 = await tmdbFetch<{ results: Movie[] }>(`/trending/all/${window}`, { page: '2' });
        results.push(...(res2.results ?? []));
      } catch { /* ignore */ }
    }
    return results.slice(0, limit);
  }

  // For 'all' content_type, fetch movies + tv in parallel
  if (section.content_type === 'all') {
    const params = buildDiscoverParams({ ...section, content_type: 'movie' });
    const [movRes, tvRes] = await Promise.allSettled([
      tmdbFetch<{ results: Movie[] }>('/discover/movie', params),
      tmdbFetch<{ results: Movie[] }>('/discover/tv', buildDiscoverParams({ ...section, content_type: 'tv' })),
    ]);
    const movs = movRes.status === 'fulfilled' ? movRes.value.results ?? [] : [];
    const tvs  = tvRes.status  === 'fulfilled' ? tvRes.value.results  ?? [] : [];
    // Interleave: m tv m tv…
    const merged: Movie[] = [];
    const maxLen = Math.max(movs.length, tvs.length);
    for (let i = 0; i < maxLen; i++) {
      if (i < movs.length) merged.push({ ...movs[i], media_type: 'movie' });
      if (i < tvs.length)  merged.push({ ...tvs[i],  media_type: 'tv' });
    }
    return merged.slice(0, limit);
  }

  // Single media type
  const endpoint = mediaType === 'movie' ? '/discover/movie' : '/discover/tv';
  const params = buildDiscoverParams(section);
  try {
    const res = await tmdbFetch<{ results: Movie[] }>(endpoint, params);
    results.push(...((res.results ?? []).map(m => ({
      ...m,
      media_type: mediaType,
    }))));
  } catch { /* ignore */ }

  return results.slice(0, limit);
}

// ── Pinned items → Movie shape ────────────────────────────────────────────────
function pinnedToMovie(p: PinnedItem): Movie {
  return {
    id:           p.tmdb_id,
    title:        p.media_type === 'movie' ? p.title : undefined,
    name:         p.media_type === 'tv'    ? p.title : undefined,
    poster_path:  p.poster_path,
    backdrop_path: null,
    vote_average: 0,
    vote_count:   0,
    genre_ids:    [],
    overview:     '',
    media_type:   p.media_type,
  };
}

// ── Main resolver ─────────────────────────────────────────────────────────────

export async function resolveSection(section: Section): Promise<Movie[]> {
  const key = cacheKey(section);
  const cached = _cache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.data;
  }

  const excludedIds = new Set<string>(
    (section.excluded_items ?? []).map(e => `${e.media_type}:${e.tmdb_id}`)
  );

  const strip = (movies: Movie[]) =>
    movies.filter(m => {
      const mt = m.media_type ?? 'movie';
      return !excludedIds.has(`${mt}:${m.id}`);
    });

  let results: Movie[] = [];

  try {
    if (section.section_type === 'manual') {
      // Manual: only pinned items in order
      results = strip((section.pinned_items ?? []).map(pinnedToMovie));
    } else if (section.section_type === 'hybrid') {
      // Hybrid: pinned first, then dynamic fill
      const pinnedMovies = strip((section.pinned_items ?? []).map(pinnedToMovie));
      const pinnedIds    = new Set(pinnedMovies.map(m => `${m.media_type ?? 'movie'}:${m.id}`));
      const dynamic      = strip(await fetchDynamic(section))
        .filter(m => !pinnedIds.has(`${m.media_type ?? 'movie'}:${m.id}`));
      results = [...pinnedMovies, ...dynamic].slice(0, section.item_limit);
    } else {
      // Dynamic
      results = strip(await fetchDynamic(section)).slice(0, section.item_limit);
    }
  } catch {
    results = [];
  }

  _cache.set(key, { data: results, ts: Date.now() });
  return results;
}

/** Pre-resolve for preview (bypasses cache). */
export async function previewSection(section: Section): Promise<Movie[]> {
  const key = cacheKey(section);
  _cache.delete(key);
  return resolveSection(section);
}

/** Invalidate cache for a section. */
export function invalidateSectionCache(sectionId: string): void {
  for (const k of _cache.keys()) {
    if (k.startsWith(sectionId)) _cache.delete(k);
  }
}

// tmdbImageUrl is already re-exported from the tmdb import at the top of this file.
