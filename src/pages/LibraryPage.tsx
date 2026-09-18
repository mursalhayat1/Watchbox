import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, List, Film, Tv, Star, Trash2, ChevronDown } from 'lucide-react';
import Navbar from '@/components/layouts/Navbar';
import Footer from '@/components/layouts/Footer';
import Silk from '@/components/ui/Silk';
import HeroBanner from '@/components/movie/HeroBanner';
import { useLibrary } from '@/hooks/useLibrary';
import { tmdbImageUrl, type Movie } from '@/services/tmdb';
import { LIBRARY_STATUSES, type LibraryStatus, type LibraryItem } from '@/lib/libraryApi';
import PageMeta from '@/components/common/PageMeta';
import { noindexMetadata } from '@/lib/seo';

// ── Status pill color map ─────────────────────────────────────────────────────
const STATUS_COLORS: Record<LibraryStatus, string> = {
  'Watching':      'rgba(34,197,94,0.9)',
  'Completed':     'rgba(99,102,241,0.9)',
  'Plan to Watch': 'rgba(59,130,246,0.9)',
  'On Hold':       'rgba(234,179,8,0.9)',
  'Dropped':       'rgba(239,68,68,0.9)',
};

// ── Convert LibraryItem → Movie shape for HeroBanner ─────────────────────────
function libraryItemToMovie(item: LibraryItem): Movie {
  return {
    id: item.tmdb_id,
    title: item.title,
    name: item.title,
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    vote_average: item.vote_average,
    vote_count: 0,
    release_date: item.release_date ?? undefined,
    first_air_date: item.release_date ?? undefined,
    media_type: item.media_type,
    overview: '',
    genre_ids: [],
  };
}

// ── Status dropdown on a card ─────────────────────────────────────────────────
function StatusBadge({
  item, onChange,
}: { item: LibraryItem; onChange: (id: string, s: LibraryStatus) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={e => { e.preventDefault(); e.stopPropagation(); setOpen(v => !v); }}
        className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
        style={{ background: STATUS_COLORS[item.status], color: '#fff' }}
      >
        {item.status} <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <div
          className="absolute left-0 top-6 z-30 rounded-xl overflow-hidden py-1 min-w-[150px]"
          style={{ background: 'rgba(15,25,30,0.97)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)' }}
        >
          {LIBRARY_STATUSES.map(s => (
            <button
              key={s}
              onClick={e => { e.preventDefault(); e.stopPropagation(); onChange(item.id, s); setOpen(false); }}
              className="w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-white/10 transition-colors"
              style={{ color: item.status === s ? '#fff' : 'rgba(255,255,255,0.6)' }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Poster grid card ──────────────────────────────────────────────────────────
function GridCard({
  item, onRemove, onStatusChange,
}: {
  item: LibraryItem;
  onRemove: (id: string) => void;
  onStatusChange: (id: string, s: LibraryStatus) => void;
}) {
  const poster = tmdbImageUrl(item.poster_path, 'w342');
  const type   = item.media_type === 'tv' ? 'tv' : 'movie';
  const year   = (item.release_date ?? '').slice(0, 4);
  return (
    <div className="group relative flex flex-col">
      <Link to={`/detail/${type}/${item.tmdb_id}`} className="block">
        <div className="relative w-full rounded-xl overflow-hidden border border-white/8"
          style={{ aspectRatio: '2/3', background: 'rgba(255,255,255,0.05)' }}>
          {poster
            ? <img src={poster} alt={item.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            : <div className="w-full h-full flex items-center justify-center">
                {type === 'tv' ? <Tv className="w-8 h-8 text-white/20" /> : <Film className="w-8 h-8 text-white/20" />}
              </div>
          }
          {/* Hover scrim */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-200" />
          {/* Remove button — top-right on hover */}
          <button
            onClick={e => { e.preventDefault(); e.stopPropagation(); onRemove(item.id); }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center
              opacity-0 group-hover:opacity-100 transition-opacity duration-150"
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
            title="Remove from library"
          >
            <Trash2 className="w-3.5 h-3.5 text-white/80" />
          </button>
          {/* Status pill bottom-left */}
          <div className="absolute bottom-2 left-2">
            <StatusBadge item={item} onChange={onStatusChange} />
          </div>
        </div>
      </Link>
      <div className="mt-1.5 px-0.5">
        <p className="text-xs font-semibold text-white/90 truncate leading-snug">{item.title}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wide text-white/35">
            {type === 'tv' ? 'TV' : 'Movie'}
          </span>
          {year && <span className="text-[10px] text-white/35">{year}</span>}
          {item.vote_average > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-yellow-400/80 ml-auto shrink-0">
              <Star className="w-2.5 h-2.5 fill-yellow-400/80" />
              {Number(item.vote_average).toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── List row card ─────────────────────────────────────────────────────────────
function ListRow({
  item, onRemove, onStatusChange,
}: {
  item: LibraryItem;
  onRemove: (id: string) => void;
  onStatusChange: (id: string, s: LibraryStatus) => void;
}) {
  const poster = tmdbImageUrl(item.poster_path, 'w154');
  const type   = item.media_type === 'tv' ? 'tv' : 'movie';
  const year   = (item.release_date ?? '').slice(0, 4);
  return (
    <div className="group flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors">
      <Link to={`/detail/${type}/${item.tmdb_id}`}
        className="shrink-0 w-10 h-14 rounded-lg overflow-hidden border border-white/8"
        style={{ background: 'rgba(255,255,255,0.05)' }}>
        {poster
          ? <img src={poster} alt={item.title} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center">
              <Film className="w-4 h-4 text-white/20" />
            </div>}
      </Link>
      <div className="flex-1 min-w-0">
        <Link to={`/detail/${type}/${item.tmdb_id}`}>
          <p className="text-sm font-semibold text-white/90 truncate hover:text-white transition-colors">{item.title}</p>
        </Link>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] font-bold uppercase text-white/35">{type === 'tv' ? 'TV' : 'Movie'}</span>
          {year && <span className="text-[10px] text-white/35">{year}</span>}
          {item.vote_average > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-yellow-400/75">
              <Star className="w-2.5 h-2.5 fill-yellow-400/75" />
              {Number(item.vote_average).toFixed(1)}
            </span>
          )}
        </div>
      </div>
      <StatusBadge item={item} onChange={onStatusChange} />
      <button
        onClick={() => onRemove(item.id)}
        className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center
          md:opacity-0 md:group-hover:opacity-100 transition-opacity ml-1"
        style={{ background: 'rgba(255,255,255,0.07)' }}
        title="Remove"
      >
        <Trash2 className="w-3.5 h-3.5 text-white/60" />
      </button>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
        <Film className="w-8 h-8 text-white/25" />
      </div>
      <p className="text-white/55 text-base font-medium">
        {filtered ? 'No titles match this filter.' : 'Your library is empty.'}
      </p>
      {!filtered && (
        <Link to="/"
          className="text-sm text-white/40 hover:text-white/80 transition-colors underline underline-offset-2">
          Browse movies & shows →
        </Link>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function LibraryPage() {
  const { items, loading, error, changeStatus, remove } = useLibrary();

  // View toggles
  const [viewMode, setViewMode]     = useState<'grid' | 'list'>('grid');
  const [mediaFilter, setMediaFilter] = useState<'all' | 'movie' | 'tv'>('all');
  const [statusFilter, setStatusFilter] = useState<LibraryStatus | 'All'>('All');
  const [sortBy, setSortBy]         = useState<'last_updated' | 'title' | 'rating'>('last_updated');

  // Derived counts
  const movieCount = useMemo(() => items.filter(i => i.media_type === 'movie').length, [items]);
  const tvCount    = useMemo(() => items.filter(i => i.media_type === 'tv').length, [items]);
  const statusCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const s of LIBRARY_STATUSES) map[s] = items.filter(i => i.status === s).length;
    return map;
  }, [items]);

  // Filter + sort
  const filtered = useMemo(() => {
    let list = [...items];
    if (mediaFilter !== 'all')  list = list.filter(i => i.media_type === mediaFilter);
    if (statusFilter !== 'All') list = list.filter(i => i.status === statusFilter);
    if (sortBy === 'title')   list.sort((a, b) => a.title.localeCompare(b.title));
    if (sortBy === 'rating')  list.sort((a, b) => Number(b.vote_average) - Number(a.vote_average));
    // 'last_updated' is the DB default order (added_at desc)
    return list;
  }, [items, mediaFilter, statusFilter, sortBy]);

  // Hero: all "Watching" items first, then "Plan to Watch" items
  const heroMovies = useMemo(() => {
    const watching = items.filter(i => i.status === 'Watching').map(libraryItemToMovie);
    const plan     = items.filter(i => i.status === 'Plan to Watch').map(libraryItemToMovie);
    return [...watching, ...plan];
  }, [items]);

  return (
    <div className="relative min-h-screen bg-[#050a0e] flex flex-col overflow-x-hidden">
      <PageMeta seo={noindexMetadata('My Library', '/library')} />
      {/* ── Silk background ── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Silk color="#0e7490" speed={3} scale={1.3} noiseIntensity={1.1} rotation={0.25} />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(160deg, rgba(0,18,26,0.82) 0%, rgba(0,12,20,0.88) 40%, rgba(0,8,16,0.92) 100%)' }} />
        <div className="absolute top-0 left-0 w-[500px] h-[350px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 0% 0%, rgba(14,116,144,0.18) 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 pt-16 pb-20 md:pb-0">

          {/* Hero banner — Watching first, then Plan to Watch */}
          {!loading && heroMovies.length > 0 && (
            <HeroBanner movies={heroMovies} loading={false} />
          )}

          {/* ── Library section ── */}
          <div className="px-4 md:px-8 py-6 w-full max-w-screen-xl mx-auto">

            {/* Section header row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
              <h2 className="text-xl font-bold text-white">My Library</h2>
              <div className="flex items-center gap-3 shrink-0 flex-wrap">
                {/* Sort */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as typeof sortBy)}
                    className="appearance-none text-xs font-semibold pl-3 pr-7 py-1.5 rounded-full cursor-pointer outline-none"
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.14)',
                      color: 'rgba(255,255,255,0.75)',
                    }}
                  >
                    <option value="last_updated">Last Updated</option>
                    <option value="title">Title A–Z</option>
                    <option value="rating">Rating</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/50 pointer-events-none" />
                </div>
                {/* View mode */}
                <div className="flex items-center gap-0.5 rounded-full p-1"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
                  <button onClick={() => setViewMode('grid')}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                    style={viewMode === 'grid' ? { background: 'rgba(255,255,255,0.18)', color: '#fff' } : { color: 'rgba(255,255,255,0.4)' }}>
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setViewMode('list')}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                    style={viewMode === 'list' ? { background: 'rgba(255,255,255,0.18)', color: '#fff' } : { color: 'rgba(255,255,255,0.4)' }}>
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Media filter + title count */}
            <div className="flex items-center justify-between mb-4 gap-4 overflow-x-auto">
              <div className="flex items-center gap-2 shrink-0">
                {(['all', 'movie', 'tv'] as const).map(f => (
                  <button key={f} onClick={() => setMediaFilter(f)}
                    className="text-xs font-semibold px-3 py-1 rounded-full transition-all whitespace-nowrap"
                    style={mediaFilter === f
                      ? { background: 'rgba(255,255,255,0.18)', color: '#fff' }
                      : { color: 'rgba(255,255,255,0.50)' }}>
                    {f === 'all' ? 'All' : f === 'movie' ? 'Movies' : 'TV Shows'}
                    <span className="ml-1 text-[10px] opacity-60">
                      {f === 'all' ? '' : f === 'movie' ? `(${movieCount})` : `(${tvCount})`}
                    </span>
                  </button>
                ))}
              </div>
              <span className="text-xs text-white/35 shrink-0">{filtered.length} TITLES</span>
            </div>

            {/* Status filter bar — horizontal scroll on mobile */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6" style={{ scrollbarWidth: 'none' }}>
              <button onClick={() => setStatusFilter('All')}
                className="text-xs font-semibold px-3 py-1 rounded-full transition-all shrink-0 whitespace-nowrap"
                style={statusFilter === 'All'
                  ? { background: 'rgba(255,255,255,0.18)', color: '#fff' }
                  : { color: 'rgba(255,255,255,0.45)' }}>
                All
              </button>
              {LIBRARY_STATUSES.map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className="text-xs font-semibold px-3 py-1 rounded-full transition-all shrink-0 whitespace-nowrap"
                  style={statusFilter === s
                    ? { background: STATUS_COLORS[s], color: '#fff' }
                    : { color: 'rgba(255,255,255,0.45)' }}>
                  {s}
                  <span className="ml-1 opacity-70 text-[10px]">({statusCounts[s] ?? 0})</span>
                </button>
              ))}
            </div>

            {/* Loading */}
            {loading && (
              <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))' }}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="w-full rounded-xl bg-white/6 animate-pulse" style={{ aspectRatio: '2/3' }} />
                ))}
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <p className="text-center text-white/45 py-12 text-sm">{error}</p>
            )}

            {/* Empty */}
            {!loading && !error && filtered.length === 0 && (
              <EmptyState filtered={statusFilter !== 'All' || mediaFilter !== 'all'} />
            )}

            {/* Grid view */}
            {!loading && !error && filtered.length > 0 && viewMode === 'grid' && (
              <div className="grid gap-3 md:gap-4"
                style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))' }}>
                {filtered.map(item => (
                  <GridCard key={item.id} item={item}
                    onRemove={remove} onStatusChange={changeStatus} />
                ))}
              </div>
            )}

            {/* List view */}
            {!loading && !error && filtered.length > 0 && viewMode === 'list' && (
              <div className="flex flex-col divide-y"
                style={{ borderTop: '1px solid rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.07)' }}>
                {filtered.map(item => (
                  <ListRow key={item.id} item={item}
                    onRemove={remove} onStatusChange={changeStatus} />
                ))}
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
