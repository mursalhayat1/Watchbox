// ── MediaPlayerModal ── progress-aware, auto-library, episode tracking ─────────
import { useEffect, useRef, useState, useCallback } from 'react';
import { X, Tv, Film, Maximize2, RotateCcw, Play, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  saveMovieProgress, saveTVProgress,
  getMovieProgress, getTVProgress,
  movieHasResume, tvHasResume,
  fmtSecs,
} from '@/hooks/usePlaybackProgress';

// ── Providers ─────────────────────────────────────────────────────────────────
export type EmbedProvider = 'nxsha' | 'screenscape';

const PROVIDERS: { id: EmbedProvider; label: string }[] = [
  { id: 'nxsha',       label: 'NxSha'       },
  { id: 'screenscape', label: 'ScreenScape' },
];

const LS_KEY = 'watchbox_embed_provider';

function getSavedProvider(): EmbedProvider {
  try {
    const v = localStorage.getItem(LS_KEY);
    if (v === 'nxsha' || v === 'screenscape') return v;
  } catch { /* ignore */ }
  return 'nxsha';
}

function saveProvider(p: EmbedProvider) {
  try { localStorage.setItem(LS_KEY, p); } catch { /* ignore */ }
}

// ── Embed URL builders ────────────────────────────────────────────────────────
function buildEmbedUrl(
  provider: EmbedProvider,
  mediaType: 'movie' | 'tv',
  tmdbId: number,
  season = 1,
  episode = 1,
): string {
  if (provider === 'screenscape') {
    const params = new URLSearchParams({ tmdb: String(tmdbId), type: mediaType });
    if (mediaType === 'tv') { params.set('s', String(season)); params.set('e', String(episode)); }
    return `https://screenscape.me/embed?${params.toString()}`;
  }
  // nxsha (default)
  const color = encodeURIComponent('#0e7490');
  if (mediaType === 'tv') {
    return `https://nxsha.space/embed/tv/${tmdbId}/${season}/${episode}?color=${color}`;
  }
  return `https://nxsha.space/embed/movie/${tmdbId}?color=${color}`;
}

// ── Main modal ────────────────────────────────────────────────────────────────
interface MediaPlayerModalProps {
  open: boolean;
  onClose: () => void;
  /** Called once when playback actually starts (iframe loaded). Use to trigger library add. */
  onPlayStart?: (season: number, episode: number) => void;
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  totalSeasons?: number;
  initialSeason?: number;
  initialEpisode?: number;
}

export default function MediaPlayerModal({
  open, onClose, onPlayStart,
  tmdbId, mediaType, title,
  totalSeasons: _totalSeasons = 1,
  initialSeason = 1, initialEpisode = 1,
}: MediaPlayerModalProps) {
  const [season, setSeason]              = useState(initialSeason);
  const [episode, setEpisode]            = useState(initialEpisode);
  const [loaded, setLoaded]              = useState(false);
  const [playStartFired, setStarted]     = useState(false);
  const [provider, setProvider]          = useState<EmbedProvider>(getSavedProvider);
  const [providerOpen, setProviderOpen]  = useState(false);

  // Resume prompt: show when there's saved progress on open
  const [showResume, setShowResume]   = useState(false);
  const [resumeLabel, setResumeLabel] = useState('');

  const iframeRef    = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Track the open-time so we can estimate session duration (no postMessage API)
  const openedAtRef  = useRef<number>(0);

  const embedUrl = buildEmbedUrl(provider, mediaType, tmdbId, season, episode);

  const handleProviderChange = useCallback((p: EmbedProvider) => {
    setProvider(p);
    saveProvider(p);
    setProviderOpen(false);
    setLoaded(false);
    setStarted(false);
  }, []);

  // Reset on open / media change — check for resume
  useEffect(() => {
    if (!open) return;
    setSeason(initialSeason);
    setEpisode(initialEpisode);
    setLoaded(false);
    setStarted(false);
    openedAtRef.current = Date.now();

    // Check if there's a saved position to resume from
    if (mediaType === 'movie') {
      const hasResume = movieHasResume(tmdbId);
      if (hasResume) {
        const p = getMovieProgress(tmdbId);
        setResumeLabel(`Resume from ${fmtSecs(p!.positionSecs)}`);
        setShowResume(true);
      } else {
        setShowResume(false);
      }
    } else {
      const hasResume = tvHasResume(tmdbId, initialSeason, initialEpisode);
      if (hasResume) {
        const p = getTVProgress(tmdbId);
        setResumeLabel(`Resume S${String(initialSeason).padStart(2,'0')}E${String(initialEpisode).padStart(2,'0')} from ${fmtSecs(p!.positionSecs)}`);
        setShowResume(true);
      } else {
        setShowResume(false);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, tmdbId, initialSeason, initialEpisode]);

  // Reset loaded when season/episode changes
  useEffect(() => { setLoaded(false); setStarted(false); }, [season, episode]);

  // Save progress on close — estimate position from session length
  const handleClose = useCallback(() => {
    if (loaded && openedAtRef.current > 0) {
      const sessionSecs = (Date.now() - openedAtRef.current) / 1000;
      if (mediaType === 'movie') {
        // Combine any existing progress with this session
        const existing = getMovieProgress(tmdbId);
        const prevPos = existing?.positionSecs ?? 0;
        const newPos = Math.round(prevPos + sessionSecs);
        const dur = existing?.durationSecs ?? 0;
        saveMovieProgress(tmdbId, newPos, dur);
      } else {
        const existing = getTVProgress(tmdbId);
        const prevPos = (existing?.season === season && existing?.episode === episode)
          ? (existing.positionSecs ?? 0)
          : 0;
        const newPos = Math.round(prevPos + sessionSecs);
        const dur = existing?.durationSecs ?? 0;
        saveTVProgress(tmdbId, season, episode, newPos, dur);
      }
    }
    onClose();
  }, [loaded, mediaType, tmdbId, season, episode, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.fullscreenElement) handleClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, handleClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen?.();
  };

  const handleIframeLoad = () => {
    setLoaded(true);
    // Fire onPlayStart once per open session
    if (!playStartFired) {
      setStarted(true);
      onPlayStart?.(season, episode);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={containerRef}
          key="media-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[9999] flex flex-col"
          style={{ background: 'rgba(0,0,0,0.97)' }}
          onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
        >
          {/* ── Top bar ── */}
          <motion.div
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.08, duration: 0.2 }}
            className="shrink-0 flex items-center justify-between px-4 md:px-6 py-3 gap-4"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
          >
            {/* Left: media info */}
            <div className="flex items-center gap-2.5 min-w-0">
              {mediaType === 'tv'
                ? <Tv className="w-4 h-4 shrink-0 text-white/50" />
                : <Film className="w-4 h-4 shrink-0 text-white/50" />
              }
              <h2 className="text-sm font-semibold text-white truncate">{title}</h2>
              {mediaType === 'tv' && (
                <span className="shrink-0 text-xs text-white/40 font-medium">
                  S{String(season).padStart(2, '0')} E{String(episode).padStart(2, '0')}
                </span>
              )}
            </div>

            {/* Right: provider switcher + controls */}
            <div className="flex items-center gap-2 shrink-0">

              {/* Provider switcher */}
              <div className="relative">
                <button
                  onClick={() => setProviderOpen(o => !o)}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium transition-colors hover:bg-white/10"
                  style={{ color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.15)' }}
                  aria-label="Switch embed provider"
                >
                  <span className="hidden sm:inline text-white/40 mr-0.5">Source:</span>
                  <span>{PROVIDERS.find(p => p.id === provider)?.label}</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>

                <AnimatePresence>
                  {providerOpen && (
                    <motion.div
                      key="provider-menu"
                      initial={{ opacity: 0, y: -4, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.97 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 top-full mt-1.5 z-10 rounded-xl overflow-hidden py-1 min-w-[130px]"
                      style={{
                        background: 'rgba(15,25,30,0.97)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(16px)',
                      }}
                    >
                      {PROVIDERS.map(p => (
                        <button
                          key={p.id}
                          onClick={() => handleProviderChange(p.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors hover:bg-white/8"
                          style={{
                            color: p.id === provider ? 'rgb(103,232,249)' : 'rgba(255,255,255,0.75)',
                          }}
                        >
                          {/* Active dot */}
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ background: p.id === provider ? 'rgb(103,232,249)' : 'transparent', border: p.id === provider ? 'none' : '1px solid rgba(255,255,255,0.2)' }}
                          />
                          {p.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={handleFullscreen}
                aria-label="Toggle fullscreen"
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
                style={{ color: 'rgba(255,255,255,0.6)' }}>
                <Maximize2 className="w-4 h-4" />
              </button>
              <button onClick={handleClose}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
                style={{ color: 'rgba(255,255,255,0.6)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* ── Player ── */}
          <div className="flex-1 relative min-h-0">
            {/* Loading shimmer */}
            {!loaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
                <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-white/70 animate-spin" />
                <p className="text-white/40 text-sm">Loading player…</p>
              </div>
            )}

            {/* Resume overlay — shown over player while deciding */}
            <AnimatePresence>
              {showResume && loaded && (
                <motion.div
                  key="resume-overlay"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-4 py-3 rounded-2xl"
                  style={{
                    background: 'rgba(10,22,26,0.95)',
                    border: '1px solid rgba(255,255,255,0.14)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                  }}
                >
                  <span className="text-sm text-white/80 font-medium whitespace-nowrap">{resumeLabel}</span>
                  <button
                    onClick={() => setShowResume(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
                    style={{ background: 'rgba(6,182,212,0.25)', color: 'rgb(103,232,249)', border: '1px solid rgba(6,182,212,0.35)' }}
                  >
                    <Play className="w-3 h-3 fill-current" /> Resume
                  </button>
                  <button
                    onClick={() => {
                      setShowResume(false);
                      // Restart from beginning — clear saved position
                      if (mediaType === 'movie') saveMovieProgress(tmdbId, 0, 0);
                      else saveTVProgress(tmdbId, season, episode, 0, 0);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors hover:bg-white/10"
                    style={{ color: 'rgba(255,255,255,0.45)' }}
                  >
                    <RotateCcw className="w-3 h-3" /> Start over
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <iframe
              ref={iframeRef}
              key={embedUrl}
              src={embedUrl}
              className="w-full h-full border-0"
              style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.3s' }}
              allowFullScreen
              allow="autoplay; fullscreen *; picture-in-picture; encrypted-media"
              referrerPolicy={provider === 'screenscape' ? 'origin' : 'no-referrer'}
              sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-popups-to-escape-sandbox"
              title={`${title} player`}
              onLoad={handleIframeLoad}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
