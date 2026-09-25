import { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import Navbar from '@/components/layouts/Navbar';
import Footer from '@/components/layouts/Footer';
import HeroBanner from '@/components/movie/HeroBanner';
import CarouselRow from '@/components/movie/CarouselRow';
import Silk from '@/components/ui/Silk';
import { useTMDBList } from '@/hooks/useTMDB';
import { useAuth } from '@/contexts/AuthContext';
import {
  getTrending,
  tmdbImageUrl,
  type Movie,
} from '@/services/tmdb';
import { getLibrary, type LibraryItem } from '@/lib/supabase/library';
import { getFavorites, type FavoriteItem } from '@/lib/supabase/favorites';
import { getFavoriteActors, type ActorFavorite } from '@/lib/supabase/actorFavorites';
import { getActiveSections, effectiveStatus, type Section } from '@/lib/supabase/sections';
import { resolveSection } from '@/services/sectionResolver';
import PageMeta from '@/components/common/PageMeta';
import { generateHomepageMetadata } from '@/lib/seo';
import { buildLibrarySet, excludeLibrary } from '@/hooks/useLibrarySet';

// ── Library stats bar ─────────────────────────────────────────────────────────
function LibraryStatsBar({ items }: { items: LibraryItem[] }) {
  if (items.length === 0) return null;
  const watching  = items.filter(i => i.status === 'Watching').length;
  const completed = items.filter(i => i.status === 'Completed').length;
  const dropped   = items.filter(i => i.status === 'Dropped').length;
  const plan      = items.filter(i => i.status === 'Plan to Watch').length;
  const onHold    = items.filter(i => i.status === 'On Hold').length;

  const stats = [
    { label: 'Watching',  value: watching },
    { label: 'Completed', value: completed },
    { label: 'Dropped',   value: dropped },
    { label: 'Plan',      value: plan },
    { label: 'On Hold',   value: onHold },
    { label: 'Total',     value: items.length },
  ];

  return (
    <div className="px-4 md:px-6">
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {stats.map(s => (
          <div
            key={s.label}
            className="flex flex-col items-center justify-center py-4 px-3 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <span className="text-xl md:text-2xl font-bold text-white leading-none">{s.value}</span>
            <span className="text-[10px] uppercase tracking-widest text-white/40 mt-1">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Favorite actors row ───────────────────────────────────────────────────────
function FavoriteActorsRow({ actors }: { actors: ActorFavorite[] }) {
  if (actors.length === 0) return null;
  return (
    <section>
      <div className="flex items-center justify-between px-4 md:px-6 mb-4">
        <div>
          <p className="text-[10px] font-semibold tracking-widest uppercase text-white/38 mb-0.5">My Library</p>
          <h2 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
            Favorite Actors
            <Heart className="w-4 h-4 text-red-400 fill-red-400" />
          </h2>
        </div>
        <Link to="/library" className="text-xs text-white/40 hover:text-white/80 transition-colors flex items-center gap-1">
          View all
        </Link>
      </div>
      <div className="flex gap-5 px-4 md:px-6 overflow-x-auto hide-scrollbar pb-2">
        {actors.map(actor => {
          const img = actor.profile_path ? tmdbImageUrl(actor.profile_path, 'w185') : null;
          return (
            <Link
              key={actor.person_id}
              to={`/person/${actor.person_id}`}
              className="shrink-0 flex flex-col items-center gap-2 group"
            >
              <div
                className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-white/15 group-hover:border-white/40 transition-colors"
                style={{ background: 'rgba(255,255,255,0.08)' }}
              >
                {img
                  ? <img src={img} alt={actor.name} className="w-full h-full object-cover object-top" />
                  : <div className="w-full h-full flex items-center justify-center text-white/30 text-xl">👤</div>}
              </div>
              <p className="text-xs text-white/70 group-hover:text-white transition-colors text-center max-w-[72px] truncate">{actor.name}</p>
              <p className="text-[10px] text-white/35 -mt-1">{actor.known_for_department}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

// ── Library adapter ───────────────────────────────────────────────────────────
function libraryToMovie(item: LibraryItem | FavoriteItem): Movie {
  return {
    id:           item.tmdb_id,
    title:        'title' in item ? item.title : '',
    name:         'title' in item ? item.title : '',
    poster_path:  item.poster_path,
    backdrop_path: ('backdrop_path' in item ? item.backdrop_path : null),
    vote_average: item.vote_average,
    vote_count:   0,
    release_date: item.release_date ?? undefined,
    first_air_date: item.release_date ?? undefined,
    media_type:   item.media_type,
    overview:     '',
    genre_ids:    [],
  };
}

// ── Dynamic section row — fetches and renders one DB section ─────────────────
function DynamicSectionRow({
  section,
  libSet,
}: {
  section: Section;
  libSet: Set<string>;
}) {
  const [movies, setMovies]   = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const mountedRef            = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);
    setError(null);

    resolveSection(section)
      .then(result => {
        if (!mountedRef.current) return;
        // Strip items already in library
        const mediaHint =
          section.content_type === 'movie' ? 'movie'
          : section.content_type === 'tv'  ? 'tv'
          : 'auto';
        const filtered = excludeLibrary(result, libSet, mediaHint as 'movie' | 'tv' | 'auto');
        setMovies(filtered);
      })
      .catch(e => {
        if (!mountedRef.current) return;
        setError(e instanceof Error ? e.message : 'Failed to load section');
      })
      .finally(() => {
        if (mountedRef.current) setLoading(false);
      });

    return () => { mountedRef.current = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section.id, section.updated_at]);

  // Don't render an empty resolved section (not an error, just no results)
  if (!loading && !error && movies.length === 0) return null;

  const mediaType: 'movie' | 'tv' | undefined =
    section.content_type === 'movie' ? 'movie'
    : section.content_type === 'tv'  ? 'tv'
    : undefined;

  return (
    <CarouselRow
      title={section.name}
      sectionLabel={section.section_label ?? undefined}
      movies={movies}
      loading={loading}
      error={error}
      viewAllLink={section.view_all_link ?? undefined}
      mediaType={mediaType}
    />
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { user } = useAuth();

  // Personal / library data
  const [libraryItems,   setLibraryItems]   = useState<LibraryItem[]>([]);
  const [favoriteItems,  setFavoriteItems]  = useState<FavoriteItem[]>([]);
  const [favoriteActors, setFavoriteActors] = useState<ActorFavorite[]>([]);

  useEffect(() => {
    if (!user) return;
    getLibrary().then(setLibraryItems).catch(() => {});
    getFavorites().then(setFavoriteItems).catch(() => {});
    getFavoriteActors().then(setFavoriteActors).catch(() => {});
  }, [user]);

  // Hero banner — always fetch trending/all
  const { movies: trendingAll, loading: heroLoading } = useTMDBList(() => getTrending('all'));

  // Database-driven sections
  const [sections,        setSections]        = useState<Section[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(true);

  useEffect(() => {
    setSectionsLoading(true);
    getActiveSections()
      .then(all => {
        // Client-side filter: only keep sections whose effective status is 'published'
        const active = all.filter(s => effectiveStatus(s) === 'published');
        setSections(active);
      })
      .catch(() => setSections([]))
      .finally(() => setSectionsLoading(false));
  }, []);

  // Derived library slices
  const watchingItems  = libraryItems.filter(i => i.status === 'Watching').map(libraryToMovie);
  const planItems      = libraryItems.filter(i => i.status === 'Plan to Watch').map(libraryToMovie);
  const favoriteMovies = favoriteItems.map(libraryToMovie);
  const libSet         = useMemo(() => buildLibrarySet(libraryItems), [libraryItems]);

  // Hero: exclude already-library'd items
  const heroMovies = useMemo(
    () => excludeLibrary(trendingAll, libSet, 'auto').slice(0, 8),
    [trendingAll, libSet],
  );

  const seo = generateHomepageMetadata();

  return (
    <div className="relative min-h-screen bg-[#050a0e] flex flex-col overflow-x-hidden">
      <PageMeta seo={seo} />

      {/* Fixed Silk background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Silk color="#0e7490" speed={3} scale={1.3} noiseIntensity={1.1} rotation={0.25} />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(160deg, rgba(0,18,26,0.82) 0%, rgba(0,12,20,0.88) 40%, rgba(0,8,16,0.92) 100%)' }}
        />
        <div
          className="absolute top-0 left-0 w-[600px] h-[400px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 0% 0%, rgba(6,182,212,0.10) 0%, transparent 70%)' }}
        />
      </div>

      <Navbar />

      {/* Hero */}
      <div className="relative z-10">
        <HeroBanner movies={heroMovies} loading={heroLoading} />
      </div>

      {/* Content rows */}
      <div className="flex flex-col gap-10 py-8 pb-24 md:pb-8 max-w-screen-2xl w-full mx-auto relative z-20">

        {/* Personal library rows — shown only when signed in */}
        {user && libraryItems.length > 0 && (
          <LibraryStatsBar items={libraryItems} />
        )}
        {user && watchingItems.length > 0 && (
          <CarouselRow
            title="Currently Watching"
            sectionLabel="My Library"
            movies={watchingItems}
            viewAllLink="/library"
          />
        )}
        {user && planItems.length > 0 && (
          <CarouselRow
            title="Plan to Watch"
            sectionLabel="My Library"
            movies={planItems}
            viewAllLink="/library"
          />
        )}
        {user && favoriteMovies.length > 0 && (
          <CarouselRow
            title="Favorites"
            sectionLabel="My Library"
            movies={favoriteMovies}
            viewAllLink="/library"
          />
        )}
        {user && <FavoriteActorsRow actors={favoriteActors} />}

        {/* Database-driven discovery rows — one per section, in admin-defined order */}
        {sectionsLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <CarouselRow key={`skel_${i}`} title="" movies={[]} loading={true} />
            ))
          : sections.map(section => (
              <DynamicSectionRow key={section.id} section={section} libSet={libSet} />
            ))
        }
      </div>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}

