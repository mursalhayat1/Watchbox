import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Clapperboard } from 'lucide-react';
import type { Movie } from '@/services/tmdb';
import { tmdbImageUrl, tmdbBackdropUrl } from '@/services/tmdb';

interface MovieCardProps {
  movie: Movie;
  mediaType?: 'movie' | 'tv';
}

export default function MovieCard({ movie, mediaType }: MovieCardProps) {
  const [imgError, setImgError] = useState(false);
  const type = mediaType ?? (movie.media_type === 'tv' ? 'tv' : 'movie');
  const title = movie.title ?? movie.name ?? 'Unknown';
  const year = (movie.release_date ?? movie.first_air_date ?? '').slice(0, 4);

  // Prefer backdrop for the landscape card; fall back to poster
  const imageUrl = !imgError
    ? (movie.backdrop_path
        ? tmdbBackdropUrl(movie.backdrop_path)
        : movie.poster_path
          ? tmdbImageUrl(movie.poster_path, 'w500')
          : null)
    : null;

  const typeBadge = type === 'tv' ? 'TV' : 'MOVIE';

  return (
    <Link
      to={`/detail/${type}/${movie.id}`}
      className="group relative block w-full"
    >
      {/* 16:9 landscape image — no scale transform to avoid overlap */}
      <div
        className="relative w-full overflow-hidden bg-white/5 transition-all duration-200"
        style={{ aspectRatio: '16/9', borderRadius: '14px' }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-all duration-200 group-hover:brightness-110"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-white/5">
            <Clapperboard className="w-8 h-8 text-white/20" />
          </div>
        )}
        {/* Hover ring */}
        <div className="absolute inset-0 rounded-[14px] ring-1 ring-inset ring-transparent group-hover:ring-white/30 transition-all duration-200 pointer-events-none" />
        {/* Subtle bottom gradient for depth */}
        <div className="absolute inset-0 rounded-[14px] bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Metadata below card */}
      <div className="mt-2.5 px-0.5">
        <p className="text-sm font-semibold text-white leading-tight line-clamp-1 mb-1.5">
          {title}
        </p>
        <div className="flex items-center gap-2 text-[11px]">
          {/* Type badge */}
          <span
            className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide"
            style={{
              background: 'rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.65)',
            }}
          >
            {typeBadge}
          </span>
          {/* Year */}
          {year && (
            <span style={{ color: 'rgba(255,255,255,0.45)' }}>{year}</span>
          )}
          {/* Rating */}
          {movie.vote_average > 0 && (
            <span className="flex items-center gap-1 ml-auto shrink-0" style={{ color: 'rgba(255,255,255,0.75)' }}>
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {movie.vote_average.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
