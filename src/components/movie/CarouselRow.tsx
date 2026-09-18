import { useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Movie } from '@/services/tmdb';
import MovieCard from './MovieCard';
import MovieCardSkeleton from './MovieCardSkeleton';

interface CarouselRowProps {
  title: string;
  sectionLabel?: string;
  movies: Movie[];
  loading?: boolean;
  error?: string | null;
  viewAllLink?: string;
  mediaType?: 'movie' | 'tv';
}

// Liquid-glass button surface — shared inline style
const glassBtn: React.CSSProperties = {
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 100%)',
  border: '1px solid rgba(255,255,255,0.22)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.28), inset 1px 0 0 rgba(255,255,255,0.12)',
  transition: 'filter 200ms ease, transform 150ms ease',
};

export default function CarouselRow({
  title,
  sectionLabel,
  movies,
  loading = false,
  error = null,
  viewAllLink,
  mediaType,
}: CarouselRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -(el.clientWidth * 0.75) : el.clientWidth * 0.75, behavior: 'smooth' });
  };

  return (
    <section className="animate-fade-in">
      {/* Header — optional section label above title */}
      <div className="flex items-center justify-between px-4 md:px-6 mb-4">
        <div>
          {sectionLabel && (
            <p className="text-[10px] font-semibold tracking-widest uppercase mb-0.5"
              style={{ color: 'rgba(255,255,255,0.38)' }}>
              {sectionLabel}
            </p>
          )}
          <h2 className="text-base md:text-lg font-bold text-white">{title}</h2>
        </div>
        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="flex items-center gap-1 text-xs font-medium transition-colors shrink-0"
            style={{ color: 'rgba(255,255,255,0.45)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.9)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
          >
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>

      {/* Scroll row with side-overlay liquid-glass arrows — visible on hover */}
      <div className="relative group/carousel">

        {/* ← Left glass arrow */}
        <button
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          aria-label="Scroll left"
          className="absolute left-0 top-0 bottom-2 z-10 w-14 flex items-center justify-center
            opacity-0 group-hover/carousel:opacity-100 disabled:!opacity-0
            transition-opacity duration-200 pointer-events-none group-hover/carousel:pointer-events-auto"
          style={{ background: 'linear-gradient(to right, rgba(8,22,25,0.80) 0%, transparent 100%)' }}
        >
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white" style={glassBtn}>
            <ChevronLeft className="w-4 h-4" />
          </div>
        </button>

        {/* Scrollable row */}
        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="flex gap-3 overflow-x-auto hide-scrollbar px-4 md:px-6 pb-2"
        >
          {error && (
            <p className="text-sm py-4 px-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Unable to load content. Please check your TMDB API key.
            </p>
          )}
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="shrink-0 w-[160px] md:w-[260px]">
                  <MovieCardSkeleton />
                </div>
              ))
            : movies.map((movie) => (
                <div key={movie.id} className="shrink-0 w-[160px] md:w-[260px]">
                  <MovieCard movie={movie} mediaType={mediaType} />
                </div>
              ))}
          <div className="shrink-0 w-4 md:w-6" aria-hidden="true" />
        </div>

        {/* → Right glass arrow */}
        <button
          onClick={() => scroll('right')}
          disabled={!canScrollRight || loading || movies.length === 0}
          aria-label="Scroll right"
          className="absolute right-0 top-0 bottom-2 z-10 w-14 flex items-center justify-center
            opacity-0 group-hover/carousel:opacity-100 disabled:!opacity-0
            transition-opacity duration-200 pointer-events-none group-hover/carousel:pointer-events-auto"
          style={{ background: 'linear-gradient(to left, rgba(8,22,25,0.80) 0%, transparent 100%)' }}
        >
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white" style={glassBtn}>
            <ChevronRight className="w-4 h-4" />
          </div>
        </button>
      </div>
    </section>
  );
}
