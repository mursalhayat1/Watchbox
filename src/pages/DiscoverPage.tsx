import { useState, useCallback, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, X, SlidersHorizontal, ChevronDown, ChevronUp,
  Film, Tv, Sparkles, User, Star, Loader2,
} from 'lucide-react';
import Navbar from '@/components/layouts/Navbar';
import Footer from '@/components/layouts/Footer';
import Silk from '@/components/ui/Silk';
import CarouselRow from '@/components/movie/CarouselRow';
import MovieCard from '@/components/movie/MovieCard';
import MovieCardSkeleton from '@/components/movie/MovieCardSkeleton';
import { useTMDBList } from '@/hooks/useTMDB';
import {
  getTrending, getUpcomingMovies, getTopRated, getPopularTV, getAnime,
  discoverFiltered, getMovieGenres, getTVGenres,
  searchMulti, searchPerson, searchKeywords,
  tmdbImageUrl,
  type Movie, type Genre, type PersonSearchResult, type TMDBKeyword,
} from '@/services/tmdb';
import PageMeta from '@/components/common/PageMeta';
import { generateStaticMetadata } from '@/lib/seo';

// ── Types ─────────────────────────────────────────────────────────────────────
type ContentType = 'all' | 'movies' | 'series' | 'anime';
interface Filters {
  genre: string;
  country: string;
  provider: string;
  year: string;
  sortBy: string;
}
const EMPTY_FILTERS: Filters = { genre: '', country: '', provider: '', year: '', sortBy: 'hottest' };

// ── Static data ───────────────────────────────────────────────────────────────
const PROVIDERS = [
  { value: '8',   label: 'Netflix' },
  { value: '9',   label: 'Prime Video' },
  { value: '337', label: 'Disney+' },
  { value: '350', label: 'Apple TV+' },
  { value: '15',  label: 'Hulu' },
  { value: '1899',label: 'Max' },
  { value: '386', label: 'Peacock' },
  { value: '531', label: 'Paramount+' },
  { value: '283', label: 'Crunchyroll' },
  { value: '2',   label: 'Apple iTunes' },
  { value: '3',   label: 'Google Play' },
];
const COUNTRIES = [
  { value: 'US', label: 'United States' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'KR', label: 'Korea' },
  { value: 'JP', label: 'Japan' },
  { value: 'PK', label: 'Pakistan' },
  { value: 'IN', label: 'India' },
  { value: 'CN', label: 'China' },
  { value: 'FR', label: 'France' },
  { value: 'DE', label: 'Germany' },
  { value: 'TH', label: 'Thailand' },
  { value: 'TR', label: 'Turkey' },
  { value: 'IT', label: 'Italy' },
  { value: 'ES', label: 'Spain' },
];
const YEARS = ['2026','2025','2024','2023','2022','2021','2020','2010s','2000s','1990s','1980s'];
const SORT_OPTIONS = [
  { value: 'hottest',           label: 'Hottest' },
  { value: 'release_date.desc', label: 'Latest' },
  { value: 'vote_average.desc', label: 'Rating' },
  { value: 'popularity.desc',   label: 'Trending' },
];

// ── Glass pill chip ───────────────────────────────────────────────────────────
function Chip({ active, onClick, children }: {
  active: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1 rounded-full text-xs font-medium transition-all duration-150 shrink-0"
      style={active
        ? { background: 'rgba(255,255,255,0.95)', color: '#000' }
        : {
            background: 'rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.65)',
            border: '1px solid rgba(255,255,255,0.13)',
          }
      }
    >
      {children}
    </button>
  );
}

// ── Filter panel ──────────────────────────────────────────────────────────────
interface FilterPanelProps {
  open: boolean;
  filters: Filters;
  setFilter: (k: keyof Filters) => (v: string) => void;
  onReset: () => void;
  movieGenres: Genre[];
  tvGenres: Genre[];
  contentType: ContentType;
}

type FilterSection = 'genre' | 'country' | 'provider' | 'year' | 'sort';

function FilterPanel({ open, filters, setFilter, onReset, movieGenres, tvGenres, contentType }: FilterPanelProps) {
  const [expanded, setExpanded] = useState<Record<FilterSection, boolean>>({
    genre: true, country: true, provider: true, year: true, sort: true,
  });
  const toggle = (s: FilterSection) => setExpanded(p => ({ ...p, [s]: !p[s] }));

  const genres = contentType === 'movies' ? movieGenres : tvGenres;

  if (!open) return null;

  const sectionCls = 'rounded-2xl px-5 py-4 mb-2';
  const sectionStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.10)',
    backdropFilter: 'blur(20px)',
  };
  const headerCls = 'flex items-center justify-between mb-3 cursor-pointer select-none';

  return (
    <div className="mt-3">
      {/* Genre */}
      <div className={sectionCls} style={sectionStyle}>
        <div className={headerCls} onClick={() => toggle('genre')}>
          <span className="flex items-center gap-2 text-sm font-semibold text-white">
            <Film className="w-4 h-4 text-white/50" /> Genre
          </span>
          {expanded.genre ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
        </div>
        {expanded.genre && (
          <div className="flex flex-wrap gap-2">
            <Chip active={!filters.genre} onClick={() => setFilter('genre')('')}>All</Chip>
            {genres.map(g => (
              <Chip key={g.id} active={filters.genre === String(g.id)} onClick={() => setFilter('genre')(String(g.id))}>
                {g.name}
              </Chip>
            ))}
          </div>
        )}
      </div>

      {/* Country */}
      <div className={sectionCls} style={sectionStyle}>
        <div className={headerCls} onClick={() => toggle('country')}>
          <span className="flex items-center gap-2 text-sm font-semibold text-white">
            <span className="w-4 h-4 text-white/50 text-base leading-none">🌐</span> Country
          </span>
          {expanded.country ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
        </div>
        {expanded.country && (
          <div className="flex flex-wrap gap-2">
            <Chip active={!filters.country} onClick={() => setFilter('country')('')}>All</Chip>
            {COUNTRIES.map(c => (
              <Chip key={c.value} active={filters.country === c.value} onClick={() => setFilter('country')(c.value)}>
                {c.label}
              </Chip>
            ))}
          </div>
        )}
      </div>

      {/* Provider */}
      <div className={sectionCls} style={sectionStyle}>
        <div className={headerCls} onClick={() => toggle('provider')}>
          <span className="flex items-center gap-2 text-sm font-semibold text-white">
            <Tv className="w-4 h-4 text-white/50" /> Provider
          </span>
          {expanded.provider ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
        </div>
        {expanded.provider && (
          <div className="flex flex-wrap gap-2">
            <Chip active={!filters.provider} onClick={() => setFilter('provider')('')}>All</Chip>
            {PROVIDERS.map(p => (
              <Chip key={p.value} active={filters.provider === p.value} onClick={() => setFilter('provider')(p.value)}>
                {p.label}
              </Chip>
            ))}
          </div>
        )}
      </div>

      {/* Year */}
      <div className={sectionCls} style={sectionStyle}>
        <div className={headerCls} onClick={() => toggle('year')}>
          <span className="flex items-center gap-2 text-sm font-semibold text-white">
            <span className="w-4 h-4 text-white/50 text-base leading-none">📅</span> Year
          </span>
          {expanded.year ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
        </div>
        {expanded.year && (
          <div className="flex flex-wrap gap-2">
            <Chip active={!filters.year} onClick={() => setFilter('year')('')}>All</Chip>
            {YEARS.map(y => (
              <Chip key={y} active={filters.year === y} onClick={() => setFilter('year')(y)}>
                {y}
              </Chip>
            ))}
          </div>
        )}
      </div>

      {/* Sort by */}
      <div className={sectionCls} style={sectionStyle}>
        <div className={headerCls} onClick={() => toggle('sort')}>
          <span className="flex items-center gap-2 text-sm font-semibold text-white">
            <span className="w-4 h-4 text-white/50 text-base leading-none">↕</span> Sort by
          </span>
          {expanded.sort ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
        </div>
        {expanded.sort && (
          <div className="flex flex-wrap gap-2">
            {SORT_OPTIONS.map(s => (
              <Chip key={s.value} active={filters.sortBy === s.value} onClick={() => setFilter('sortBy')(s.value)}>
                {s.label}
              </Chip>
            ))}
          </div>
        )}
      </div>

      {/* Reset */}
      <button
        onClick={onReset}
        className="w-full text-center text-sm py-3 transition-colors"
        style={{ color: 'rgba(255,255,255,0.40)' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.80)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.40)')}
      >
        Reset Filters
      </button>
    </div>
  );
}

// ── Shared glass style ────────────────────────────────────────────────────────
const glassSurface: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  backdropFilter: 'blur(20px) saturate(160%)',
  WebkitBackdropFilter: 'blur(20px) saturate(160%)',
};

// ── People row ────────────────────────────────────────────────────────────────
function PeopleRow({ people }: { people: PersonSearchResult[] }) {
  if (people.length === 0) return null;
  return (
    <section className="mb-8">
      <p className="text-[10px] font-semibold tracking-widest uppercase mb-3"
        style={{ color: 'rgba(255,255,255,0.38)' }}>People</p>
      <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
        {people.map(p => (
          <Link key={p.id} to={`/person/${p.id}`} className="shrink-0 flex flex-col items-center gap-2 w-20">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/15"
              style={{ background: 'rgba(255,255,255,0.08)' }}>
              {p.profile_path
                ? <img src={tmdbImageUrl(p.profile_path, 'w185') ?? ''} alt={p.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center"><User className="w-7 h-7 text-white/30" /></div>
              }
            </div>
            <p className="text-[11px] text-white/80 text-center leading-tight line-clamp-2">{p.name}</p>
            <p className="text-[10px] text-white/35">{p.known_for_department ?? 'Acting'}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ── Search results (real-time, infinite-scroll pages) ────────────────────────
function SearchResults({ query, tab }: { query: string; tab: ContentType }) {
  const [results, setResults]    = useState<Movie[]>([]);
  const [people, setPeople]      = useState<PersonSearchResult[]>([]);
  const [loading, setLoading]    = useState(false);
  const [loadingMore, setMore]   = useState(false);
  const [page, setPage]          = useState(1);
  const [totalPages, setTotalPg] = useState(1);
  const [totalResults, setTotal] = useState(0);
  const sentinelRef              = useRef<HTMLDivElement>(null);

  // Initial fetch / re-fetch when query or tab changes
  useEffect(() => {
    if (!query.trim()) return;
    let cancelled = false;
    setLoading(true);
    setPage(1);
    setResults([]);
    setPeople([]);

    Promise.allSettled([
      searchMulti(query, '1'),
      tab === 'all' ? searchPerson(query) : Promise.resolve({ results: [] as PersonSearchResult[] }),
    ]).then(([multiRes, personRes]) => {
      if (cancelled) return;
      if (multiRes.status === 'fulfilled') {
        const all = (multiRes.value.results ?? []) as (Movie & { media_type?: string })[];
        const filtered = filterByTab(all, tab);
        setResults(filtered);
        setTotal(multiRes.value.total_results ?? filtered.length);
        setTotalPg(multiRes.value.total_pages ?? 1);
      }
      if (personRes.status === 'fulfilled') setPeople(personRes.value.results ?? []);
    }).finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [query, tab]);

  // Load next page
  const loadMore = useCallback(() => {
    if (loadingMore || page >= totalPages) return;
    const nextPage = page + 1;
    setMore(true);
    searchMulti(query, String(nextPage)).then(data => {
      const all = (data.results ?? []) as (Movie & { media_type?: string })[];
      setResults(prev => {
        const ids = new Set(prev.map(r => r.id));
        return [...prev, ...filterByTab(all, tab).filter(r => !ids.has(r.id))];
      });
      setPage(nextPage);
    }).finally(() => setMore(false));
  }, [loadingMore, page, totalPages, query, tab]);

  // Intersection observer sentinel
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) loadMore();
    }, { rootMargin: '200px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore]);

  if (loading) return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {Array.from({ length: 18 }).map((_, i) => <MovieCardSkeleton key={i} />)}
    </div>
  );

  return (
    <div>
      <PeopleRow people={people} />
      <p className="text-[10px] font-semibold tracking-widest uppercase mb-4"
        style={{ color: 'rgba(255,255,255,0.38)' }}>
        {totalResults.toLocaleString()} Results for "{query}"
      </p>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {results.map(item => (
          <MovieCard
            key={item.id}
            movie={item}
            mediaType={(item as unknown as { media_type?: string }).media_type === 'tv' ? 'tv' : 'movie'}
          />
        ))}
        {results.length === 0 && (
          <p className="col-span-full text-white/40 text-sm py-10 text-center">No results found for "{query}".</p>
        )}
      </div>
      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-8 flex items-center justify-center mt-4">
        {loadingMore && <Loader2 className="w-5 h-5 animate-spin text-white/40" />}
      </div>
    </div>
  );
}

// ── Filter results (40 initial → +20 per scroll page) ────────────────────────
function FilteredResults({ filters, contentType, keywords }: { filters: Filters; contentType: ContentType; keywords?: string }) {
  const [items, setItems]      = useState<Movie[]>([]);
  const [loading, setLoading]  = useState(false);
  const [loadMore, setMore]    = useState(false);
  const [page, setPage]        = useState(0);          // 0 = not yet loaded
  const [totalPg, setTotalPg]  = useState(1);
  const sentinelRef            = useRef<HTMLDivElement>(null);
  const filtersKey             = JSON.stringify({ filters, contentType, keywords });
  const prevKey                = useRef('');

  const mediaType = contentType === 'movies' ? 'movie' : (contentType === 'anime' ? 'tv' : 'tv');

  const resolvedSort = filters.sortBy === 'hottest' ? 'popularity.desc' : (filters.sortBy || 'popularity.desc');

  const yearForApi = (y: string) => {
    if (y === '2010s') return '2010';
    if (y === '2000s') return '2000';
    if (y === '1990s') return '1990';
    if (y === '1980s') return '1980';
    return y;
  };

  const fetchPage = useCallback(async (pg: number, append: boolean) => {
    if (pg === 1) setLoading(true); else setMore(true);
    try {
      const data = await discoverFiltered({
        mediaType,
        genre: filters.genre,
        year: yearForApi(filters.year),
        sortBy: resolvedSort,
        provider: filters.provider,
        region: filters.country,
        page: String(pg),
        anime: contentType === 'anime',
        keywords,
      });
      const fresh = data.results ?? [];
      setItems(prev => {
        if (!append) return fresh;
        const ids = new Set(prev.map(r => r.id));
        return [...prev, ...fresh.filter(r => !ids.has(r.id))];
      });
      setTotalPg(data.total_pages ?? 1);
      setPage(pg);
    } finally {
      setLoading(false);
      setMore(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  // Initial load: fetch pages 1 + 2 (= 40 items)
  useEffect(() => {
    if (prevKey.current === filtersKey) return;
    prevKey.current = filtersKey;
    setItems([]);
    setPage(0);
    setTotalPg(1);

    (async () => {
      setLoading(true);
      try {
        const opts = { mediaType: mediaType as 'movie' | 'tv', genre: filters.genre, year: yearForApi(filters.year), sortBy: resolvedSort, provider: filters.provider, region: filters.country, anime: contentType === 'anime', keywords };
        const [d1, d2] = await Promise.all([
          discoverFiltered({ ...opts, page: '1' }),
          discoverFiltered({ ...opts, page: '2' }),
        ]);
        const combined = [...(d1.results ?? []), ...(d2.results ?? [])];
        const ids = new Set<number>();
        setItems(combined.filter(r => { if (ids.has(r.id)) return false; ids.add(r.id); return true; }));
        setTotalPg(d1.total_pages ?? 1);
        setPage(2);
      } finally {
        setLoading(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  // Load next page (+20) via IntersectionObserver
  const handleLoadMore = useCallback(() => {
    if (loadMore || loading || page === 0 || page >= totalPg) return;
    void fetchPage(page + 1, true);
  }, [loadMore, loading, page, totalPg, fetchPage]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) handleLoadMore();
    }, { rootMargin: '300px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, [handleLoadMore]);

  if (loading) return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {Array.from({ length: 20 }).map((_, i) => <MovieCardSkeleton key={i} />)}
    </div>
  );

  return (
    <div>
      <p className="text-[10px] font-semibold tracking-widest uppercase mb-4"
        style={{ color: 'rgba(255,255,255,0.38)' }}>
        {items.length} Loaded
      </p>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {items.map(item => <MovieCard key={item.id} movie={item} mediaType={mediaType} />)}
        {items.length === 0 && (
          <p className="col-span-full text-white/40 text-sm py-10 text-center">No results found for selected filters.</p>
        )}
      </div>
      <div ref={sentinelRef} className="h-8 flex items-center justify-center mt-4">
        {loadMore && <Loader2 className="w-5 h-5 animate-spin text-white/40" />}
      </div>
    </div>
  );
}

// ── Helper: filter multi-search results by tab ────────────────────────────────
function filterByTab(items: (Movie & { media_type?: string })[], tab: ContentType) {
  if (tab === 'movies') return items.filter(r => r.media_type === 'movie');
  if (tab === 'series') return items.filter(r => r.media_type === 'tv');
  if (tab === 'anime')  return items.filter(r => r.media_type === 'tv');
  return items.filter(r => r.media_type !== 'person');
}

// ── Search suggestion dropdown (text-only, TMDB-style) ───────────────────────
interface SuggestionItem {
  id: number;
  label: string;
  category: string; // e.g. "in Movies", "in TV Shows", "in People", "keyword"
  mediaType: 'movie' | 'tv' | 'person' | 'keyword';
  isKeyword?: boolean;
}

function SearchSuggestions({ suggestions, onSelect, visible }: {
  suggestions: SuggestionItem[];
  onSelect: (s: SuggestionItem) => void;
  visible: boolean;
}) {
  if (!visible || suggestions.length === 0) return null;
  return (
    <div
      className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-50"
      style={{
        background: 'rgba(8,16,24,0.98)',
        border: '1px solid rgba(255,255,255,0.10)',
        backdropFilter: 'blur(24px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      }}
    >
      {suggestions.map((s, i) => (
        <button
          key={`${s.mediaType}-${s.id}-${i}`}
          type="button"
          onMouseDown={e => { e.preventDefault(); onSelect(s); }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-white/8"
          style={{ borderBottom: i < suggestions.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
        >
          {/* Icon: search magnifier for suggestions, media icons for category entries */}
          <div className="shrink-0 w-4 flex items-center justify-center">
            {s.isKeyword || s.mediaType === 'keyword' ? (
              <Search className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.35)' }} />
            ) : s.mediaType === 'person' ? (
              <User className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.35)' }} />
            ) : s.mediaType === 'tv' ? (
              <Tv className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.35)' }} />
            ) : (
              <Film className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.35)' }} />
            )}
          </div>
          <p className="flex-1 min-w-0 text-sm truncate">
            <span className="font-semibold text-white">{s.label}</span>
            {s.category && (
              <span style={{ color: 'rgba(255,255,255,0.40)' }}> {s.category}</span>
            )}
          </p>
        </button>
      ))}
    </div>
  );
}

// ── Default carousel rows per tab ─────────────────────────────────────────────
function AllRows()    {
  const t  = useCallback(() => getTrending('all'),                            []);
  const th = useCallback(() => discoverFiltered({ mediaType: 'movie', sortBy: 'popularity.desc' }), []);
  const tr = useCallback(() => getTopRated('movie'),                          []);
  const tv = useCallback(() => getPopularTV(),                                []);
  const up = useCallback(() => getUpcomingMovies(),                           []);
  const { movies: trending, loading: l1 } = useTMDBList(t,  []);
  const { movies: theaters, loading: l2 } = useTMDBList(th, []);
  const { movies: topRated, loading: l3 } = useTMDBList(tr, []);
  const { movies: popular,  loading: l4 } = useTMDBList(tv, []);
  const { movies: upcoming, loading: l5 } = useTMDBList(up, []);
  return (
    <div className="flex flex-col gap-8">
      <CarouselRow title="Trending Now"      movies={trending}  loading={l1} mediaType="movie" />
      <CarouselRow title="Now In Theaters"   movies={theaters}  loading={l2} mediaType="movie" />
      <CarouselRow title="Top Rated Movies"  movies={topRated}  loading={l3} mediaType="movie" />
      <CarouselRow title="Popular TV Shows"  movies={popular}   loading={l4} mediaType="tv"    />
      <CarouselRow title="Upcoming Releases" movies={upcoming}  loading={l5} mediaType="movie" />
    </div>
  );
}
function MoviesRows() {
  const t = useCallback(() => getTrending('movie'),   []);
  const r = useCallback(() => getTopRated('movie'),   []);
  const u = useCallback(() => getUpcomingMovies(),    []);
  const { movies: trending, loading: l1 } = useTMDBList(t, []);
  const { movies: topRated, loading: l2 } = useTMDBList(r, []);
  const { movies: upcoming, loading: l3 } = useTMDBList(u, []);
  return (
    <div className="flex flex-col gap-8">
      <CarouselRow title="Trending Movies"   movies={trending} loading={l1} mediaType="movie" />
      <CarouselRow title="Top Rated Movies"  movies={topRated} loading={l2} mediaType="movie" />
      <CarouselRow title="Upcoming Releases" movies={upcoming} loading={l3} mediaType="movie" />
    </div>
  );
}
function SeriesRows() {
  const t = useCallback(() => getTrending('tv'),  []);
  const p = useCallback(() => getPopularTV(),     []);
  const r = useCallback(() => getTopRated('tv'),  []);
  const { movies: trending, loading: l1 } = useTMDBList(t, []);
  const { movies: popular,  loading: l2 } = useTMDBList(p, []);
  const { movies: topRated, loading: l3 } = useTMDBList(r, []);
  return (
    <div className="flex flex-col gap-8">
      <CarouselRow title="Trending Series"  movies={trending} loading={l1} mediaType="tv" />
      <CarouselRow title="Popular TV Shows" movies={popular}  loading={l2} mediaType="tv" />
      <CarouselRow title="Top Rated Shows"  movies={topRated} loading={l3} mediaType="tv" />
    </div>
  );
}
function AnimeRows() {
  const p = useCallback(() => getAnime(),                                                         []);
  const r = useCallback(() => getAnime('1', { sort_by: 'vote_average.desc', 'vote_count.gte': '200' }), []);
  const { movies: popular,  loading: l1 } = useTMDBList(p, []);
  const { movies: topRated, loading: l2 } = useTMDBList(r, []);
  return (
    <div className="flex flex-col gap-8">
      <CarouselRow title="Popular Anime"   movies={popular}  loading={l1} mediaType="tv" />
      <CarouselRow title="Top Rated Anime" movies={topRated} loading={l2} mediaType="tv" />
    </div>
  );
}

// ── Tab button ────────────────────────────────────────────────────────────────
function TabButton({ active, onClick, icon, label }: {
  active: boolean; onClick: () => void; icon: React.ReactNode; label: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 shrink-0"
      style={active
        ? { background: 'rgba(255,255,255,0.95)', color: '#000' }
        : { background: 'transparent', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.15)' }
      }
    >
      {icon}{label}
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DiscoverPage() {
  const navigate = useNavigate();
  const [tab,           setTab]           = useState<ContentType>('all');
  const [searchInput,   setSearchInput]   = useState('');
  const [activeQuery,   setActiveQuery]   = useState('');
  const [filterOpen,    setFilterOpen]    = useState(false);
  const [filters,       setFilters]       = useState<Filters>(EMPTY_FILTERS);
  const [movieGenres,   setMovieGenres]   = useState<Genre[]>([]);
  const [tvGenres,      setTvGenres]      = useState<Genre[]>([]);
  // Keyword-search mode: when user picks a keyword suggestion, store resolved IDs
  const [keywordIds,    setKeywordIds]    = useState<string>('');   // comma-sep TMDB keyword IDs
  const [keywordLabel,  setKeywordLabel]  = useState<string>('');   // display label

  // Suggestions
  const [suggestions,   setSuggestions]   = useState<SuggestionItem[]>([]);
  const [sugLoading,    setSugLoading]    = useState(false);
  const [showSug,       setShowSug]       = useState(false);

  const inputRef       = useRef<HTMLInputElement>(null);
  const searchWrapRef  = useRef<HTMLDivElement>(null);
  const debounceRef    = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getMovieGenres().then(d => setMovieGenres(d.genres)).catch(() => {});
    getTVGenres().then(d => setTvGenres(d.genres)).catch(() => {});
  }, []);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) {
        setShowSug(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Debounced real-time suggestions: fetch multi-search + keywords in parallel
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = searchInput.trim();
    if (!q) { setSuggestions([]); setShowSug(false); return; }

    debounceRef.current = setTimeout(() => {
      setSugLoading(true);
      Promise.allSettled([
        searchMulti(q, '1'),
        searchKeywords(q),
      ]).then(([multiRes, kwRes]) => {
        const items: SuggestionItem[] = [];

        // ── Top media results as category rows (e.g. "Interstellar in Movies") ──
        if (multiRes.status === 'fulfilled') {
          const raw = (multiRes.value.results ?? []).slice(0, 5) as
            (Movie & { media_type?: string; known_for_department?: string })[];
          for (const r of raw) {
            const mt = r.media_type === 'tv' ? 'tv'
                     : r.media_type === 'person' ? 'person'
                     : 'movie';
            const cat = mt === 'person'
              ? 'in People'
              : mt === 'tv' ? 'in TV Shows' : 'in Movies';
            items.push({ id: r.id, label: r.title ?? r.name ?? '', category: cat, mediaType: mt });
          }
        }

        // ── Keyword suggestions (search-icon rows, e.g. "High School Musical") ──
        if (kwRes.status === 'fulfilled') {
          const kws = (kwRes.value.results ?? []).slice(0, 5) as TMDBKeyword[];
          for (const kw of kws) {
            items.push({ id: kw.id, label: kw.name, category: '', mediaType: 'keyword', isKeyword: true });
          }
        }

        setSuggestions(items);
        setShowSug(items.length > 0);
      }).catch(() => setSuggestions([])).finally(() => setSugLoading(false));
    }, 280);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchInput]);

  // Real-time results: update activeQuery (title search) after debounce
  useEffect(() => {
    const q = searchInput.trim();
    // If we're in keyword mode and the label matches, don't overwrite with a title search
    if (!q) { setActiveQuery(''); return; }
    if (keywordIds && searchInput === keywordLabel) return;
    const t = setTimeout(() => setActiveQuery(q), 600);
    return () => clearTimeout(t);
  }, [searchInput, keywordIds, keywordLabel]);

  const setFilter = (k: keyof Filters) => (v: string) =>
    setFilters(prev => ({ ...prev, [k]: v }));

  const hasFilters = Object.entries(filters).some(([k, v]) =>
    k === 'sortBy' ? v !== 'hottest' : Boolean(v)
  );
  const activeFilterCount = Object.entries(filters).filter(([k, v]) =>
    k === 'sortBy' ? v !== 'hottest' : Boolean(v)
  ).length;

  const clearSearch = () => {
    setSearchInput('');
    setActiveQuery('');
    setKeywordIds('');
    setKeywordLabel('');
    setSuggestions([]);
    setShowSug(false);
    inputRef.current?.focus();
  };

  const handleSuggestionSelect = (s: SuggestionItem) => {
    setShowSug(false);

    if (s.mediaType === 'person') {
      navigate(`/person/${s.id}`);
      return;
    }

    if (s.isKeyword || s.mediaType === 'keyword') {
      // Keyword mode: set keyword IDs to trigger FilteredResults with with_keywords
      setSearchInput(s.label);
      setKeywordLabel(s.label);
      setKeywordIds(String(s.id));
      setActiveQuery('');          // don't run title search
      setFilterOpen(false);
      return;
    }

    // Regular title search
    setKeywordIds('');
    setKeywordLabel('');
    setSearchInput(s.label);
    setActiveQuery(s.label);
    setFilterOpen(false);
  };

  // Determine display mode
  const isKeywordMode = Boolean(keywordIds);
  const showSearch    = Boolean(activeQuery) && !isKeywordMode;
  const showFiltered  = !showSearch && (hasFilters || isKeywordMode);
  const showDefault   = !showSearch && !showFiltered;

  return (
    <div className="relative flex flex-col min-h-screen bg-[#050a0e] overflow-x-hidden">
      <PageMeta seo={generateStaticMetadata({
        title: 'Discover',
        description: 'Explore movies and TV shows by genre, year, rating, and language. Find your next favourite title on WatchBox.',
        path: '/discover',
      })} />

      {/* ── Silk background ── */}
      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
        <Silk color="#0e7490" speed={3.5} scale={1.4} noiseIntensity={1.2} rotation={0.3} lightMode={false} />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(160deg, rgba(0,18,26,0.84) 0%, rgba(0,12,20,0.90) 40%, rgba(0,8,16,0.94) 100%)' }} />
        <div className="absolute top-0 left-0 w-[600px] h-[400px]"
          style={{ background: 'radial-gradient(ellipse at 0% 0%, rgba(6,182,212,0.12) 0%, transparent 70%)' }} />
      </div>

      <Navbar />

      <main className="relative z-10 flex-1 pt-20 pb-20 md:pb-16 max-w-screen-2xl mx-auto w-full px-4 md:px-8">

        {/* ── Row 1: Search bar (full width) ── */}
        <div ref={searchWrapRef} className="relative mt-6 mb-3">
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl" style={glassSurface}>
            <Search className="w-4 h-4 shrink-0" style={{ color: 'rgba(255,255,255,0.40)' }} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search movies, TV shows, anime, people, or keywords…"
              value={searchInput}
              onChange={e => {
                setSearchInput(e.target.value);
                setShowSug(true);
                // If user edits after keyword selection, clear keyword mode
                if (keywordIds && e.target.value !== keywordLabel) {
                  setKeywordIds('');
                  setKeywordLabel('');
                }
              }}
              onFocus={() => { if (suggestions.length > 0) setShowSug(true); }}
              onKeyDown={e => {
                if (e.key === 'Escape') { setShowSug(false); inputRef.current?.blur(); }
                if (e.key === 'Enter') {
                  setShowSug(false);
                  if (!keywordIds) setActiveQuery(searchInput.trim());
                }
              }}
              className="flex-1 min-w-0 bg-transparent text-sm outline-none text-white placeholder:text-white/35"
            />
            {isKeywordMode && (
              <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{ background: 'rgba(6,182,212,0.2)', color: 'rgba(103,232,249,0.9)' }}>
                keyword
              </span>
            )}
            {sugLoading && <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0 text-white/30" />}
            {searchInput && !sugLoading && (
              <button type="button" onClick={clearSearch} className="shrink-0 text-white/40 hover:text-white/80 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Text-only suggestion dropdown */}
          <SearchSuggestions
            suggestions={suggestions}
            onSelect={handleSuggestionSelect}
            visible={showSug}
          />
        </div>

        {/* ── Row 2: Tabs + Filters button on same line ── */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto flex-1 min-w-0 pb-1" style={{ scrollbarWidth: 'none' }}>
            <TabButton active={tab==='all'}    onClick={() => setTab('all')}    icon={<Sparkles className="w-3.5 h-3.5" />} label="All"    />
            <TabButton active={tab==='movies'} onClick={() => setTab('movies')} icon={<Film className="w-3.5 h-3.5" />}     label="Movies" />
            <TabButton active={tab==='series'} onClick={() => setTab('series')} icon={<Tv className="w-3.5 h-3.5" />}       label="Series" />
            <TabButton active={tab==='anime'}  onClick={() => setTab('anime')}  icon={<Star className="w-3.5 h-3.5" />}     label="Anime"  />
          </div>

          <button
            type="button"
            onClick={() => setFilterOpen(o => !o)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 shrink-0"
            style={filterOpen || hasFilters
              ? { background: 'rgba(255,255,255,0.95)', color: '#000' }
              : { ...glassSurface, color: 'rgba(255,255,255,0.65)' }
            }
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{ background: filterOpen ? 'rgba(0,0,0,0.25)' : 'rgba(6,182,212,0.8)', color: '#fff' }}>
                {activeFilterCount}
              </span>
            )}
            {filterOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* ── Collapsible filter panel ── */}
        <FilterPanel
          open={filterOpen}
          filters={filters}
          setFilter={setFilter}
          onReset={() => setFilters(EMPTY_FILTERS)}
          movieGenres={movieGenres}
          tvGenres={tvGenres}
          contentType={tab}
        />

        {/* ── Content ── */}
        <div className="mt-6">
          {showSearch   && <SearchResults query={activeQuery} tab={tab} />}
          {showFiltered && (
            <FilteredResults
              filters={filters}
              contentType={tab === 'all' ? 'movies' : tab}
              keywords={keywordIds || undefined}
            />
          )}
          {showDefault  && (
            <>
              {tab === 'all'    && <AllRows />}
              {tab === 'movies' && <MoviesRows />}
              {tab === 'series' && <SeriesRows />}
              {tab === 'anime'  && <AnimeRows />}
            </>
          )}
        </div>
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
