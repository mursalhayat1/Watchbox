import type { SupabaseClient } from '@supabase/supabase-js';
import {
  LIBRARY_STATUSES,
  type LibraryStatus,
  type LibraryItemRecord,
  type FavoriteItemRecord,
  type ActorFavoriteRecord,
  type EpisodeProgressRecord,
} from './types.js';
import {
  searchTmdbTitles,
  getTmdbDetails,
  discoverTmdbTitles,
  GENRE_MAP,
  type TmdbSearchResult,
} from './tmdb.js';

export interface ToolResult {
  ok: boolean;
  message?: string;
  data?: unknown;
  error?: string;
}

function success(data: unknown, message?: string): ToolResult {
  return { ok: true, data, message };
}

function failure(error: string): ToolResult {
  return { ok: false, error };
}

// ── 1. search_titles ──────────────────────────────────────────────────────────

export interface SearchTitlesParams {
  query?: string;
  media_type?: 'movie' | 'tv';
  status?: LibraryStatus;
  min_rating?: number;
  max_rating?: number;
  release_year?: number;
  genre?: string;
  language?: string;
  include_discover?: boolean;
  limit?: number;
  offset?: number;
}

export async function searchTitlesTool(
  db: SupabaseClient,
  userId: string,
  params: SearchTitlesParams,
): Promise<ToolResult> {
  const limit = Math.min(params.limit || 20, 100);
  const offset = params.offset || 0;

  // 1. Search in user's library first
  let query = db
    .from('library_items')
    .select('*')
    .eq('user_id', userId);

  if (params.query) {
    query = query.ilike('title', `%${params.query}%`);
  }
  if (params.status) {
    query = query.eq('status', params.status);
  }
  if (params.media_type) {
    query = query.eq('media_type', params.media_type);
  }
  if (params.min_rating !== undefined) {
    query = query.gte('user_rating', params.min_rating);
  }
  if (params.max_rating !== undefined) {
    query = query.lte('user_rating', params.max_rating);
  }
  if (params.release_year !== undefined) {
    query = query.ilike('release_date', `${params.release_year}%`);
  }

  query = query.order('updated_at', { ascending: false }).range(offset, offset + limit - 1);

  const { data: libraryItems, error: libError } = await query;
  if (libError) {
    return failure(`Failed to search library: ${libError.message}`);
  }

  const items = (libraryItems || []) as LibraryItemRecord[];

  // 2. If discover / external search is requested or needed
  let discovered: Array<TmdbSearchResult & { user_status: LibraryStatus | null; in_library: boolean }> = [];
  if (params.include_discover || (params.query && items.length === 0) || params.genre || params.language) {
    try {
      let tmdbResults: TmdbSearchResult[] = [];

      if (params.genre || params.language) {
        const genreId = params.genre ? GENRE_MAP[params.genre.toLowerCase()] : undefined;
        tmdbResults = await discoverTmdbTitles({
          mediaType: params.media_type || 'movie',
          withOriginalLanguage: params.language,
          withGenres: genreId ? String(genreId) : undefined,
          primaryReleaseYear: params.release_year,
          page: 1,
        });
      } else if (params.query) {
        tmdbResults = await searchTmdbTitles(params.query, params.media_type, 1);
      }

      if (tmdbResults.length > 0) {
        // Fetch all library items for these TMDB IDs to annotate watch status
        const tmdbIds = tmdbResults.map((r) => r.tmdb_id);
        const { data: existingRecords } = await db
          .from('library_items')
          .select('tmdb_id, media_type, status, user_rating')
          .eq('user_id', userId)
          .in('tmdb_id', tmdbIds);

        const statusMap = new Map<string, { status: LibraryStatus; user_rating: number | null }>();
        for (const item of (existingRecords || []) as Array<{ tmdb_id: number; media_type: string; status: LibraryStatus; user_rating: number | null }>) {
          statusMap.set(`${item.media_type}:${item.tmdb_id}`, { status: item.status, user_rating: item.user_rating });
        }

        discovered = tmdbResults.map((r) => {
          const userState = statusMap.get(`${r.media_type}:${r.tmdb_id}`);
          return {
            ...r,
            user_status: userState ? userState.status : null,
            in_library: !!userState,
          };
        });
      }
    } catch {
      // TMDB lookup optional fallback
    }
  }

  return success({
    library_matches: items,
    library_count: items.length,
    discover_matches: discovered,
    discover_count: discovered.length,
    offset,
    limit,
  });
}

// ── 2. get_title_details ──────────────────────────────────────────────────────

export interface GetTitleDetailsParams {
  id?: string;
  tmdb_id?: number;
  media_type?: 'movie' | 'tv';
}

export async function getTitleDetailsTool(
  db: SupabaseClient,
  userId: string,
  params: GetTitleDetailsParams,
): Promise<ToolResult> {
  let libItem: LibraryItemRecord | null = null;

  if (params.id) {
    const { data, error } = await db
      .from('library_items')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) return failure(`Database error: ${error.message}`);
    libItem = data as LibraryItemRecord | null;
  } else if (params.tmdb_id && params.media_type) {
    const { data, error } = await db
      .from('library_items')
      .select('*')
      .eq('tmdb_id', params.tmdb_id)
      .eq('media_type', params.media_type)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) return failure(`Database error: ${error.message}`);
    libItem = data as LibraryItemRecord | null;
  } else {
    return failure('Either "id" (library item UUID) or "tmdb_id" + "media_type" must be provided.');
  }

  const tmdbId = libItem ? libItem.tmdb_id : params.tmdb_id;
  const mediaType = libItem ? libItem.media_type : params.media_type;

  if (!tmdbId || !mediaType) {
    return failure('Title not found in library and no TMDB identifiers provided.');
  }

  // Check favorite status
  const { data: favItem } = await db
    .from('favorite_items')
    .select('id')
    .eq('user_id', userId)
    .eq('tmdb_id', tmdbId)
    .eq('media_type', mediaType)
    .maybeSingle();

  // Check episode progress if TV series
  let progress: EpisodeProgressRecord[] = [];
  if (mediaType === 'tv') {
    const { data: progressRows } = await db
      .from('episode_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('tv_id', tmdbId)
      .order('season_number', { ascending: true })
      .order('episode_number', { ascending: true });
    progress = (progressRows || []) as EpisodeProgressRecord[];
  }

  // Fetch full TMDB metadata
  let tmdbData = null;
  try {
    tmdbData = await getTmdbDetails(tmdbId, mediaType);
  } catch {
    // If TMDB lookup fails, return what we have from the database
  }

  return success({
    in_library: !!libItem,
    library_item: libItem,
    is_favorited: !!favItem,
    episode_progress: progress,
    tmdb_metadata: tmdbData,
  });
}

// ── 3. get_watchlist ──────────────────────────────────────────────────────────

export interface GetWatchlistParams {
  media_type?: 'movie' | 'tv';
  limit?: number;
  offset?: number;
  sort_by?: 'added_at' | 'title' | 'vote_average';
  sort_order?: 'asc' | 'desc';
}

export async function getWatchlistTool(
  db: SupabaseClient,
  userId: string,
  params: GetWatchlistParams = {},
): Promise<ToolResult> {
  const limit = Math.min(params.limit || 50, 200);
  const offset = params.offset || 0;
  const sortBy = params.sort_by || 'added_at';
  const ascending = params.sort_order === 'asc';

  let query = db
    .from('library_items')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'Plan to Watch');

  if (params.media_type) {
    query = query.eq('media_type', params.media_type);
  }

  query = query.order(sortBy, { ascending }).range(offset, offset + limit - 1);

  const { data, error } = await query;
  if (error) return failure(`Failed to retrieve watchlist: ${error.message}`);

  const items = (data || []) as LibraryItemRecord[];
  return success({
    watchlist: items,
    count: items.length,
    offset,
    limit,
  });
}

// ── 4. get_watch_history ──────────────────────────────────────────────────────

export interface GetWatchHistoryParams {
  status?: 'Completed' | 'Watching' | 'Dropped' | 'On Hold';
  media_type?: 'movie' | 'tv';
  limit?: number;
  offset?: number;
  sort_by?: 'updated_at' | 'added_at' | 'user_rating' | 'title';
  sort_order?: 'asc' | 'desc';
}

export async function getWatchHistoryTool(
  db: SupabaseClient,
  userId: string,
  params: GetWatchHistoryParams = {},
): Promise<ToolResult> {
  const limit = Math.min(params.limit || 50, 200);
  const offset = params.offset || 0;
  const sortBy = params.sort_by || 'updated_at';
  const ascending = params.sort_order === 'asc';

  let query = db.from('library_items').select('*').eq('user_id', userId);

  if (params.status) {
    query = query.eq('status', params.status);
  } else {
    query = query.in('status', ['Completed', 'Watching', 'Dropped', 'On Hold']);
  }

  if (params.media_type) {
    query = query.eq('media_type', params.media_type);
  }

  query = query.order(sortBy, { ascending }).range(offset, offset + limit - 1);

  const { data, error } = await query;
  if (error) return failure(`Failed to retrieve watch history: ${error.message}`);

  const items = (data || []) as LibraryItemRecord[];
  return success({
    history: items,
    count: items.length,
    status_filter: params.status || 'All Active/Finished (Watching, Completed, Dropped, On Hold)',
    offset,
    limit,
  });
}

// ── 5. get_library_stats ──────────────────────────────────────────────────────

export async function getLibraryStatsTool(
  db: SupabaseClient,
  userId: string,
): Promise<ToolResult> {
  const [libRes, favRes, actorRes] = await Promise.all([
    db.from('library_items').select('*').eq('user_id', userId),
    db.from('favorite_items').select('id').eq('user_id', userId),
    db.from('actor_favorites').select('id').eq('user_id', userId),
  ]);

  if (libRes.error) return failure(`Failed to calculate stats: ${libRes.error.message}`);

  const items = (libRes.data || []) as LibraryItemRecord[];

  const byStatus: Record<LibraryStatus, number> = {
    Watching: 0,
    Completed: 0,
    'Plan to Watch': 0,
    'On Hold': 0,
    Dropped: 0,
  };

  for (const item of items) {
    if (byStatus[item.status] !== undefined) {
      byStatus[item.status] += 1;
    }
  }

  const movies = items.filter((i) => i.media_type === 'movie');
  const tvShows = items.filter((i) => i.media_type === 'tv');

  const ratedItems = items.filter(
    (i) => i.user_rating !== null && i.user_rating !== undefined && Number.isFinite(Number(i.user_rating)),
  );

  const avgRating =
    ratedItems.length > 0
      ? Math.round(
          (ratedItems.reduce((acc, curr) => acc + Number(curr.user_rating), 0) / ratedItems.length) * 10,
        ) / 10
      : null;

  return success({
    total_tracked: items.length,
    by_status: byStatus,
    completed: byStatus.Completed,
    watching: byStatus.Watching,
    plan_to_watch: byStatus['Plan to Watch'],
    on_hold: byStatus['On Hold'],
    dropped: byStatus.Dropped,
    movies_count: movies.length,
    tv_shows_count: tvShows.length,
    rated_titles_count: ratedItems.length,
    average_user_rating: avgRating,
    favorite_titles_count: (favRes.data || []).length,
    favorite_actors_count: (actorRes.data || []).length,
  });
}

// ── 6. get_favorites ──────────────────────────────────────────────────────────

export interface GetFavoritesParams {
  include_actors?: boolean;
  media_type?: 'movie' | 'tv';
  limit?: number;
}

export async function getFavoritesTool(
  db: SupabaseClient,
  userId: string,
  params: GetFavoritesParams = {},
): Promise<ToolResult> {
  const limit = Math.min(params.limit || 100, 500);

  let query = db.from('favorite_items').select('*').eq('user_id', userId);
  if (params.media_type) {
    query = query.eq('media_type', params.media_type);
  }
  query = query.order('added_at', { ascending: false }).limit(limit);

  const { data: titles, error: titleError } = await query;
  if (titleError) return failure(`Failed to retrieve favorite titles: ${titleError.message}`);

  let actors: ActorFavoriteRecord[] = [];
  if (params.include_actors !== false) {
    const { data: actorData, error: actorError } = await db
      .from('actor_favorites')
      .select('*')
      .eq('user_id', userId)
      .order('added_at', { ascending: false })
      .limit(100);

    if (actorError) return failure(`Failed to retrieve favorite actors: ${actorError.message}`);
    actors = (actorData || []) as ActorFavoriteRecord[];
  }

  return success({
    favorite_titles: titles || [],
    favorite_titles_count: (titles || []).length,
    favorite_actors: actors,
    favorite_actors_count: actors.length,
  });
}

// ── 7. get_viewing_progress ───────────────────────────────────────────────────

export interface GetViewingProgressParams {
  tv_id?: number;
}

export async function getViewingProgressTool(
  db: SupabaseClient,
  userId: string,
  params: GetViewingProgressParams = {},
): Promise<ToolResult> {
  let query = db.from('episode_progress').select('*').eq('user_id', userId);

  if (params.tv_id) {
    query = query
      .eq('tv_id', params.tv_id)
      .order('season_number', { ascending: true })
      .order('episode_number', { ascending: true });
  } else {
    query = query.order('updated_at', { ascending: false }).limit(100);
  }

  const { data, error } = await query;
  if (error) return failure(`Failed to retrieve episode progress: ${error.message}`);

  const rows = (data || []) as EpisodeProgressRecord[];
  return success({
    tv_id: params.tv_id,
    progress_records: rows,
    count: rows.length,
  });
}

// ── 8. add_to_watchlist ───────────────────────────────────────────────────────

export interface AddToWatchlistParams {
  tmdb_id: number;
  media_type: 'movie' | 'tv';
  title?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  release_date?: string | null;
}

export async function addToWatchlistTool(
  db: SupabaseClient,
  userId: string,
  params: AddToWatchlistParams,
): Promise<ToolResult> {
  let title = params.title;
  let posterPath = params.poster_path ?? null;
  let backdropPath = params.backdrop_path ?? null;
  let voteAverage = params.vote_average ?? 0;
  let releaseDate = params.release_date ?? null;

  // Auto-resolve metadata from TMDB if title is missing
  if (!title) {
    try {
      const details = await getTmdbDetails(params.tmdb_id, params.media_type);
      title = details.title;
      posterPath = posterPath || details.poster_path;
      backdropPath = backdropPath || details.backdrop_path;
      voteAverage = voteAverage || details.vote_average;
      releaseDate = releaseDate || details.release_date;
    } catch {
      return failure(`Title name was not provided and could not be fetched from TMDB for ID ${params.tmdb_id}.`);
    }
  }

  const payload = {
    user_id: userId,
    tmdb_id: params.tmdb_id,
    media_type: params.media_type,
    title,
    status: 'Plan to Watch' as LibraryStatus,
    poster_path: posterPath,
    backdrop_path: backdropPath,
    vote_average: voteAverage,
    release_date: releaseDate,
  };

  const { data, error } = await db
    .from('library_items')
    .upsert(payload, { onConflict: 'user_id,tmdb_id,media_type' })
    .select()
    .single();

  if (error) return failure(`Failed to add to watchlist: ${error.message}`);

  // Write verification: confirm record exists
  const { data: verify, error: verifyErr } = await db
    .from('library_items')
    .select('*')
    .eq('id', (data as Record<string, unknown>).id as string)
    .eq('user_id', userId)
    .single();

  if (verifyErr || !verify) {
    return failure('Write verification failed: record was not found in the database after insert.');
  }

  return success(verify, `"${title}" has been successfully added to your watchlist.`);
}

// ── 9. remove_from_watchlist ──────────────────────────────────────────────────

export interface RemoveFromWatchlistParams {
  id?: string;
  tmdb_id?: number;
  media_type?: 'movie' | 'tv';
}

export async function removeFromWatchlistTool(
  db: SupabaseClient,
  userId: string,
  params: RemoveFromWatchlistParams,
): Promise<ToolResult> {
  let targetId = params.id;

  if (!targetId) {
    if (!params.tmdb_id || !params.media_type) {
      return failure('Provide either "id" (library UUID) or "tmdb_id" + "media_type".');
    }
    const { data: found } = await db
      .from('library_items')
      .select('id, title, status')
      .eq('user_id', userId)
      .eq('tmdb_id', params.tmdb_id)
      .eq('media_type', params.media_type)
      .maybeSingle();

    if (!found) {
      return failure('Title not found in your library.');
    }
    targetId = (found as Record<string, unknown>).id as string;
  }

  // Retrieve existing record to verify it exists and is owned by the user
  const { data: existing } = await db
    .from('library_items')
    .select('id, title, status')
    .eq('id', targetId)
    .eq('user_id', userId)
    .maybeSingle();

  if (!existing) {
    return failure('Item not found or you do not have permission to remove it.');
  }

  const { error, count } = await db
    .from('library_items')
    .delete({ count: 'exact' })
    .eq('id', targetId)
    .eq('user_id', userId);

  if (error) return failure(`Failed to remove item: ${error.message}`);
  if ((count ?? 0) === 0) return failure('Deletion failed: 0 rows deleted.');

  // Write verification: verify item is gone
  const { data: gone } = await db
    .from('library_items')
    .select('id')
    .eq('id', targetId)
    .eq('user_id', userId)
    .maybeSingle();

  if (gone) {
    return failure('Write verification failed: record still exists after deletion.');
  }

  return success(
    { removed_id: targetId, title: (existing as Record<string, unknown>).title },
    `"${(existing as Record<string, unknown>).title}" was successfully removed from your library/watchlist.`,
  );
}

// ── 10. update_watch_status ───────────────────────────────────────────────────

export interface UpdateWatchStatusParams {
  id?: string;
  tmdb_id?: number;
  media_type?: 'movie' | 'tv';
  status: LibraryStatus;
}

export async function updateWatchStatusTool(
  db: SupabaseClient,
  userId: string,
  params: UpdateWatchStatusParams,
): Promise<ToolResult> {
  let targetId = params.id;

  if (!targetId) {
    if (!params.tmdb_id || !params.media_type) {
      return failure('Provide either "id" (library UUID) or "tmdb_id" + "media_type".');
    }
    const { data: found } = await db
      .from('library_items')
      .select('id')
      .eq('user_id', userId)
      .eq('tmdb_id', params.tmdb_id)
      .eq('media_type', params.media_type)
      .maybeSingle();

    if (!found) {
      return failure('Title not found in your library. Add it first before updating its status.');
    }
    targetId = (found as Record<string, unknown>).id as string;
  }

  const { data, error } = await db
    .from('library_items')
    .update({ status: params.status, updated_at: new Date().toISOString() })
    .eq('id', targetId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) return failure(`Failed to update status: ${error.message}`);
  if (!data) return failure('Item not found or you do not have permission to modify it.');

  // Write verification
  const { data: verify } = await db
    .from('library_items')
    .select('status')
    .eq('id', targetId)
    .eq('user_id', userId)
    .single();

  if (!verify || (verify as Record<string, unknown>).status !== params.status) {
    return failure(`Write verification failed: status in database is "${verify?.status}", expected "${params.status}".`);
  }

  return success(data, `Status successfully updated to "${params.status}".`);
}

// ── 11. update_rating ─────────────────────────────────────────────────────────

export interface UpdateRatingParams {
  id?: string;
  tmdb_id?: number;
  media_type?: 'movie' | 'tv';
  rating: number | null;
}

export async function updateRatingTool(
  db: SupabaseClient,
  userId: string,
  params: UpdateRatingParams,
): Promise<ToolResult> {
  if (params.rating !== null) {
    if (params.rating < 0 || params.rating > 10) {
      return failure('Rating must be between 0 and 10.');
    }
  }

  let targetId = params.id;

  if (!targetId) {
    if (!params.tmdb_id || !params.media_type) {
      return failure('Provide either "id" (library UUID) or "tmdb_id" + "media_type".');
    }
    const { data: found } = await db
      .from('library_items')
      .select('id')
      .eq('user_id', userId)
      .eq('tmdb_id', params.tmdb_id)
      .eq('media_type', params.media_type)
      .maybeSingle();

    if (!found) {
      return failure('Title not found in your library. Add it to your library first.');
    }
    targetId = (found as Record<string, unknown>).id as string;
  }

  const { data, error } = await db
    .from('library_items')
    .update({ user_rating: params.rating, updated_at: new Date().toISOString() })
    .eq('id', targetId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) return failure(`Failed to update rating: ${error.message}`);
  if (!data) return failure('Item not found or you do not have permission to modify it.');

  // Write verification
  const { data: verify } = await db
    .from('library_items')
    .select('user_rating')
    .eq('id', targetId)
    .eq('user_id', userId)
    .single();

  const savedRating = verify?.user_rating === null || verify?.user_rating === undefined ? null : Number(verify.user_rating);
  const expectedRating = params.rating === null ? null : Number(params.rating);

  if (savedRating !== expectedRating) {
    return failure(`Write verification failed: rating in database is ${savedRating}, expected ${expectedRating}.`);
  }

  return success(data, params.rating !== null ? `Rating updated to ${params.rating}/10.` : 'Rating cleared.');
}

// ── 12. update_notes ──────────────────────────────────────────────────────────

export interface UpdateNotesParams {
  id?: string;
  tmdb_id?: number;
  media_type?: 'movie' | 'tv';
  notes: string | null;
}

export async function updateNotesTool(
  db: SupabaseClient,
  userId: string,
  params: UpdateNotesParams,
): Promise<ToolResult> {
  let targetId = params.id;

  if (!targetId) {
    if (!params.tmdb_id || !params.media_type) {
      return failure('Provide either "id" (library UUID) or "tmdb_id" + "media_type".');
    }
    const { data: found } = await db
      .from('library_items')
      .select('id')
      .eq('user_id', userId)
      .eq('tmdb_id', params.tmdb_id)
      .eq('media_type', params.media_type)
      .maybeSingle();

    if (!found) {
      return failure('Title not found in your library. Add it to your library first.');
    }
    targetId = (found as Record<string, unknown>).id as string;
  }

  const noteValue = params.notes?.trim() || null;

  const { data, error } = await db
    .from('library_items')
    .update({ note: noteValue, updated_at: new Date().toISOString() })
    .eq('id', targetId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) return failure(`Failed to update notes: ${error.message}`);
  if (!data) return failure('Item not found or you do not have permission to modify it.');

  // Write verification
  const { data: verify } = await db
    .from('library_items')
    .select('note')
    .eq('id', targetId)
    .eq('user_id', userId)
    .single();

  if (verify?.note !== noteValue) {
    return failure('Write verification failed: note was not updated correctly.');
  }

  return success(data, noteValue ? 'Note updated successfully.' : 'Note cleared.');
}

// ── 13. update_progress ───────────────────────────────────────────────────────

export interface UpdateProgressParams {
  tv_id: number;
  season_number: number;
  episode_number: number;
  watched?: boolean;
  position_secs?: number;
  duration_secs?: number;
}

export async function updateProgressTool(
  db: SupabaseClient,
  userId: string,
  params: UpdateProgressParams,
): Promise<ToolResult> {
  const positionSecs = params.position_secs ?? 0;
  const durationSecs = params.duration_secs ?? 0;
  const autoWatched = durationSecs > 0 && positionSecs / durationSecs >= 0.9;
  const watched = params.watched !== undefined ? params.watched : autoWatched;

  const payload = {
    user_id: userId,
    tv_id: params.tv_id,
    season_number: params.season_number,
    episode_number: params.episode_number,
    watched,
    position_secs: positionSecs,
    duration_secs: durationSecs,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await db
    .from('episode_progress')
    .upsert(payload, { onConflict: 'user_id,tv_id,season_number,episode_number' })
    .select()
    .single();

  if (error) return failure(`Failed to update episode progress: ${error.message}`);

  // Write verification
  const { data: verify } = await db
    .from('episode_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('tv_id', params.tv_id)
    .eq('season_number', params.season_number)
    .eq('episode_number', params.episode_number)
    .single();

  if (!verify) {
    return failure('Write verification failed: episode progress record was not found after update.');
  }

  return success(
    verify,
    `Progress for S${params.season_number}E${params.episode_number} updated (${watched ? 'Watched' : `${positionSecs}s / ${durationSecs}s`}).`,
  );
}

// ── 14. manage_favorites ──────────────────────────────────────────────────────

export interface ManageFavoritesParams {
  action: 'add' | 'remove';
  // Title favorite params
  tmdb_id?: number;
  media_type?: 'movie' | 'tv';
  title?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  release_date?: string | null;
  // Actor favorite params
  person_id?: number;
  person_name?: string;
  profile_path?: string | null;
  known_for_department?: string | null;
}

export async function manageFavoritesTool(
  db: SupabaseClient,
  userId: string,
  params: ManageFavoritesParams,
): Promise<ToolResult> {
  // 1. Actor favorite handling
  if (params.person_id !== undefined) {
    if (params.action === 'add') {
      if (!params.person_name) {
        return failure('person_name is required when adding an actor to favorites.');
      }
      const { error } = await db.from('actor_favorites').upsert(
        {
          user_id: userId,
          person_id: params.person_id,
          name: params.person_name,
          profile_path: params.profile_path ?? null,
          known_for_department: params.known_for_department ?? null,
        },
        { onConflict: 'user_id,person_id' },
      );
      if (error) return failure(`Failed to add favorite actor: ${error.message}`);

      // Verification
      const { data: verify } = await db
        .from('actor_favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('person_id', params.person_id)
        .maybeSingle();

      if (!verify) return failure('Write verification failed: actor favorite not found after insert.');
      return success({ person_id: params.person_id, name: params.person_name }, `Added ${params.person_name} to favorite actors.`);
    } else {
      const { error } = await db
        .from('actor_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('person_id', params.person_id);

      if (error) return failure(`Failed to remove favorite actor: ${error.message}`);
      return success({ person_id: params.person_id }, 'Removed actor from favorites.');
    }
  }

  // 2. Title favorite handling
  if (params.tmdb_id === undefined || !params.media_type) {
    return failure('Provide "tmdb_id" and "media_type" for title favorites, or "person_id" for actor favorites.');
  }

  if (params.action === 'add') {
    let title = params.title;
    let posterPath = params.poster_path ?? null;
    let backdropPath = params.backdrop_path ?? null;
    let voteAverage = params.vote_average ?? 0;
    let releaseDate = params.release_date ?? null;

    if (!title) {
      try {
        const details = await getTmdbDetails(params.tmdb_id, params.media_type);
        title = details.title;
        posterPath = posterPath || details.poster_path;
        backdropPath = backdropPath || details.backdrop_path;
        voteAverage = voteAverage || details.vote_average;
        releaseDate = releaseDate || details.release_date;
      } catch {
        return failure('Title name is required when adding to favorites.');
      }
    }

    const { error } = await db.from('favorite_items').upsert(
      {
        user_id: userId,
        tmdb_id: params.tmdb_id,
        media_type: params.media_type,
        title,
        poster_path: posterPath,
        backdrop_path: backdropPath,
        vote_average: voteAverage,
        release_date: releaseDate,
      },
      { onConflict: 'user_id,tmdb_id,media_type' },
    );

    if (error) return failure(`Failed to add favorite title: ${error.message}`);

    // Verification
    const { data: verify } = await db
      .from('favorite_items')
      .select('id')
      .eq('user_id', userId)
      .eq('tmdb_id', params.tmdb_id)
      .eq('media_type', params.media_type)
      .maybeSingle();

    if (!verify) return failure('Write verification failed: favorite not found after insert.');
    return success({ tmdb_id: params.tmdb_id, title }, `Added "${title}" to favorites.`);
  } else {
    const { error } = await db
      .from('favorite_items')
      .delete()
      .eq('user_id', userId)
      .eq('tmdb_id', params.tmdb_id)
      .eq('media_type', params.media_type);

    if (error) return failure(`Failed to remove favorite: ${error.message}`);

    // Verification
    const { data: gone } = await db
      .from('favorite_items')
      .select('id')
      .eq('user_id', userId)
      .eq('tmdb_id', params.tmdb_id)
      .eq('media_type', params.media_type)
      .maybeSingle();

    if (gone) return failure('Write verification failed: title still in favorites after delete.');
    return success({ tmdb_id: params.tmdb_id }, 'Removed title from favorites.');
  }
}

// ── 15. add_to_library ────────────────────────────────────────────────────────

export interface AddToLibraryParams {
  tmdb_id: number;
  media_type: 'movie' | 'tv';
  title?: string;
  status: LibraryStatus;
  user_rating?: number | null;
  note?: string | null;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  release_date?: string | null;
}

export async function addToLibraryTool(
  db: SupabaseClient,
  userId: string,
  params: AddToLibraryParams,
): Promise<ToolResult> {
  let title = params.title;
  let posterPath = params.poster_path ?? null;
  let backdropPath = params.backdrop_path ?? null;
  let voteAverage = params.vote_average ?? 0;
  let releaseDate = params.release_date ?? null;

  if (!title) {
    try {
      const details = await getTmdbDetails(params.tmdb_id, params.media_type);
      title = details.title;
      posterPath = posterPath || details.poster_path;
      backdropPath = backdropPath || details.backdrop_path;
      voteAverage = voteAverage || details.vote_average;
      releaseDate = releaseDate || details.release_date;
    } catch {
      return failure(`Title name required for ID ${params.tmdb_id}.`);
    }
  }

  const payload: Record<string, unknown> = {
    user_id: userId,
    tmdb_id: params.tmdb_id,
    media_type: params.media_type,
    title,
    status: params.status,
    poster_path: posterPath,
    backdrop_path: backdropPath,
    vote_average: voteAverage,
    release_date: releaseDate,
    updated_at: new Date().toISOString(),
  };

  if (params.user_rating !== undefined) payload.user_rating = params.user_rating;
  if (params.note !== undefined) payload.note = params.note;

  const { data, error } = await db
    .from('library_items')
    .upsert(payload, { onConflict: 'user_id,tmdb_id,media_type' })
    .select()
    .single();

  if (error) return failure(`Failed to add/update library item: ${error.message}`);

  // Write verification
  const { data: verify } = await db
    .from('library_items')
    .select('*')
    .eq('id', (data as Record<string, unknown>).id as string)
    .eq('user_id', userId)
    .single();

  if (!verify) return failure('Write verification failed: item not found after insert.');
  return success(verify, `"${title}" has been saved in your library as "${params.status}".`);
}

// ── 16. get_my_profile ────────────────────────────────────────────────────────

export async function getMyProfileTool(
  db: SupabaseClient,
  userId: string,
): Promise<ToolResult> {
  const { data, error } = await db
    .from('profiles')
    .select('id, username, display_name, full_name, avatar_url, bio, role, created_at')
    .eq('id', userId)
    .maybeSingle();

  if (error) return failure(`Failed to get profile: ${error.message}`);
  if (!data) return failure('Profile not found.');

  return success(data);
}
