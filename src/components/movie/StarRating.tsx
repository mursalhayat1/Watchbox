interface StarRatingProps {
  rating: number; // 0-10 TMDB scale
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function StarRating({ rating, maxStars = 5, size = 'sm' }: StarRatingProps) {
  const normalized = (rating / 10) * maxStars;
  const sizeMap = { sm: 12, md: 16, lg: 20 };
  const px = sizeMap[size];

  return (
    <div className="flex items-center gap-0.5" title={`${rating.toFixed(1)}/10`}>
      {Array.from({ length: maxStars }).map((_, i) => {
        const filled = normalized - i;
        const isHalf = filled > 0 && filled < 1;
        const isFull = filled >= 1;
        return (
          <svg
            key={i}
            width={px}
            height={px}
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {isHalf && (
                <linearGradient id={`half-${i}`} x1="0" x2="1" y1="0" y2="0">
                  <stop offset="50%" stopColor="hsl(38 80% 52%)" />
                  <stop offset="50%" stopColor="hsl(157 22% 19%)" />
                </linearGradient>
              )}
            </defs>
            <path
              d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.49L10 14.25 5.06 16.7 6 11.21l-4-3.9 5.53-.8L10 1.5z"
              fill={
                isFull
                  ? 'hsl(38 80% 52%)'
                  : isHalf
                    ? `url(#half-${i})`
                    : 'hsl(157 22% 19%)'
              }
            />
          </svg>
        );
      })}
      <span className="ml-1 text-xs text-muted-foreground font-medium">{rating.toFixed(1)}</span>
    </div>
  );
}
