import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Plus, Info, Star, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Movie } from '@/services/tmdb';
import { tmdbBackdropUrl, tmdbLogoUrl, getMovieImages, getTVImages } from '@/services/tmdb';
import { GlassButton, GlassIconButton } from '@/components/ui/liquid-glass';

interface HeroBannerProps {
  movies: Movie[];
  loading?: boolean;
}

export default function HeroBanner({ movies, loading = false }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex]       = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false); // true while crossfade is active
  const [infoVisible, setInfoVisible]   = useState(true);    // drives info panel fade

  // Cache logo URLs keyed by movie ID so we don't re-fetch on slide change
  const logoCache = useRef<Record<number, string | null>>({});
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const featured = movies[currentIndex];

  // ── Slide advance — triggers crossfade sequence ─────────────────────────
  const advanceTo = useCallback((nextIdx: number) => {
    if (nextIdx === currentIndex) return;
    // 1. Fade info out
    setInfoVisible(false);
    // 2. After brief delay, swap backdrop (prev layer holds old image during fade)
    setTimeout(() => {
      setPrevIndex(currentIndex);
      setTransitioning(true);
      setCurrentIndex(nextIdx);
    }, 180); // 180ms — info fades out before backdrop starts changing
  }, [currentIndex]);

  // Auto-rotate every 8 seconds
  useEffect(() => {
    if (movies.length <= 1) return;
    const interval = setInterval(() => {
      const next = (currentIndex + 1) % Math.min(8, movies.length);
      advanceTo(next);
    }, 8000);
    return () => clearInterval(interval);
  }, [movies.length, currentIndex, advanceTo]);

  // When transition starts, fade in new info after crossfade completes
  useEffect(() => {
    if (!transitioning) return;
    const t = setTimeout(() => {
      setTransitioning(false);
      setPrevIndex(null);
      setInfoVisible(true);
    }, 900); // matches CSS transition-duration
    return () => clearTimeout(t);
  }, [transitioning, currentIndex]);

  // Fade info back in on first mount
  useEffect(() => { setInfoVisible(true); }, []);

  // ── Logo fetch (cached per movie ID) ──────────────────────────────────────
  useEffect(() => {
    if (!featured) { setLogoUrl(null); return; }
    const id = featured.id;
    if (id in logoCache.current) {
      setLogoUrl(logoCache.current[id]);
      return;
    }
    const type = featured.media_type === 'tv' ? 'tv' : 'movie';
    const fetchFn = type === 'tv' ? getTVImages : getMovieImages;
    fetchFn(id)
      .then(({ logos }) => {
        const sorted = [...logos].sort((a, b) => b.vote_average - a.vote_average);
        const best = sorted.find(l => l.iso_639_1 === 'en') ?? sorted[0] ?? null;
        const url = best ? tmdbLogoUrl(best.file_path) : null;
        logoCache.current[id] = url;
        setLogoUrl(url);
      })
      .catch(() => { logoCache.current[id] = null; setLogoUrl(null); });
  }, [featured]);

  const backdropUrl = featured ? tmdbBackdropUrl(featured.backdrop_path) : null;
  const prevBackdropUrl = prevIndex !== null && movies[prevIndex]
    ? tmdbBackdropUrl(movies[prevIndex].backdrop_path)
    : null;

  if (loading) {
    return (
      <div className="relative w-full bg-muted animate-pulse" style={{ height: 'clamp(360px, 70vh, 980px)' }}>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-14 space-y-3">
          <div className="h-10 bg-white/10 rounded w-56 mb-2" />
          <div className="h-4 bg-white/10 rounded w-32" />
          <div className="h-4 bg-white/10 rounded w-full max-w-sm" />
          <div className="h-4 bg-white/10 rounded w-3/4 max-w-xs" />
        </div>
      </div>
    );
  }

  if (!featured) return null;

  const title = featured.title ?? featured.name ?? 'Unknown';
  const type = featured.media_type === 'tv' ? 'tv' : 'movie';
  const year = (featured.release_date ?? featured.first_air_date ?? '').slice(0, 4);
  const genreMap: Record<number, string> = {
    28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
    80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
    14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
    9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 53: 'Thriller',
    10752: 'War', 37: 'Western', 10759: 'Action & Adventure',
    10762: 'Kids', 10763: 'News', 10764: 'Reality', 10765: 'Sci-Fi & Fantasy',
    10766: 'Soap', 10767: 'Talk', 10768: 'War & Politics',
  };
  const genreLabel = featured.genre_ids?.length
    ? (genreMap[featured.genre_ids[0]] ?? 'Film')
    : type === 'tv' ? 'Series' : 'Movie';

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: 'clamp(360px, 70vh, 980px)' }}
    >
      {/*
       * ── Dual backdrop layers for smooth crossfade ──
       * Layer A (z-0): outgoing image — held in place during transition, then removed.
       * Layer B (z-1): incoming image — fades in over the top of Layer A.
       * This gives a true dissolve with no black flash between slides.
       */}

      {/* Layer A — previous image (sits underneath, fades out as layer B fades in) */}
      {prevBackdropUrl && (
        <img
          key={`prev-${prevIndex}`}
          src={prevBackdropUrl}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 20%', zIndex: 0,
            opacity: transitioning ? 1 : 0,
            transition: 'opacity 900ms cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      )}

      {/* Layer B — current image (fades in on top) */}
      {backdropUrl && (
        <img
          key={`curr-${currentIndex}`}
          src={backdropUrl}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 20%', zIndex: 1,
            opacity: transitioning ? 0 : 1,
            transition: 'opacity 900ms cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      )}

      {/* ── Bottom fade: blends hero image into the Silk background below ── */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: '65%', zIndex: 2,
          background: `linear-gradient(to top,
            rgba(0, 8, 14, 1.00)    0%,
            rgba(0, 10, 18, 0.95)   6%,
            rgba(0, 12, 20, 0.85)  16%,
            rgba(0, 14, 22, 0.55)  35%,
            rgba(0, 14, 22, 0.18)  60%,
            transparent            100%)`,
        }}
      />

      {/* ── Top vignette — Navbar legibility ── */}
      <div
        className="absolute inset-x-0 top-0 pointer-events-none"
        style={{ height: '20%', zIndex: 2,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.50) 0%, transparent 100%)',
        }}
      />

      {/* ── Left vignette — text legibility ── */}
      <div
        className="absolute inset-y-0 left-0 pointer-events-none"
        style={{ width: '70%', zIndex: 2,
          background: 'linear-gradient(to right, rgba(0,0,0,0.60) 0%, rgba(0,0,0,0.18) 50%, transparent 100%)',
        }}
      />

      {/*
       * ── Info panel — fades out before slide changes, fades back in after ──
       * opacity + translateY give a gentle lift feel (like Apple TV+/Netflix).
       */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          zIndex: 20,
          opacity: infoVisible ? 1 : 0,
          transform: infoVisible ? 'translateY(0)' : 'translateY(8px)',
          transition: infoVisible
            ? 'opacity 500ms cubic-bezier(0.4,0,0.2,1), transform 500ms cubic-bezier(0.4,0,0.2,1)'
            : 'opacity 180ms ease-in, transform 180ms ease-in',
        }}
      >
        <div className="max-w-screen-2xl w-full mx-auto px-4 md:px-14 pb-8 md:pb-16">
          {/* Title — logo image when available, text fallback otherwise */}
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={title}
              className="mb-3 md:mb-4 drop-shadow-2xl"
              style={{ maxWidth: '220px', maxHeight: '90px', width: 'auto', height: 'auto',
                objectFit: 'contain', objectPosition: 'left center' }}
            />
          ) : (
            <h1 className="text-2xl md:text-6xl font-bold text-white mb-2 md:mb-3 leading-tight text-balance drop-shadow-lg max-w-2xl">
              {title}
            </h1>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-2 mb-2 md:mb-3 text-xs md:text-sm">
            {featured.vote_average > 0 && (
              <span className="flex items-center gap-1 font-semibold text-white">
                <Star className="w-3 h-3 md:w-3.5 md:h-3.5 fill-yellow-400 text-yellow-400" />
                {featured.vote_average.toFixed(1)}/10
              </span>
            )}
            {year && (
              <>
                <span className="text-white/40">·</span>
                <span className="flex items-center gap-1 text-white/80">
                  <Calendar className="w-3 h-3 text-white/50" />
                  {year}
                </span>
              </>
            )}
            <span className="text-white/40">·</span>
            <span className="text-white/80">{genreLabel}</span>
          </div>

          {/* Overview — max 3 lines with ellipsis */}
          {featured.overview && (
            <p className="text-sm md:text-base text-white/80 max-w-lg line-clamp-3 mb-5 md:mb-7 leading-relaxed">
              {featured.overview}
            </p>
          )}

          {/* Buttons */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Play */}
            <GlassButton asChild size="lg" active>
              <Link to={`/detail/${type}/${featured.id}`} className="flex items-center gap-2">
                <Play className="w-4 h-4 fill-black" /> Play
              </Link>
            </GlassButton>
            {/* Watchlist + */}
            <GlassIconButton size={40}>
              <Plus className="w-5 h-5" />
            </GlassIconButton>
            {/* More info */}
            <GlassIconButton size={40} asChild>
              <Link to={`/detail/${type}/${featured.id}`} aria-label="More info">
                <Info className="w-5 h-5" />
              </Link>
            </GlassIconButton>
          </div>
        </div>
      </div>

      {/* ── Dot indicators — bottom-right inside hero ── */}
      {movies.length > 1 && (
        <div className="absolute bottom-10 right-8 flex items-center gap-1.5" style={{ zIndex: 30 }}>
          {Array.from({ length: Math.min(8, movies.length) }).map((_, i) => (
            <button
              key={i}
              onClick={() => advanceTo(i)}
              aria-label={`Slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? 'bg-white w-5 h-1.5'
                  : 'bg-white/35 w-1.5 h-1.5 hover:bg-white/65'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

