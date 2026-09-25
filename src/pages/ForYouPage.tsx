import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import Navbar from '@/components/layouts/Navbar';
import Footer from '@/components/layouts/Footer';
import HeroBanner from '@/components/movie/HeroBanner';
import CarouselRow from '@/components/movie/CarouselRow';
import MovieCard from '@/components/movie/MovieCard';
import Silk from '@/components/ui/Silk';
import { useTMDBList } from '@/hooks/useTMDB';
import { useAuth } from '@/contexts/AuthContext';
import {
  getSimilarMovies,
  getSimilarTV,
  getMovieDetails,
  getTVDetails,
  type Movie,
} from '@/services/tmdb';
import { getFavorites, type FavoriteItem } from '@/lib/supabase/favorites';
import PageMeta from '@/components/common/PageMeta';
import { noindexMetadata } from '@/lib/seo';
import { useLibrarySet, excludeLibrary, type LibrarySet } from '@/hooks/useLibrarySet';

// ── Convert FavoriteItem → Movie shape ────────────────────────────────────────
function favToMovie(f: FavoriteItem): Movie {
  return {
    id: f.tmdb_id,
    title: f.title,
    name: f.title,
    poster_path: f.poster_path,
    backdrop_path: f.backdrop_path,
    vote_average: f.vote_average,
    vote_count: 0,
    release_date: f.release_date ?? undefined,
    first_air_date: f.release_date ?? undefined,
    media_type: f.media_type,
    overview: '',
    genre_ids: [],
  };
}

// ── Liquid-glass button style ─────────────────────────────────────────────────
const glassBtn: React.CSSProperties = {
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 100%)',
  border: '1px solid rgba(255,255,255,0.22)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.28)',
  transition: 'filter 200ms ease, transform 150ms ease',
};

// ── My Favorites row — clicking a card scrolls to its rec section ─────────────
function FavoritesScrollRow({
  movies,
  onCardClick,
}: {
  movies: Movie[];
  onCardClick: (tmdbId: number) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft,  setCanLeft]  = useState(false);
  const [canRight, setCanRight] = useState(true);

  const updateState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 0);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -(el.clientWidth * 0.75) : el.clientWidth * 0.75, behavior: 'smooth' });
  };

  return (
    <section>
      <div className="flex items-center justify-between px-4 md:px-6 mb-4">
        <div>
          <p className="text-[10px] font-semibold tracking-widest uppercase mb-0.5"
            style={{ color: 'rgba(255,255,255,0.38)' }}>My Library</p>
          <h2 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
            My Favorites
            <Heart className="w-4 h-4 text-red-400 fill-red-400" />
          </h2>
        </div>
        <Link to="/library"
          className="flex items-center gap-1 text-xs font-medium shrink-0 transition-colors"
          style={{ color: 'rgba(255,255,255,0.45)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.9)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}>
          View All <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="relative group/fav">
        {/* ← left arrow */}
        <button onClick={() => scroll('left')} disabled={!canLeft} aria-label="Scroll left"
          className="absolute left-0 top-0 bottom-2 z-10 w-14 flex items-center justify-center
            opacity-0 group-hover/fav:opacity-100 disabled:!opacity-0
            transition-opacity duration-200 pointer-events-none group-hover/fav:pointer-events-auto"
          style={{ background: 'linear-gradient(to right, rgba(8,22,25,0.80) 0%, transparent 100%)' }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white" style={glassBtn}>
            <ChevronLeft className="w-4 h-4" />
          </div>
        </button>

        <div ref={scrollRef} onScroll={updateState}
          className="flex gap-3 overflow-x-auto hide-scrollbar px-4 md:px-6 pb-2">
          {movies.map(movie => (
            <div
              key={movie.id}
              className="group/card shrink-0 w-[220px] md:w-[260px] cursor-pointer"
              onClick={e => { e.preventDefault(); e.stopPropagation(); onCardClick(movie.id); }}
              title={`See recommendations for "${movie.title ?? movie.name}"`}
            >
              <MovieCard movie={movie} mediaType={movie.media_type === 'tv' ? 'tv' : 'movie'} />
              {/* "See recommendations" hint — fades in on card hover */}
              <p className="text-[10px] text-center mt-1 opacity-0 group-hover/card:opacity-100 transition-opacity duration-200"
                style={{ color: 'rgba(6,182,212,0.85)' }}>
                ↓ See recommendations
              </p>
            </div>
          ))}
          <div className="shrink-0 w-4 md:w-6" aria-hidden="true" />
        </div>

        {/* → right arrow */}
        <button onClick={() => scroll('right')} disabled={!canRight || movies.length === 0}
          aria-label="Scroll right"
          className="absolute right-0 top-0 bottom-2 z-10 w-14 flex items-center justify-center
            opacity-0 group-hover/fav:opacity-100 disabled:!opacity-0
            transition-opacity duration-200 pointer-events-none group-hover/fav:pointer-events-auto"
          style={{ background: 'linear-gradient(to left, rgba(8,22,25,0.80) 0%, transparent 100%)' }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white" style={glassBtn}>
            <ChevronRight className="w-4 h-4" />
          </div>
        </button>
      </div>
    </section>
  );
}

// ── "Because you loved X" recommendation row ─────────────────────────────────
function BecauseYouLovedRow({
  source,
  sectionId,
  libSet,
}: {
  source: FavoriteItem;
  sectionId: string;
  libSet: LibrarySet;
}) {
  const fetchFn = useCallback(
    () => source.media_type === 'tv'
      ? getSimilarTV(source.tmdb_id)
      : getSimilarMovies(source.tmdb_id),
    [source.tmdb_id, source.media_type],
  );
  const { movies: rawMovies, loading } = useTMDBList(fetchFn, [source.tmdb_id]);

  // Exclude items already in the user's library from recommendations
  const movies = useMemo(
    () => excludeLibrary(rawMovies, libSet, source.media_type),
    [rawMovies, libSet, source.media_type],
  );

  if (!loading && movies.length === 0) return null;

  return (
    <div id={sectionId} className="scroll-mt-6">
      <CarouselRow
        title={`"${source.title}"`}
        sectionLabel="Because You Loved"
        movies={movies}
        loading={loading}
        mediaType={source.media_type}
      />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ForYouPage() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [hydrated, setHydrated]   = useState<FavoriteItem[]>([]);

  // Library set — used to exclude already-saved items from suggestions
  const libSet = useLibrarySet();

  // Load favorites
  useEffect(() => {
    if (!user) return;
    getFavorites().then(favs => {
      setFavorites(favs);
      setHydrated(favs);
    }).catch(() => {});
  }, [user]);

  // Hydrate missing backdrop_path from TMDB for legacy favorites
  useEffect(() => {
    if (favorites.length === 0) return;
    const missing = favorites.filter(f => !f.backdrop_path);
    if (missing.length === 0) return;

    Promise.allSettled(
      missing.map(f =>
        (f.media_type === 'tv' ? getTVDetails(f.tmdb_id) : getMovieDetails(f.tmdb_id))
          .then(detail => ({ tmdb_id: f.tmdb_id, backdrop_path: detail.backdrop_path ?? null }))
      )
    ).then(results => {
      const backdrops: Record<number, string | null> = {};
      for (const r of results) {
        if (r.status === 'fulfilled') backdrops[r.value.tmdb_id] = r.value.backdrop_path;
      }
      setHydrated(prev =>
        prev.map(f =>
          f.backdrop_path == null && backdrops[f.tmdb_id] !== undefined
            ? { ...f, backdrop_path: backdrops[f.tmdb_id] }
            : f
        )
      );
    });
  }, [favorites]);

  const allHeroMovies = hydrated.map(favToMovie);
  // Hero shows favorites — these are intentionally kept (user chose them);
  // no library filtering needed here since they ARE in the library.
  const heroMovies  = allHeroMovies;
  const recSources  = hydrated;

  // Scroll to the "Because You Loved" section anchored by rec-{tmdbId}
  const scrollToRec = useCallback((tmdbId: number) => {
    const el = document.getElementById(`rec-${tmdbId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <div className="relative min-h-screen bg-[#050a0e] flex flex-col overflow-x-hidden">
      <PageMeta seo={noindexMetadata('For You', '/for-you')} />

      {/* ── Silk background ── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Silk color="#0e7490" speed={3} scale={1.3} noiseIntensity={1.1} rotation={0.25} />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(160deg, rgba(0,18,26,0.82) 0%, rgba(0,12,20,0.88) 40%, rgba(0,8,16,0.92) 100%)' }} />
        <div className="absolute top-0 left-0 w-[600px] h-[400px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 0% 0%, rgba(6,182,212,0.10) 0%, transparent 70%)' }} />
      </div>

      <Navbar />

      {/* ── Hero ── */}
      <div className="relative z-10">
        {heroMovies.length > 0 ? (
          <HeroBanner movies={heroMovies} loading={false} />
        ) : (
          <div className="flex flex-col items-center justify-center py-28 px-6 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <Heart className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No favorites yet</h2>
            <p className="text-sm text-white/45 max-w-xs">
              Heart any movie or show on its detail page and it&#39;ll appear here as your personal hero banner.
            </p>
            <Link to="/"
              className="mt-6 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-colors"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
              Browse Content
            </Link>
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="flex flex-col gap-10 py-8 max-w-screen-2xl w-full mx-auto relative z-20">

        {/* My Favorites — click a card to scroll to its rec section */}
        {heroMovies.length > 0 && (
          <FavoritesScrollRow movies={heroMovies} onCardClick={scrollToRec} />
        )}

        {/* "Because you loved X" rows — library items excluded from recommendations */}
        {recSources.map(src => (
          <BecauseYouLovedRow
            key={src.tmdb_id}
            source={src}
            sectionId={`rec-${src.tmdb_id}`}
            libSet={libSet}
          />
        ))}

        {hydrated.length === 0 && (
          <p className="px-6 text-sm text-white/35">
            Add favorites from any detail page — recommendations will appear here automatically.
          </p>
        )}
      </div>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
