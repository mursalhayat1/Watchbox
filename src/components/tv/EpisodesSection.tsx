import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, CheckCircle2, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { getTVSeason, tmdbImageUrl, type TvEpisode } from '@/services/tmdb';
import { getShowProgress, markEpisodeWatched, type EpisodeProgress } from '@/lib/supabase/episodeProgress';
import { isEpisodeWatchedLocal } from '@/hooks/usePlaybackProgress';
import { useAuth } from '@/contexts/AuthContext';
import { GlassIconButton } from '@/components/ui/liquid-glass';

// ── helpers ──────────────────────────────────────────────────────────────────
function fmtRuntime(mins: number | null): string {
  if (!mins) return '';
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function fmtDate(d: string | null): string {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ── EpisodeCard ───────────────────────────────────────────────────────────────
function EpisodeCard({
  episode,
  tvId,
  progress,
  onPlay,
  onMarkWatched,
}: {
  episode: TvEpisode;
  tvId: number;
  progress: EpisodeProgress | undefined;
  onPlay: (ep: TvEpisode) => void;
  onMarkWatched: (ep: TvEpisode) => void;
}) {
  // Merge: server-side watched OR local localStorage watched
  const serverWatched = progress?.watched ?? false;
  const localWatched  = isEpisodeWatchedLocal(tvId, episode.season_number, episode.episode_number);
  const watched = serverWatched || localWatched;
  const still = tmdbImageUrl(episode.still_path, 'w300');

  return (
    <div className="flex-shrink-0 w-[220px] md:w-[260px] flex flex-col gap-2 cursor-pointer group"
      onClick={() => onPlay(episode)}>

      {/* Thumbnail */}
      <div className="relative rounded-xl overflow-hidden"
        style={{ aspectRatio: '16/9', background: 'rgba(255,255,255,0.06)' }}>
        {still ? (
          <img src={still} alt={episode.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="w-8 h-8 text-white/20" />
          </div>
        )}

        {/* Dark gradient overlay at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
            <Play className="w-4 h-4 text-white fill-white" />
          </div>
        </div>

        {/* EP badge top-right */}
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[11px] font-bold text-white"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}>
          EP {episode.episode_number}
        </div>

        {/* Watched tick bottom-left */}
        {watched && (
          <div className="absolute bottom-2 left-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 drop-shadow" fill="rgba(0,0,0,0.6)" />
          </div>
        )}

        {/* Playback progress bar — bottom of thumbnail */}
        {!watched && progress && progress.position_secs > 0 && progress.duration_secs > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1"
            style={{ background: 'rgba(255,255,255,0.15)' }}>
            <div className="h-full"
              style={{
                width: `${Math.min((progress.position_secs / progress.duration_secs) * 100, 100)}%`,
                background: 'rgb(6,182,212)',
              }} />
          </div>
        )}
      </div>

      {/* Episode title */}
      <p className="text-sm font-semibold text-white leading-snug line-clamp-1 px-0.5">
        {episode.name}
      </p>

      {/* Overview snippet */}
      <p className="text-xs text-white/50 leading-relaxed line-clamp-2 px-0.5">
        {episode.overview || 'No description available.'}
      </p>

      {/* Footer: runtime + watched toggle */}
      <div className="flex items-center justify-between px-0.5 mt-auto">
        <div className="flex items-center gap-1 text-[11px] text-white/35">
          {episode.runtime && (
            <>
              <Clock className="w-3 h-3" />
              <span>{fmtRuntime(episode.runtime)}</span>
            </>
          )}
          {episode.air_date && (
            <span className="ml-1 text-white/25">{fmtDate(episode.air_date)}</span>
          )}
        </div>

        {/* Manual watched toggle */}
        <button
          onClick={e => { e.stopPropagation(); onMarkWatched(episode); }}
          title={watched ? 'Watched' : 'Mark as watched'}
          className="transition-opacity hover:opacity-80">
          <CheckCircle2
            className="w-4 h-4"
            style={{ color: watched ? '#34d399' : 'rgba(255,255,255,0.25)' }}
          />
        </button>
      </div>
    </div>
  );
}

// ── EpisodesSection (main export) ────────────────────────────────────────────
export default function EpisodesSection({
  tvId,
  totalSeasons,
  onPlayEpisode,
}: {
  tvId: number;
  totalSeasons: number;
  onPlayEpisode: (seasonNumber: number, episodeNumber: number) => void;
}) {
  const { user } = useAuth();
  const [activeSeason, setActiveSeason] = useState(1);
  const [episodes, setEpisodes] = useState<TvEpisode[]>([]);
  const [loadingEps, setLoadingEps] = useState(true);
  const [progressMap, setProgressMap] = useState<Record<string, EpisodeProgress>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  const progressKey = (s: number, e: number) => `${s}-${e}`;

  // Load season episodes
  useEffect(() => {
    setLoadingEps(true);
    getTVSeason(tvId, activeSeason)
      .then(s => setEpisodes(s.episodes ?? []))
      .catch(() => setEpisodes([]))
      .finally(() => setLoadingEps(false));
    // Scroll back to start on season change
    scrollRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
  }, [tvId, activeSeason]);

  // Load user's watched progress
  const loadProgress = useCallback(async () => {
    if (!user) return;
    const rows = await getShowProgress(tvId);
    const map: Record<string, EpisodeProgress> = {};
    for (const r of rows) map[progressKey(r.season_number, r.episode_number)] = r;
    setProgressMap(map);
  }, [tvId, user]);

  useEffect(() => { void loadProgress(); }, [loadProgress]);

  const handlePlay = async (ep: TvEpisode) => {
    onPlayEpisode(ep.season_number, ep.episode_number);
  };

  const handleMarkWatched = async (ep: TvEpisode) => {
    if (!user) return;
    const key = progressKey(ep.season_number, ep.episode_number);
    const current = progressMap[key]?.watched ?? false;
    // Toggle: if already watched, do nothing special — we still keep it watched
    if (!current) {
      await markEpisodeWatched(tvId, ep.season_number, ep.episode_number);
      setProgressMap(prev => ({
        ...prev,
        [key]: {
          ...(prev[key] ?? {}),
          id: '',
          user_id: '',
          tv_id: tvId,
          season_number: ep.season_number,
          episode_number: ep.episode_number,
          watched: true,
          position_secs: 0,
          duration_secs: 0,
          updated_at: new Date().toISOString(),
        },
      }));
    }
  };

  const seasons = Array.from({ length: totalSeasons }, (_, i) => i + 1);

  // ── scroll state for hover arrows ──────────────────────────────────────────
  const [canLeft, setCanLeft]   = useState(false);
  const [canRight, setCanRight] = useState(true);

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 0);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  const scrollBy = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -(el.clientWidth * 0.75) : el.clientWidth * 0.75, behavior: 'smooth' });
  };

  return (
    <section className="mt-10 mb-2">
      {/* Header */}
      <div className="px-4 md:px-6 mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Episodes</h2>
      </div>

      {/* Season switcher pills */}
      <div className="px-4 md:px-6 mb-4 flex items-center gap-2 flex-wrap">
        {seasons.map(s => (
          <button
            key={s}
            onClick={() => setActiveSeason(s)}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
            style={
              activeSeason === s
                ? { background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.35)', color: '#fff' }
                : { background: 'transparent', border: '1px solid rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.55)' }
            }>
            Season {s}
          </button>
        ))}
      </div>

      {/* Episode scroll row with hover glass arrows */}
      <div className="relative group/eps">

        {/* ← Left glass arrow */}
        <button
          onClick={() => scrollBy('left')}
          disabled={!canLeft}
          aria-label="Scroll left"
          className="absolute left-0 top-0 bottom-2 z-10 w-16 flex items-center justify-center
            opacity-0 group-hover/eps:opacity-100 disabled:!opacity-0
            transition-opacity duration-200 pointer-events-none group-hover/eps:pointer-events-auto"
          style={{ background: 'linear-gradient(to right, rgba(8,22,25,0.85) 0%, transparent 100%)' }}
        >
          <GlassIconButton size={36} aria-hidden tabIndex={-1}>
            <ChevronLeft className="w-4 h-4" />
          </GlassIconButton>
        </button>

        {/* Scroll row */}
        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="flex gap-4 overflow-x-auto px-4 md:px-6 pb-4"
          style={{ scrollbarWidth: 'none' }}>
          {loadingEps
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[220px] md:w-[260px] flex flex-col gap-2">
                  <div className="rounded-xl bg-white/6 animate-pulse" style={{ aspectRatio: '16/9' }} />
                  <div className="h-3.5 w-3/4 rounded bg-white/6 animate-pulse" />
                  <div className="h-3 w-full rounded bg-white/4 animate-pulse" />
                  <div className="h-3 w-2/3 rounded bg-white/4 animate-pulse" />
                </div>
              ))
            : episodes.map(ep => (
                <EpisodeCard
                  key={ep.id}
                  episode={ep}
                  tvId={tvId}
                  progress={progressMap[progressKey(ep.season_number, ep.episode_number)]}
                  onPlay={handlePlay}
                  onMarkWatched={handleMarkWatched}
                />
              ))
          }
          <div className="shrink-0 w-4 md:w-6" aria-hidden="true" />
        </div>

        {/* → Right glass arrow */}
        <button
          onClick={() => scrollBy('right')}
          disabled={!canRight}
          aria-label="Scroll right"
          className="absolute right-0 top-0 bottom-2 z-10 w-16 flex items-center justify-center
            opacity-0 group-hover/eps:opacity-100 disabled:!opacity-0
            transition-opacity duration-200 pointer-events-none group-hover/eps:pointer-events-auto"
          style={{ background: 'linear-gradient(to left, rgba(8,22,25,0.85) 0%, transparent 100%)' }}
        >
          <GlassIconButton size={36} aria-hidden tabIndex={-1}>
            <ChevronRight className="w-4 h-4" />
          </GlassIconButton>
        </button>

      </div>
    </section>
  );
}
