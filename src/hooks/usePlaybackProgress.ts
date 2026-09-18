/**
 * usePlaybackProgress
 *
 * Persists playback progress in localStorage, keyed per-title and per-media-type.
 *
 * Movie key  : `progress_movie_{tmdbId}`
 * TV key     : `progress_tv_{tmdbId}`
 *
 * Movie value  : { positionSecs, durationSecs, updatedAt }
 * TV value     : { season, episode, positionSecs, durationSecs, watchedEpisodes, updatedAt }
 *   watchedEpisodes: Set stored as array of "S-E" strings, e.g. ["1-1","1-2"]
 */

export interface MovieProgress {
  positionSecs: number;
  durationSecs: number;
  updatedAt: string;
}

export interface TVProgress {
  season: number;
  episode: number;
  positionSecs: number;
  durationSecs: number;
  watchedEpisodes: string[]; // "season-episode" strings
  updatedAt: string;
}

// ── Storage keys ──────────────────────────────────────────────────────────────
const movieKey = (tmdbId: number) => `progress_movie_${tmdbId}`;
const tvKey    = (tmdbId: number) => `progress_tv_${tmdbId}`;

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch { return null; }
}

function write<T>(key: string, value: T): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota */ }
}

// ── Movie progress ─────────────────────────────────────────────────────────────
export function getMovieProgress(tmdbId: number): MovieProgress | null {
  return read<MovieProgress>(movieKey(tmdbId));
}

export function saveMovieProgress(
  tmdbId: number,
  positionSecs: number,
  durationSecs: number,
): void {
  write<MovieProgress>(movieKey(tmdbId), {
    positionSecs,
    durationSecs,
    updatedAt: new Date().toISOString(),
  });
}

export function clearMovieProgress(tmdbId: number): void {
  try { localStorage.removeItem(movieKey(tmdbId)); } catch { /* ignore */ }
}

// ── TV progress ───────────────────────────────────────────────────────────────
export function getTVProgress(tmdbId: number): TVProgress | null {
  return read<TVProgress>(tvKey(tmdbId));
}

export function saveTVProgress(
  tmdbId: number,
  season: number,
  episode: number,
  positionSecs: number,
  durationSecs: number,
): void {
  const existing = getTVProgress(tmdbId);
  const watchedEpisodes = existing?.watchedEpisodes ?? [];

  // Mark as watched locally if ≥ 90% complete
  const epKey = `${season}-${episode}`;
  const isWatched = durationSecs > 0 && positionSecs / durationSecs >= 0.9;
  const updatedWatched = isWatched && !watchedEpisodes.includes(epKey)
    ? [...watchedEpisodes, epKey]
    : watchedEpisodes;

  write<TVProgress>(tvKey(tmdbId), {
    season,
    episode,
    positionSecs,
    durationSecs,
    watchedEpisodes: updatedWatched,
    updatedAt: new Date().toISOString(),
  });
}

export function markEpisodeWatchedLocal(
  tmdbId: number,
  season: number,
  episode: number,
): void {
  const existing = getTVProgress(tmdbId);
  const epKey = `${season}-${episode}`;
  const watchedEpisodes = existing?.watchedEpisodes ?? [];
  if (watchedEpisodes.includes(epKey)) return;
  write<TVProgress>(tvKey(tmdbId), {
    season: existing?.season ?? season,
    episode: existing?.episode ?? episode,
    positionSecs: existing?.positionSecs ?? 0,
    durationSecs: existing?.durationSecs ?? 0,
    watchedEpisodes: [...watchedEpisodes, epKey],
    updatedAt: new Date().toISOString(),
  });
}

export function isEpisodeWatchedLocal(
  tmdbId: number,
  season: number,
  episode: number,
): boolean {
  const p = getTVProgress(tmdbId);
  if (!p) return false;
  return p.watchedEpisodes.includes(`${season}-${episode}`);
}

/** Returns the episode count from local storage watched list. */
export function getWatchedEpisodeCount(tmdbId: number): number {
  return getTVProgress(tmdbId)?.watchedEpisodes.length ?? 0;
}

// ── Resume helpers ─────────────────────────────────────────────────────────────
/** True if movie has a meaningful saved position (> 5% and < 95% of duration). */
export function movieHasResume(tmdbId: number): boolean {
  const p = getMovieProgress(tmdbId);
  if (!p || p.durationSecs <= 0) return false;
  const pct = p.positionSecs / p.durationSecs;
  return pct > 0.05 && pct < 0.95;
}

/** True if TV has a saved position for the given season+episode. */
export function tvHasResume(tmdbId: number, season: number, episode: number): boolean {
  const p = getTVProgress(tmdbId);
  if (!p || p.season !== season || p.episode !== episode) return false;
  if (p.durationSecs <= 0) return false;
  const pct = p.positionSecs / p.durationSecs;
  return pct > 0.05 && pct < 0.95;
}

/** Format seconds as "mm:ss" or "h:mm:ss". */
export function fmtSecs(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
