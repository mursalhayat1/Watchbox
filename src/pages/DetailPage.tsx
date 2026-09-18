import { useRef, useState, useCallback, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Play, Plus, Star, Clock, Globe, Film, Users, ExternalLink, ChevronLeft, ChevronRight, ChevronDown, Check, Share2, Heart, X, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { toggleFavorite, isFavorited } from '@/lib/supabase/favorites';
import { getLibraryItem, addToLibrary } from '@/lib/supabase/library';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layouts/Navbar';
import Footer from '@/components/layouts/Footer';
import CarouselRow from '@/components/movie/CarouselRow';
import MediaPlayerModal from '@/components/movie/MediaPlayerModal';
import EpisodesSection from '@/components/tv/EpisodesSection';
import { GlassButton, GlassFilterDef } from '@/components/ui/liquid-glass';
import { useAsync, useTMDBList } from '@/hooks/useTMDB';
import { useLibraryItem } from '@/hooks/useLibrary';
import { LIBRARY_STATUSES, type LibraryStatus } from '@/lib/libraryApi';
import {
  getTVProgress,
  getMovieProgress,
} from '@/hooks/usePlaybackProgress';
import {
  getMovieDetails, getTVDetails,
  getSimilarMovies, getSimilarTV,
  getMovieImages, getTVImages,
  tmdbImageUrl, tmdbBackdropUrl, tmdbLogoUrl, tmdbProviderLogoUrl,
  type MovieDetails,
} from '@/services/tmdb';
import PageMeta from '@/components/common/PageMeta';
import { generateMovieMetadata, generateTVMetadata } from '@/lib/seo';

// ── Favorite button ───────────────────────────────────────────────────────────
function FavoriteButton({
  tmdbId, mediaType, title, posterPath, backdropPath, voteAverage, releaseDate,
}: {
  tmdbId: number; mediaType: 'movie' | 'tv';
  title: string; posterPath: string | null; backdropPath: string | null;
  voteAverage: number; releaseDate: string;
}) {
  const { user } = useAuth();
  const [favorited, setFavorited] = useState(false);
  const [busy, setBusy] = useState(false);

  // load initial state
  useEffect(() => {
    if (!user) return;
    isFavorited(tmdbId, mediaType).then(setFavorited).catch(() => {});
  }, [tmdbId, mediaType, user]);

  const handleToggle = useCallback(async () => {
    if (!user) { toast.error('Sign in to save favorites'); return; }
    setBusy(true);
    try {
      const next = await toggleFavorite({
        tmdb_id: tmdbId, media_type: mediaType,
        title, poster_path: posterPath, backdrop_path: backdropPath,
        vote_average: voteAverage, release_date: releaseDate,
      });
      setFavorited(next);
      if (next) {
        toast.success('Added to favorites');
        // Auto-add to Plan to Watch if not already in library
        try {
          const existing = await getLibraryItem(tmdbId, mediaType);
          if (!existing) {
            await addToLibrary({
              tmdb_id: tmdbId, media_type: mediaType, title,
              poster_path: posterPath, backdrop_path: backdropPath,
              vote_average: voteAverage, release_date: releaseDate,
              status: 'Plan to Watch', note: null, user_rating: null,
            });
            toast.success('Added to Plan to Watch');
          }
        } catch { /* silently ignore library error */ }
      } else {
        toast.success('Removed from favorites');
      }
    } catch {
      toast.error('Failed to update favorites');
    } finally {
      setBusy(false);
    }
  }, [user, tmdbId, mediaType, title, posterPath, backdropPath, voteAverage, releaseDate]);

  return (
    <GlassButton size="sm" active={favorited} disabled={busy}
      className="w-full justify-center gap-2"
      onClick={() => void handleToggle()}>
      <Heart className={`w-3.5 h-3.5 ${favorited ? 'fill-rose-400 text-rose-400' : ''}`} />
      {favorited ? 'Favorited' : 'Favorite'}
    </GlassButton>
  );
}

// ── helpers ───────────────────────────────────────────────────────────────────
function fmtRuntime(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ''}`.trim() : `${m}m`;
}

function fmtMoney(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'hsl(191 60% 5%)' }}>
      <Navbar />
      <div className="w-full h-[42vh] animate-pulse bg-white/5" />
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 -mt-32 relative z-10 flex gap-6 pt-4">
        <div className="shrink-0 w-[148px] h-[222px] rounded-2xl bg-white/8 animate-pulse" />
        <div className="flex-1 space-y-3 pt-16">
          <div className="h-8 bg-white/8 rounded w-64 animate-pulse" />
          <div className="h-4 bg-white/6 rounded w-40 animate-pulse" />
          <div className="h-4 bg-white/6 rounded w-full max-w-lg animate-pulse" />
          <div className="h-4 bg-white/6 rounded w-3/4 max-w-md animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// ── YouTube popup modal ───────────────────────────────────────────────────────
function YouTubeModal({ videoKey, videoTitle, onClose }: { videoKey: string; videoTitle?: string; onClose: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [embedBlocked, setEmbedBlocked] = useState(false);
  const youtubeUrl = `https://www.youtube.com/watch?v=${videoKey}`;

  // Close on Escape — skip when in native fullscreen
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.fullscreenElement) onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen?.();
  };

  // Detect Error 150/151/152/153 (embed disabled) via YouTube IFrame API postMessage.
  // YouTube sends: { event: "onError", func: "onError", args: [153] }
  // Also catches the older infoDelivery format just in case.
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      try {
        if (typeof e.data !== 'string') return;
        const msg = JSON.parse(e.data) as Record<string, unknown>;
        // Modern IFrame API format
        if (msg.event === 'onError') {
          const code = Array.isArray(msg.args) ? (msg.args[0] as number) : null;
          if (code !== null && [100, 101, 150, 151, 152, 153].includes(code)) {
            setEmbedBlocked(true);
          }
        }
        // Legacy infoDelivery format
        if (msg.event === 'infoDelivery' && typeof msg.info === 'number' &&
          [150, 152, 153].includes(msg.info)) {
          setEmbedBlocked(true);
        }
      } catch { /* ignore non-JSON messages */ }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  // enablejsapi=1 is required for onError postMessage events to fire.
  // origin must match window.location.origin for the API to initialise correctly.
  // Use a try/catch in case location.origin is unavailable (sandboxed frames).
  const origin = (() => {
    try { return window.location.origin; }
    catch { return ''; }
  })();
  const embedSrc = [
    `https://www.youtube-nocookie.com/embed/${videoKey}`,
    `?autoplay=1&rel=0&modestbranding=1`,
    `&enablejsapi=1`,
    origin ? `&origin=${encodeURIComponent(origin)}` : '',
  ].join('');

  return (
    <AnimatePresence>
      <motion.div
        key="yt-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-10"
        style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(6px)' }}
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          ref={containerRef}
          initial={{ scale: 0.93, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.93, opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-4xl flex flex-col rounded-2xl overflow-hidden"
          style={{ background: '#000', boxShadow: '0 32px 80px rgba(0,0,0,0.75)' }}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-2.5 shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <span className="text-sm font-medium text-white/70 truncate pr-4">
              {videoTitle ?? 'YouTube'}
            </span>
            <div className="flex items-center gap-1 shrink-0">
              {!embedBlocked && (
                <button onClick={handleFullscreen} aria-label="Fullscreen"
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                  style={{ color: 'rgba(255,255,255,0.55)' }}>
                  <Maximize2 className="w-4 h-4" />
                </button>
              )}
              <button onClick={onClose} aria-label="Close"
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                style={{ color: 'rgba(255,255,255,0.55)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Player area — iframe or blocked fallback */}
          <div className="w-full relative" style={{ aspectRatio: '16/9' }}>
            {embedBlocked ? (
              /* ── Embed-blocked fallback ── */
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-6 text-center"
                style={{ background: 'rgba(10,10,10,0.96)' }}>
                {/* YouTube logo-style icon */}
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)' }}>
                  <Play className="w-7 h-7 text-red-500 fill-red-500" />
                </div>
                <div>
                  <p className="text-white font-semibold mb-1">Embedding disabled by the video owner</p>
                  <p className="text-white/45 text-sm">This video can't be played here, but you can watch it directly on YouTube.</p>
                </div>
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors"
                  style={{ background: 'rgb(220,38,38)', color: '#fff' }}
                  onClick={onClose}
                >
                  <ExternalLink className="w-4 h-4" />
                  Watch on YouTube
                </a>
              </div>
            ) : (
              <iframe
                ref={iframeRef}
                src={embedSrc}
                className="w-full h-full border-0"
                allowFullScreen
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope"
                title={videoTitle ?? 'YouTube video'}
              />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Video thumbnail ───────────────────────────────────────────────────────────
function VideoCard({ video, onPlay }: { video: { key: string; name: string; site: string }; onPlay: (key: string) => void }) {
  const thumb = `https://img.youtube.com/vi/${video.key}/hqdefault.jpg`;
  return (
    <button
      onClick={() => onPlay(video.key)}
      className="shrink-0 w-[220px] md:w-[260px] group text-left"
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.06)' }}>
        <img
          src={thumb}
          alt={video.name}
          className="w-full h-full object-cover transition-all duration-200 group-hover:brightness-110"
        />
        {/* Red circular play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-150 group-hover:scale-110"
            style={{ background: 'rgba(220,38,38,0.95)', boxShadow: '0 4px 20px rgba(0,0,0,0.55)' }}>
            <Play className="w-5 h-5 fill-white text-white ml-0.5" />
          </div>
        </div>
      </div>
      {/* Title */}
      <div className="mt-2 px-0.5">
        <p className="text-sm font-semibold text-white/90 truncate leading-snug">{video.name}</p>
        <p className="text-xs text-white/40 mt-0.5">YouTube</p>
      </div>
    </button>
  );
}

// ── Reusable scroll section — side-overlay liquid-glass arrows on hover ────────
function HoverScrollSection({
  title, badge, icon, children, groupName = 'hss',
}: {
  title: string;
  badge?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  groupName?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 0);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  // Re-check scroll bounds after children paint and on resize
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    onScroll(); // initial check
    const ro = new ResizeObserver(onScroll);
    ro.observe(el);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => { ro.disconnect(); el.removeEventListener('scroll', onScroll); };
  }, [onScroll]);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -(el.clientWidth * 0.75) : el.clientWidth * 0.75, behavior: 'smooth' });
  };

  // Liquid-glass surface styles (matching GlassIconButton internals)
  const glassBtn: React.CSSProperties = {
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 100%)',
    border: '1px solid rgba(255,255,255,0.22)',
    boxShadow: '0 4px 24px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.28), inset 1px 0 0 rgba(255,255,255,0.12)',
    transition: 'filter 200ms ease, transform 150ms ease, background 200ms ease',
  };

  return (
    <section className="mt-12 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 mb-4">
        <h2 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
          {icon}{title}
        </h2>
        {badge && <span className="text-xs shrink-0" style={{ color: 'rgba(255,255,255,0.35)' }}>{badge}</span>}
      </div>

      {/* Scroll area — arrows fade in on hover */}
      <div className={`relative group/${groupName}`}>

        {/* ← Left glass arrow */}
        <button
          onClick={() => scroll('left')}
          disabled={!canLeft}
          aria-label="Scroll left"
          className={`absolute left-0 top-0 bottom-2 z-10 w-14 flex items-center justify-center
            opacity-0 group-hover/${groupName}:opacity-100 disabled:!opacity-0
            transition-opacity duration-200 pointer-events-none group-hover/${groupName}:pointer-events-auto`}
          style={{ background: 'linear-gradient(to right, rgba(8,22,25,0.80) 0%, transparent 100%)' }}
        >
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white"
            style={glassBtn}>
            <ChevronLeft className="w-4 h-4" />
          </div>
        </button>

        {/* Scroll row */}
        <div ref={scrollRef}
          className="flex gap-3 overflow-x-auto hide-scrollbar px-4 md:px-6 pb-2">
          {children}
          <div className="shrink-0 w-4 md:w-6" aria-hidden="true" />
        </div>

        {/* → Right glass arrow */}
        <button
          onClick={() => scroll('right')}
          disabled={!canRight}
          aria-label="Scroll right"
          className={`absolute right-0 top-0 bottom-2 z-10 w-14 flex items-center justify-center
            opacity-0 group-hover/${groupName}:opacity-100 disabled:!opacity-0
            transition-opacity duration-200 pointer-events-none group-hover/${groupName}:pointer-events-auto`}
          style={{ background: 'linear-gradient(to left, rgba(8,22,25,0.80) 0%, transparent 100%)' }}
        >
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white"
            style={glassBtn}>
            <ChevronRight className="w-4 h-4" />
          </div>
        </button>
      </div>
    </section>
  );
}

// ── Cast card — portrait ratio, badge overlay, matches reference ──────────────
function CastCard({ member }: { member: MovieDetails['credits'] extends { cast: infer C } ? C extends (infer M)[] ? M : never : never }) {
  const m = member as { id: number; name: string; character: string; profile_path: string | null; known_for_department?: string };
  const img = m.profile_path ? tmdbImageUrl(m.profile_path, 'w185') : null;
  const initials = m.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <Link to={`/person/${m.id}`} className="shrink-0 w-[120px] group">
      {/* Portrait photo — 2:3 ratio with department badge overlay top-left */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-white/8 border border-white/10 mb-2"
        style={{ aspectRatio: '2/3' }}>
        {img ? (
          <img src={img} alt={m.name}
            className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/40 text-xl font-bold">
            {initials}
          </div>
        )}
        {/* Acting/department badge — top-left pill */}
        {m.known_for_department && (
          <span className="absolute top-2 left-2 text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
            style={{ background: 'rgba(0,0,0,0.62)', color: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(4px)' }}>
            {m.known_for_department}
          </span>
        )}
      </div>
      <p className="text-xs font-semibold text-white/90 truncate leading-snug group-hover:text-white transition-colors">{m.name}</p>
      <p className="text-[11px] text-white/45 truncate mt-0.5">{m.character}</p>
    </Link>
  );
}

// ── Inline star display (read-only, half-star precision) ──────────────────────
function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(star => {
        const full = star * 2;
        const half = star * 2 - 1;
        const filled = rating >= full ? 'full' : rating >= half ? 'half' : 'empty';
        return (
          <svg key={star} viewBox="0 0 24 24" className="w-4 h-4">
            <defs>
              <linearGradient id={`sd-${star}`} x1="0" x2="1" y1="0" y2="0">
                <stop offset="50%" stopColor={filled === 'empty' ? 'transparent' : '#f59e0b'} stopOpacity={filled === 'empty' ? 0 : 1} />
                <stop offset="50%" stopColor={filled === 'full' ? '#f59e0b' : 'transparent'} stopOpacity={filled === 'full' ? 1 : 0} />
              </linearGradient>
            </defs>
            <Star stroke={filled === 'empty' ? 'rgba(255,255,255,0.18)' : '#f59e0b'}
              fill={`url(#sd-${star})`} strokeWidth={1.5} className="w-4 h-4" />
          </svg>
        );
      })}
    </div>
  );
}

// ── Library row (standalone, outside any card) ────────────────────────────────
function LibraryRow({
  tmdbId, mediaType, title, posterPath, backdropPath, voteAverage, releaseDate,
}: {
  tmdbId: number; mediaType: 'movie' | 'tv';
  title: string; posterPath: string | null; backdropPath: string | null;
  voteAverage: number; releaseDate: string;
}) {
  const { user } = useAuth();
  const { item, loading, add, remove, changeStatus } = useLibraryItem(tmdbId, mediaType);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleAdd = async (status: LibraryStatus) => {
    if (!user) return;
    setBusy(true);
    setPickerOpen(false);
    try {
      await add({
        tmdb_id: tmdbId, media_type: mediaType, title,
        poster_path: posterPath, backdrop_path: backdropPath,
        vote_average: voteAverage, release_date: releaseDate, status,
        note: null, user_rating: null,
      });
      toast.success(`Added to Library as "${status}"`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to add to library');
    } finally { setBusy(false); }
  };

  if (!user) return (
    <Link to="/login">
      <GlassButton size="md" className="gap-2.5 px-5">
        <Plus className="w-4 h-4 shrink-0" /> Sign in to Add
      </GlassButton>
    </Link>
  );

  if (loading) return (
    <div className="h-8 w-32 rounded-full bg-white/8 animate-pulse" />
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      {item ? (
        <>
          <div className="relative">
            <button onClick={() => setPickerOpen(v => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors hover:brightness-110"
              style={{ background: 'rgba(16,185,129,0.18)', border: '1px solid rgba(16,185,129,0.35)', color: 'rgb(52,211,153)' }}>
              <Check className="w-3 h-3 shrink-0" />
              {item.status}
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>
            {pickerOpen && (
              <div className="absolute left-0 top-full mt-1 z-50 rounded-xl overflow-hidden py-1 min-w-[160px]"
                style={{ background: 'rgba(10,22,26,0.98)', border: '1px solid rgba(255,255,255,0.14)', backdropFilter: 'blur(14px)', boxShadow: '0 8px 32px rgba(0,0,0,0.55)' }}>
                {LIBRARY_STATUSES.map(s => (
                  <button key={s} onClick={() => { void changeStatus(s); setPickerOpen(false); }}
                    className="w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-white/10 transition-colors flex items-center gap-2"
                    style={{ color: item.status === s ? '#fff' : 'rgba(255,255,255,0.6)' }}>
                    {item.status === s ? <Check className="w-3 h-3 shrink-0" /> : <span className="w-3 shrink-0" />}
                    {s}
                  </button>
                ))}
                <div className="h-px mx-2 my-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
                <button onClick={() => { void remove(); setPickerOpen(false); }}
                  className="w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-red-500/10 transition-colors"
                  style={{ color: 'rgba(239,68,68,0.8)' }}>
                  Remove from Library
                </button>
              </div>
            )}
          </div>

          {/* Your rating display */}
          {item.user_rating !== null && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40">Your rating</span>
              <StarDisplay rating={item.user_rating} />
              <span className="text-sm font-bold text-amber-400 leading-none">
                {item.user_rating.toFixed(0)}<span className="text-white/30 font-normal text-xs">/10</span>
              </span>
            </div>
          )}
        </>
      ) : (
        <div className="relative">
          <button disabled={busy} onClick={() => setPickerOpen(v => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors hover:bg-white/10 disabled:opacity-50"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.75)' }}>
            <Plus className="w-3 h-3 shrink-0" />
            {busy ? 'Adding…' : 'Add to Library'}
            {!busy && <ChevronDown className="w-3 h-3 opacity-60" />}
          </button>
          {pickerOpen && !busy && (
            <div className="absolute left-0 top-full mt-1 z-50 rounded-xl overflow-hidden py-1 min-w-[160px]"
              style={{ background: 'rgba(10,22,26,0.98)', border: '1px solid rgba(255,255,255,0.14)', backdropFilter: 'blur(14px)', boxShadow: '0 8px 32px rgba(0,0,0,0.55)' }}>
              <p className="px-3 pt-1.5 pb-1 text-[10px] uppercase tracking-widest text-white/30">Add as</p>
              {LIBRARY_STATUSES.map(s => (
                <button key={s} onClick={() => void handleAdd(s)}
                  className="w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-white/10 transition-colors"
                  style={{ color: 'rgba(255,255,255,0.75)' }}>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Overview + Notes card ─────────────────────────────────────────────────────
function OverviewNotesCard({
  overview, tmdbId, mediaType,
}: {
  overview: string;
  tmdbId: number; mediaType: 'movie' | 'tv';
}) {
  const { user } = useAuth();
  const { item, saveNoteRating } = useLibraryItem(tmdbId, mediaType);
  const [noteDraft, setNoteDraft] = useState('');

  useEffect(() => { setNoteDraft(item?.note ?? ''); }, [item?.id, item?.note]);

  const handleBlur = async () => {
    if (!item) return;
    const trimmed = noteDraft.trim() || null;
    // Skip if nothing changed
    if (trimmed === (item.note ?? null)) return;
    try {
      await saveNoteRating(trimmed, item.user_rating ?? null);
    } catch {
      // silently revert draft to saved value on error
      setNoteDraft(item.note ?? '');
    }
  };

  const boxStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '16px',
    overflow: 'hidden',
  };
  const divider: React.CSSProperties = { borderTop: '1px solid rgba(255,255,255,0.07)' };

  return (
    <div style={boxStyle}>
      {/* Overview */}
      <div className="px-5 pt-4 pb-4">
        <p className="text-sm font-semibold text-white mb-2">Overview</p>
        <p className="text-sm text-white/65 leading-relaxed">{overview}</p>
      </div>

      {/* Notes — only when signed in and item exists in library */}
      {user && item && (
        <div className="px-5 pt-3 pb-4" style={divider}>
          <p className="text-xs text-white/35 mb-2">My Notes</p>
          <textarea
            value={noteDraft}
            onChange={e => setNoteDraft(e.target.value)}
            onBlur={() => void handleBlur()}
            placeholder="Add a note…"
            maxLength={1000}
            rows={noteDraft ? Math.max(2, noteDraft.split('\n').length) : 2}
            className="w-full resize-none bg-transparent text-sm text-white placeholder-white/25 outline-none leading-relaxed"
          />
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function DetailPage() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const mediaId = Number(id);
  const isTV = type === 'tv';

  const [playerOpen, setPlayerOpen] = useState(false);
  const [playerSeason, setPlayerSeason] = useState(1);
  const [playerEpisode, setPlayerEpisode] = useState(1);
  const [youtubeVideo, setYoutubeVideo] = useState<{ key: string; title: string } | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const { user } = useAuth();
  const navigate = useNavigate();
  const { add: addToLib, item: libraryItem } = useLibraryItem(mediaId, isTV ? 'tv' : 'movie');

  const { data: movie, loading, error } = useAsync(
    () => isTV ? getTVDetails(mediaId) : getMovieDetails(mediaId),
    [mediaId, isTV]
  );

  // Auto-add to library as "Watching" when playback starts
  const handlePlayStart = useCallback(async (
    _season: number, _episode: number,
    _title: string, _posterPath: string | null, _backdropPath: string | null,
    _voteAverage: number, _releaseDate: string,
  ) => {
    if (!user) return;
    try {
      if (!libraryItem) {
        await addToLib({
          tmdb_id: mediaId,
          media_type: isTV ? 'tv' : 'movie',
          title: _title,
          poster_path: _posterPath,
          backdrop_path: _backdropPath,
          vote_average: _voteAverage,
          release_date: _releaseDate,
          status: 'Watching',
          note: null,
          user_rating: null,
        });
        toast.success('Added to Watching', { duration: 2000 });
      } else if (libraryItem.status !== 'Watching' && libraryItem.status !== 'Completed') {
        // Upgrade status to Watching if it was Plan to Watch / On Hold / Dropped
        await addToLib({ ...libraryItem, status: 'Watching' });
      }
    } catch { /* silently ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, libraryItem, mediaId, isTV]);

  const { movies: similar, loading: similarLoading } = useTMDBList(
    () => isTV ? getSimilarTV(mediaId) : getSimilarMovies(mediaId),
    [mediaId, isTV]
  );

  // Fetch title logo image (English PNG from TMDB /images)
  useEffect(() => {
    const fetchFn = isTV ? getTVImages : getMovieImages;
    fetchFn(mediaId).then(({ logos }) => {
      const sorted = [...logos].sort((a, b) => b.vote_average - a.vote_average);
      const best = sorted.find(l => l.iso_639_1 === 'en') ?? sorted[0] ?? null;
      setLogoUrl(best ? tmdbLogoUrl(best.file_path) : null);
    }).catch(() => setLogoUrl(null));
  }, [mediaId, isTV]);

  const backdropUrl = movie ? tmdbBackdropUrl(movie.backdrop_path) : null;
  const posterUrl = tmdbImageUrl(movie?.poster_path ?? null, 'w500');
  if (loading) return <LoadingSkeleton />;

  if (error || !movie) {
    return (
      <div className="flex flex-col min-h-screen" style={{ background: 'hsl(191 60% 5%)' }}>
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <p className="text-white/60 text-lg">Could not load this title.</p>
            <Link to="/" className="text-white/40 hover:text-white text-sm underline">← Go back home</Link>
          </div>
        </div>
      </div>
    );
  }

  const title = movie.title ?? movie.name ?? 'Unknown';
  const year = (movie.release_date ?? movie.first_air_date ?? '').slice(0, 4);

  // posterUrl used for poster image display
  const genres = movie.genres ?? [];
  const cast = (movie.credits?.cast ?? []).slice(0, 20);
  const videos = (movie.videos?.results ?? []).filter(v => v.site === 'YouTube').slice(0, 10);
  const trailer = videos.find(v => v.type === 'Trailer') ?? videos[0];
  const director = movie.credits?.crew?.find(c => c.job === 'Director');
  const companies = movie.production_companies ?? [];

  // watch/providers is appended under this slash-key
  type WPResult = { results?: Record<string, { flatrate?: { logo_path: string; provider_name: string }[] }> };
  const watchData = (movie as unknown as Record<string, unknown>)['watch/providers'] as WPResult | undefined;
  const streamingProviders = watchData?.results?.['US']?.flatrate ?? [];

  // imdb_id may come from external_ids appended response
  const externalIds = (movie as unknown as Record<string, unknown>)['external_ids'] as { imdb_id?: string } | undefined;
  const imdbId = movie.imdb_id ?? externalIds?.imdb_id;

  // Silk cyan #0e7490 = hsl(191 80% 31%) — derive static dark variants:
  //   near-black base  → hsl(191 60% 5%)
  //   primary dark     → hsl(191 55% 11%)
  //   secondary dark   → hsl(191 40% 8%)
  const cyanNb  = 'hsl(191 60% 5%)';
  const cyanDp  = 'hsl(191 55% 11%)';
  const cyanDs  = 'hsl(191 40% 8%)';

  // Generate page-level SEO — reuses already-fetched movie data, no extra API call
  const seo = isTV
    ? generateTVMetadata(movie, `/detail/tv/${movie.id}`)
    : generateMovieMetadata(movie, `/detail/movie/${movie.id}`);

  return (
    <div className="relative flex flex-col min-h-screen overflow-x-hidden" style={{ background: cyanNb }}>
      <PageMeta seo={seo} />
      <GlassFilterDef />

      {/* ── Static cyan background — same hue as Silk (#0e7490), no animation ── */}
      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
        {/* Near-black cyan base */}
        <div className="absolute inset-0" style={{ background: cyanNb }} />
        {/* Large top-left radial bloom — primary cyan */}
        <div className="absolute inset-0" style={{
          background: `radial-gradient(ellipse 80% 60% at 15% -5%, ${cyanDp} 0%, transparent 70%)`,
        }} />
        {/* Secondary accent bloom — top-right */}
        <div className="absolute inset-0" style={{
          background: `radial-gradient(ellipse 60% 40% at 85% 5%, ${cyanDs} 0%, transparent 65%)`,
        }} />
        {/* Bottom vignette back to base */}
        <div className="absolute inset-0" style={{
          background: `linear-gradient(to bottom, transparent 40%, ${cyanNb} 100%)`,
        }} />
      </div>

      <Navbar />

      {/* ── Backdrop hero — full-width, tall; trailer plays looped+muted behind content ── */}
      <div className="relative w-full z-10 overflow-hidden" style={{ height: 'clamp(240px, 42vh, 640px)' }}>

        {/* Static backdrop always rendered — acts as poster frame while iframe loads */}
        {backdropUrl && (
          <img src={backdropUrl} alt={title}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: 'center 20%' }}
          />
        )}

        {/* YouTube trailer — autoplay, muted, looped, no controls, overscanned to hide letterbox bars */}
        {trailer && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <iframe
              key={trailer.key}
              src={`https://www.youtube-nocookie.com/embed/${trailer.key}?autoplay=1&mute=1&loop=1&playlist=${trailer.key}&controls=0&modestbranding=1&showinfo=0&rel=0&iv_load_policy=3&disablekb=1&fs=0&playsinline=1&enablejsapi=0`}
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope"
              allowFullScreen={false}
              title={`${title} trailer`}
              style={{
                position: 'absolute',
                /* Overscan: scale iframe to 16:9 and push it to fill any container aspect ratio */
                width: '177.78vh',   /* 16/9 × 100vh */
                minWidth: '100%',
                height: '56.25vw',   /* 9/16 × 100vw */
                minHeight: '100%',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                border: 'none',
              }}
            />
          </div>
        )}

        {/* Blend gradients over video/backdrop */}
        <div className="absolute inset-0" style={{
          background: `linear-gradient(to top, ${cyanNb} 0%, rgba(0,0,0,0.25) 42%, transparent 100%)`,
        }} />
        <div className="absolute inset-0" style={{
          background: `linear-gradient(to right, ${cyanNb}d9 0%, transparent 48%)`,
        }} />
        <div className="absolute inset-0" style={{
          background: `linear-gradient(to top, ${cyanDp}99 0%, transparent 48%)`,
        }} />
      </div>

      {/* ── Main content — poster straddles backdrop bottom edge ── */}
      <main className="relative z-10 -mt-24 md:-mt-40 pb-20 md:pb-16">
        <div className="w-full">

          {/* ── Top row: poster + info — mobile: centered column, desktop: side-by-side ── */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center md:items-start px-4 md:px-6">

            {/* Poster + action buttons column */}
            <div className="shrink-0 flex flex-col gap-2 md:gap-3 w-[140px] md:w-[190px]">
              {posterUrl ? (
                <img src={posterUrl} alt={title}
                  className="w-full rounded-xl shadow-2xl border border-white/15"
                  style={{ aspectRatio: '2/3', objectFit: 'cover' }}
                />
              ) : (
                <div className="w-full rounded-xl bg-white/8 border border-white/10 flex items-center justify-center"
                  style={{ aspectRatio: '2/3' }}>
                  <Film className="w-10 h-10 text-white/20" />
                </div>
              )}
              {/* Action buttons — hidden on mobile (shown below info panel instead) */}
              <div className="hidden md:flex flex-col gap-2">
                {trailer && (
                  <GlassButton size="sm" className="w-full justify-center gap-2"
                    onClick={() => setYoutubeVideo({ key: trailer.key, title: trailer.name ?? 'Trailer' })}>
                    <Play className="w-3.5 h-3.5" /> Watch Trailer
                  </GlassButton>
                )}
                <GlassButton size="sm" active className="w-full justify-center gap-2"
                  onClick={() => {
                    if (isTV) {
                      const tvProg = getTVProgress(mediaId);
                      setPlayerSeason(tvProg?.season ?? 1);
                      setPlayerEpisode(tvProg?.episode ?? 1);
                    } else {
                      setPlayerSeason(1);
                      setPlayerEpisode(1);
                    }
                    if (!user) { navigate('/login'); return; }
                    setPlayerOpen(true);
                  }}>
                  <Play className="w-3.5 h-3.5 fill-black" />
                  {isTV ? (
                    (() => {
                      const p = getTVProgress(mediaId);
                      return p ? `Resume S${String(p.season).padStart(2,'0')}E${String(p.episode).padStart(2,'0')}` : 'Watch Show';
                    })()
                  ) : (
                    (() => {
                      const p = getMovieProgress(mediaId);
                      return p && p.positionSecs > 0 ? 'Resume Movie' : 'Watch Movie';
                    })()
                  )}
                </GlassButton>
                <GlassButton size="sm" className="w-full justify-center gap-2" onClick={() => {
                  void navigator.share?.({ title, url: window.location.href })
                    .catch(() => { void navigator.clipboard.writeText(window.location.href); });
                }}>
                  <Share2 className="w-3.5 h-3.5" /> Share
                </GlassButton>
                <FavoriteButton
                  tmdbId={movie.id}
                  mediaType={isTV ? 'tv' : 'movie'}
                  title={title}
                  posterPath={movie.poster_path ?? null}
                  backdropPath={movie.backdrop_path ?? null}
                  voteAverage={movie.vote_average}
                  releaseDate={movie.release_date ?? movie.first_air_date ?? ''}
                />
              </div>
            </div>

            {/* Info panel — top-aligned with the poster top on md+ */}
            <div className="flex-1 min-w-0 md:pt-36 w-full">
              {/* Mobile action buttons — shown only on mobile, full width, below poster */}
              <div className="flex flex-col gap-2 mb-4 md:hidden">
                {trailer && (
                  <GlassButton size="sm" className="w-full justify-center gap-2"
                    onClick={() => setYoutubeVideo({ key: trailer.key, title: trailer.name ?? 'Trailer' })}>
                    <Play className="w-3.5 h-3.5" /> Watch Trailer
                  </GlassButton>
                )}
                <GlassButton size="sm" active className="w-full justify-center gap-2"
                  onClick={() => {
                    if (isTV) {
                      const tvProg = getTVProgress(mediaId);
                      setPlayerSeason(tvProg?.season ?? 1);
                      setPlayerEpisode(tvProg?.episode ?? 1);
                    } else {
                      setPlayerSeason(1);
                      setPlayerEpisode(1);
                    if (!user) { navigate('/login'); return; }
                    }
                    setPlayerOpen(true);
                  }}>
                  <Play className="w-3.5 h-3.5 fill-black" />
                  {isTV ? (
                    (() => {
                      const p = getTVProgress(mediaId);
                      return p ? `Resume S${String(p.season).padStart(2,'0')}E${String(p.episode).padStart(2,'0')}` : 'Watch Show';
                    })()
                  ) : (
                    (() => {
                      const p = getMovieProgress(mediaId);
                      return p && p.positionSecs > 0 ? 'Resume Movie' : 'Watch Movie';
                    })()
                  )}
                </GlassButton>
                <div className="flex gap-2">
                  <GlassButton size="sm" className="flex-1 justify-center gap-2" onClick={() => {
                    void navigator.share?.({ title, url: window.location.href })
                      .catch(() => { void navigator.clipboard.writeText(window.location.href); });
                  }}>
                    <Share2 className="w-3.5 h-3.5" /> Share
                  </GlassButton>
                  <div className="flex-1">
                    <FavoriteButton
                      tmdbId={movie.id}
                      mediaType={isTV ? 'tv' : 'movie'}
                      title={title}
                      posterPath={movie.poster_path ?? null}
                      backdropPath={movie.backdrop_path ?? null}
                      voteAverage={movie.vote_average}
                      releaseDate={movie.release_date ?? movie.first_air_date ?? ''}
                    />
                  </div>
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-1 leading-tight">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={title}
                    className="max-h-20 md:max-h-28 w-auto object-contain drop-shadow-lg"
                    style={{ maxWidth: '420px' }}
                  />
                ) : title}
              </h1>
              {movie.tagline && (
                <p className="text-white/55 italic text-sm mb-3">"{movie.tagline}"</p>
              )}

              {/* Meta chips */}
              <div className="flex flex-wrap items-center gap-3 mb-3 text-sm text-white/70">
                {year && (
                  <span className="flex items-center gap-1.5">
                    <span className="text-white/40">🗓</span> {year}
                  </span>
                )}
                {movie.runtime && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-white/40" /> {fmtRuntime(movie.runtime)}
                  </span>
                )}
                {movie.vote_average > 0 && (
                  <span className="flex items-center gap-1.5 font-semibold text-white">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    {movie.vote_average.toFixed(1)}
                    {movie.vote_count > 0 && (
                      <span className="text-white/45 font-normal text-xs">({movie.vote_count.toLocaleString()} votes)</span>
                    )}
                  </span>
                )}
              </div>

              {/* Genre pills */}
              {genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {genres.map(g => (
                    <span key={g.id}
                      className="text-xs px-3 py-1 rounded-full font-medium"
                      style={{ background: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.80)', border: '1px solid rgba(255,255,255,0.18)' }}>
                      {g.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Library row — standalone outside any box */}
              <div className="mb-5">
                <LibraryRow
                  tmdbId={movie.id}
                  mediaType={isTV ? 'tv' : 'movie'}
                  title={title}
                  posterPath={movie.poster_path ?? null}
                  backdropPath={movie.backdrop_path ?? null}
                  voteAverage={movie.vote_average}
                  releaseDate={movie.release_date ?? movie.first_air_date ?? ''}
                />
              </div>

              {/* Overview + Notes in one box */}
              <div className="mb-4">
                <OverviewNotesCard
                  overview={movie.overview}
                  tmdbId={movie.id}
                  mediaType={isTV ? 'tv' : 'movie'}
                />
              </div>

              {/* Links & Companies row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                {/* Links & Resources */}
                <div className="rounded-2xl p-4"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" /> Links &amp; Resources
                  </h3>
                  <div className="space-y-2">
                    {movie.homepage && (
                      <div>
                        <p className="text-white/40 text-xs mb-1.5">Website</p>
                        <a href={movie.homepage} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg text-white/80 hover:text-white transition-colors"
                          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.10)' }}>
                          <Globe className="w-3 h-3" /> Website
                        </a>
                      </div>
                    )}
                    {imdbId && (
                      <a href={`https://www.imdb.com/title/${imdbId}`} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg text-yellow-400/90 hover:text-yellow-300 transition-colors"
                        style={{ background: 'rgba(250,204,21,0.10)', border: '1px solid rgba(250,204,21,0.20)' }}>
                        <ExternalLink className="w-3 h-3" /> IMDb View
                      </a>
                    )}
                  </div>
                </div>

                {/* Production Companies */}
                {companies.length > 0 && (
                  <div className="rounded-2xl p-4"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5" /> Production Companies
                    </h3>
                    <div className="flex flex-wrap items-center gap-3">
                      {companies.slice(0, 4).map(co => (
                        <div key={co.id} className="flex items-center gap-2">
                          {co.logo_path ? (
                            <img src={tmdbImageUrl(co.logo_path, 'w92') ?? ''} alt={co.name}
                              className="h-6 w-auto object-contain"
                              style={{ filter: 'brightness(0) invert(1)', opacity: 0.7 }}
                            />
                          ) : (
                            <span className="text-xs text-white/55">{co.name}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer meta — language, budget, director */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-white/40 mb-3">
                {movie.original_language && (
                  <span>Language: <span className="text-white/65 uppercase font-medium">{movie.original_language}</span></span>
                )}
                {movie.budget != null && movie.budget > 0 && (
                  <span>Budget: <span className="text-white/65 font-medium">{fmtMoney(movie.budget)}</span></span>
                )}
                {director && (
                  <span>Director: <span className="text-white/65 font-medium">{director.name}</span></span>
                )}
              </div>

              {/* Streaming providers */}
              {streamingProviders.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-white/35">Available on</span>
                  {streamingProviders.map((p, i) => (
                    <div key={i} className="w-8 h-8 rounded-lg overflow-hidden border border-white/10" title={p.provider_name}>
                      <img src={tmdbProviderLogoUrl(p.logo_path) ?? ''} alt={p.provider_name} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Episodes (TV only) ── */}
          {isTV && (
            <EpisodesSection
              tvId={movie.id}
              totalSeasons={movie.number_of_seasons ?? 1}
              onPlayEpisode={(s, e) => {
                if (!user) { navigate('/login'); return; }
                setPlayerSeason(s);
                setPlayerEpisode(e);
                setPlayerOpen(true);
              }}
            />
          )}

          {/* ── Videos & Trailers ── */}
          {videos.length > 0 && (
            <HoverScrollSection
              title="Videos &amp; Trailers"
              badge={`${videos.length} videos`}
              icon={<Play className="w-4 h-4" />}
              groupName="videos"
            >
              {videos.map(v => <VideoCard key={v.id} video={v} onPlay={(key) => setYoutubeVideo({ key, title: v.name })} />)}
            </HoverScrollSection>
          )}

          {/* ── Cast & Crew ── */}
          {cast.length > 0 && (
            <HoverScrollSection
              title="Cast &amp; Crew"
              badge={`${movie.credits?.cast?.length ?? 0} members`}
              icon={<Users className="w-4 h-4" />}
              groupName="cast"
            >
              {cast.map(member => <CastCard key={member.id} member={member as never} />)}
            </HoverScrollSection>
          )}

          {/* ── Similar ── */}
          {(similar.length > 0 || similarLoading) && (
            <section className="mt-12">
              <CarouselRow
                title={isTV ? 'Similar Shows' : 'Similar Movies'}
                movies={similar}
                loading={similarLoading}
                mediaType={isTV ? 'tv' : 'movie'}
              />
            </section>
          )}
        </div>
      </main>

      <div className="relative z-10">
        <Footer />
      </div>

      <MediaPlayerModal
        open={playerOpen}
        onClose={() => setPlayerOpen(false)}
        onPlayStart={(_s, _e) => void handlePlayStart(
          _s, _e,
          title,
          movie.poster_path ?? null,
          movie.backdrop_path ?? null,
          movie.vote_average,
          movie.release_date ?? movie.first_air_date ?? '',
        )}
        tmdbId={movie.id}
        mediaType={isTV ? 'tv' : 'movie'}
        title={title}
        totalSeasons={movie.number_of_seasons ?? 1}
        initialSeason={playerSeason}
        initialEpisode={playerEpisode}
      />

      {youtubeVideo && (
        <YouTubeModal
          videoKey={youtubeVideo.key}
          videoTitle={youtubeVideo.title}
          onClose={() => setYoutubeVideo(null)}
        />
      )}
    </div>
  );
}
