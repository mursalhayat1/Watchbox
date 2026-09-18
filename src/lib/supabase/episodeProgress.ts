import { supabase } from './client';

export interface EpisodeProgress {
  id: string;
  user_id: string;
  tv_id: number;
  season_number: number;
  episode_number: number;
  watched: boolean;
  position_secs: number;
  duration_secs: number;
  updated_at: string;
}

async function currentUserId(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
}

/** Fetch all episode progress rows for a given TV show for the current user. */
export async function getShowProgress(tvId: number): Promise<EpisodeProgress[]> {
  const uid = await currentUserId();
  if (!uid) return [];
  const { data, error } = await supabase
    .from('episode_progress')
    .select('*')
    .eq('user_id', uid)
    .eq('tv_id', tvId);
  if (error) throw error;
  return data ?? [];
}

/** Fetch the latest in-progress episode row across ALL shows for the current user.
 *  Returns rows ordered by updated_at desc — each row represents the most-recent
 *  episode touched for that tv_id. */
export interface ContinueWatchingRow {
  tv_id: number;
  season_number: number;
  episode_number: number;
  position_secs: number;
  duration_secs: number;
  watched: boolean;
  updated_at: string;
  // enriched from library_items
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
}

export async function getContinueWatching(): Promise<ContinueWatchingRow[]> {
  const uid = await currentUserId();
  if (!uid) return [];

  // Get the most-recent episode progress per tv_id (unwatched preferred, else last touched)
  const { data: progressRows, error: pErr } = await supabase
    .from('episode_progress')
    .select('tv_id, season_number, episode_number, position_secs, duration_secs, watched, updated_at')
    .eq('user_id', uid)
    .order('updated_at', { ascending: false })
    .limit(100);
  if (pErr) throw pErr;
  if (!progressRows?.length) return [];

  // Deduplicate — keep the latest row per tv_id
  const seen = new Set<number>();
  const deduped = (progressRows as ContinueWatchingRow[]).filter(r => {
    if (seen.has(r.tv_id)) return false;
    seen.add(r.tv_id);
    return true;
  });

  // Pull library metadata for those tv_ids
  const tvIds = deduped.map(r => r.tv_id);
  const { data: libRows, error: lErr } = await supabase
    .from('library_items')
    .select('tmdb_id, title, poster_path, backdrop_path')
    .eq('user_id', uid)
    .eq('media_type', 'tv')
    .in('tmdb_id', tvIds);
  if (lErr) throw lErr;

  const libMap = new Map(
    (libRows ?? []).map(l => [l.tmdb_id, l as { tmdb_id: number; title: string; poster_path: string | null; backdrop_path: string | null }])
  );

  // Only return shows that are in the library and not fully finished watching
  return deduped
    .filter(r => libMap.has(r.tv_id))
    .map(r => ({
      ...r,
      title: libMap.get(r.tv_id)!.title,
      poster_path: libMap.get(r.tv_id)!.poster_path,
      backdrop_path: libMap.get(r.tv_id)!.backdrop_path,
    }))
    .slice(0, 20);
}

/** Mark an episode as watched (and optionally record position). */
export async function markEpisodeWatched(
  tvId: number,
  seasonNumber: number,
  episodeNumber: number,
  positionSecs = 0,
  durationSecs = 0,
): Promise<void> {
  const uid = await currentUserId();
  if (!uid) return;
  const { error } = await supabase
    .from('episode_progress')
    .upsert(
      {
        user_id: uid,
        tv_id: tvId,
        season_number: seasonNumber,
        episode_number: episodeNumber,
        watched: true,
        position_secs: positionSecs,
        duration_secs: durationSecs,
      },
      { onConflict: 'user_id,tv_id,season_number,episode_number' },
    );
  if (error) throw error;
}

/** Save playback position without marking fully watched. */
export async function saveEpisodePosition(
  tvId: number,
  seasonNumber: number,
  episodeNumber: number,
  positionSecs: number,
  durationSecs: number,
): Promise<void> {
  const uid = await currentUserId();
  if (!uid) return;
  // Consider watched if more than 90% of the episode has been played
  const watched = durationSecs > 0 && positionSecs / durationSecs >= 0.9;
  const { error } = await supabase
    .from('episode_progress')
    .upsert(
      {
        user_id: uid,
        tv_id: tvId,
        season_number: seasonNumber,
        episode_number: episodeNumber,
        watched,
        position_secs: positionSecs,
        duration_secs: durationSecs,
      },
      { onConflict: 'user_id,tv_id,season_number,episode_number' },
    );
  if (error) throw error;
}
