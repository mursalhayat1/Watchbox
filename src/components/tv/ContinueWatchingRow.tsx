import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { getContinueWatching, type ContinueWatchingRow as CWRow } from '@/lib/supabase/episodeProgress';
import { tmdbImageUrl } from '@/services/tmdb';
import { useAuth } from '@/contexts/AuthContext';

function fmtProgress(pos: number, dur: number): string {
  if (!dur) return '';
  const pct = Math.round((pos / dur) * 100);
  return `${pct}%`;
}

function fmtTime(secs: number): string {
  if (!secs) return '';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function ContinueWatchingRow() {
  const { user } = useAuth();
  const [items, setItems] = useState<CWRow[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    getContinueWatching()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [user]);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => { el.removeEventListener('scroll', checkScroll); window.removeEventListener('resize', checkScroll); };
  }, [items]);

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -520 : 520, behavior: 'smooth' });
  };

  // Don't render anything until loaded and at least 1 item
  if (!user || (!loading && items.length === 0)) return null;

  return (
    <section className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 mb-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-white">Continue Watching</h2>
          {!loading && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.25)', color: 'rgb(34,211,238)' }}>
              {items.length} {items.length === 1 ? 'show' : 'shows'}
            </span>
          )}
        </div>
        {/* Arrow buttons — only on desktop */}
        <div className="hidden md:flex items-center gap-1">
          <button onClick={() => scroll('left')} disabled={!canLeft}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all disabled:opacity-20 hover:bg-white/10"
            style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <button onClick={() => scroll('right')} disabled={!canRight}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all disabled:opacity-20 hover:bg-white/10"
            style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Scroll row */}
      <div ref={scrollRef}
        className="flex gap-4 overflow-x-auto px-4 md:px-6 pb-2"
        style={{ scrollbarWidth: 'none' }}>
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[200px] md:w-[240px] rounded-xl bg-white/5 animate-pulse"
                style={{ aspectRatio: '2/3' }} />
            ))
          : items.map(item => {
              const poster = tmdbImageUrl(item.poster_path, 'w342');
              const pct = item.duration_secs > 0 ? (item.position_secs / item.duration_secs) * 100 : 0;
              const hasProgress = item.position_secs > 0;

              return (
                <Link
                  key={item.tv_id}
                  to={`/detail/tv/${item.tv_id}`}
                  className="flex-shrink-0 w-[160px] md:w-[200px] group block relative rounded-xl overflow-hidden"
                  style={{ aspectRatio: '2/3' }}>

                  {/* Poster */}
                  {poster ? (
                    <img src={poster} alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full bg-white/8 flex items-center justify-center">
                      <Play className="w-8 h-8 text-white/20" />
                    </div>
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                  {/* Play button — appears on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                      <Play className="w-5 h-5 text-white fill-white" />
                    </div>
                  </div>

                  {/* Bottom info */}
                  <div className="absolute bottom-0 left-0 right-0 p-2.5">
                    {/* Progress bar */}
                    {hasProgress && (
                      <div className="w-full h-1 rounded-full mb-2 overflow-hidden"
                        style={{ background: 'rgba(255,255,255,0.18)' }}>
                        <div className="h-full rounded-full"
                          style={{ width: `${Math.min(pct, 100)}%`, background: 'rgb(6,182,212)' }} />
                      </div>
                    )}

                    <p className="text-white text-xs font-semibold line-clamp-2 leading-snug mb-0.5">
                      {item.title}
                    </p>
                    <p className="text-white/50 text-[11px]">
                      S{item.season_number} E{item.episode_number}
                      {hasProgress && (
                        <span className="ml-1 text-white/35">
                          · {fmtProgress(item.position_secs, item.duration_secs)}
                          {item.duration_secs > 0 && ` · ${fmtTime(item.duration_secs - item.position_secs)} left`}
                        </span>
                      )}
                    </p>
                  </div>
                </Link>
              );
            })
        }
      </div>
    </section>
  );
}
