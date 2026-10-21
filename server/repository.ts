import type { SupabaseClient } from '@supabase/supabase-js';

export const LIBRARY_STATUSES = ['Watching', 'Completed', 'Plan to Watch', 'On Hold', 'Dropped'] as const;
export type LibraryStatus = (typeof LIBRARY_STATUSES)[number];
export type MediaType = 'movie' | 'tv';

export interface LibraryFilters {
  mediaType?: MediaType;
  status?: LibraryStatus;
  limit: number;
  sortBy: 'updated_at' | 'added_at' | 'user_rating' | 'title';
}

export class WatchboxDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WatchboxDataError';
  }
}

function ensureNoError(error: { code?: string; message?: string } | null): void {
  if (!error) return;
  if (error.code === 'PGRST116') throw new WatchboxDataError('No matching Watchbox item was found for your account.');
  if (error.code === '23505') throw new WatchboxDataError('That title already exists in this Watchbox list.');
  if (error.code === '23514' || error.code === '22P02') throw new WatchboxDataError('The requested Watchbox values are not valid for the existing database schema.');
  throw new WatchboxDataError('Watchbox could not complete the database request. Check the project schema and account permissions.');
}

export class WatchboxRepository {
  constructor(private readonly db: SupabaseClient) {}

  async listLibrary(userId: string, filters: LibraryFilters): Promise<unknown[]> {
    let query = this.db.from('library_items').select('*').eq('user_id', userId);
    if (filters.mediaType) query = query.eq('media_type', filters.mediaType);
    if (filters.status) query = query.eq('status', filters.status);
    const ascending = filters.sortBy === 'title';
    const { data, error } = await query
      .order(filters.sortBy, { ascending, nullsFirst: false })
      .limit(filters.limit);
    ensureNoError(error);
    return data ?? [];
  }

  async searchLibrary(
    userId: string,
    queryText: string,
    filters: Omit<LibraryFilters, 'sortBy'> & { minRating?: number; maxRating?: number; releaseYear?: number },
  ): Promise<unknown[]> {
    let query = this.db.from('library_items').select('*').eq('user_id', userId);
    if (queryText?.trim()) query = query.ilike('title', `%${queryText.trim()}%`);
    if (filters.mediaType) query = query.eq('media_type', filters.mediaType);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.minRating !== undefined) query = query.gte('user_rating', filters.minRating);
    if (filters.maxRating !== undefined) query = query.lte('user_rating', filters.maxRating);
    if (filters.releaseYear !== undefined) query = query.ilike('release_date', `${filters.releaseYear}%`);
    const { data, error } = await query.order('updated_at', { ascending: false }).limit(filters.limit);
    ensureNoError(error);
    return data ?? [];
  }

  async listWatchlist(userId: string, mediaType?: MediaType, limit = 100): Promise<unknown[]> {
    let query = this.db.from('watchlist_items').select('*').eq('user_id', userId);
    if (mediaType) query = query.eq('media_type', mediaType);
    const { data, error } = await query.order('added_at', { ascending: false }).limit(limit);
    ensureNoError(error);
    return data ?? [];
  }

  async listFavorites(userId: string, mediaType?: MediaType, limit = 100): Promise<unknown[]> {
    let query = this.db.from('favorite_items').select('*').eq('user_id', userId);
    if (mediaType) query = query.eq('media_type', mediaType);
    const { data, error } = await query.order('added_at', { ascending: false }).limit(limit);
    ensureNoError(error);
    return data ?? [];
  }

  async getStatistics(userId: string): Promise<Record<string, unknown>> {
    const count = async (table: 'library_items' | 'watchlist_items' | 'favorite_items' | 'actor_favorites', column: 'status' | 'media_type' | null, value: string | null) => {
      let query = this.db.from(table).select('id', { count: 'exact', head: true }).eq('user_id', userId);
      if (column && value) query = query.eq(column, value);
      const { count: result, error } = await query;
      ensureNoError(error);
      return result ?? 0;
    };

    const [total, movies, tv, watchlist, favorites, actorFavorites, ...statusCounts] = await Promise.all([
      count('library_items', null, null),
      count('library_items', 'media_type', 'movie'),
      count('library_items', 'media_type', 'tv'),
      count('watchlist_items', null, null),
      count('favorite_items', null, null),
      count('actor_favorites', null, null),
      ...LIBRARY_STATUSES.map((status) => count('library_items', 'status', status)),
    ]);

    const { data: ratings, error: ratingError } = await this.db
      .from('library_items')
      .select('user_rating')
      .eq('user_id', userId)
      .not('user_rating', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(1000);
    ensureNoError(ratingError);
    const ratingValues = (ratings ?? [])
      .map((row) => Number((row as { user_rating?: unknown }).user_rating))
      .filter((rating) => Number.isFinite(rating));

    const { data: recent, error: recentError } = await this.db
      .from('library_items')
      .select('id,title,tmdb_id,media_type,status,updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1);
    ensureNoError(recentError);

    return {
      total,
      movies,
      tv_shows: tv,
      watchlist,
      favorites,
      favorite_actors: actorFavorites,
      by_status: Object.fromEntries(LIBRARY_STATUSES.map((status, index) => [status, statusCounts[index] ?? 0])),
      rated_items_in_sample: ratingValues.length,
      average_rating_in_sample: ratingValues.length
        ? Math.round((ratingValues.reduce((sum, rating) => sum + rating, 0) / ratingValues.length) * 10) / 10
        : null,
      rating_sample_limit: 1000,
      most_recent: recent?.[0] ?? null,
    };
  }

  async listEpisodeProgress(userId: string, tvId?: number, limit = 100): Promise<unknown[]> {
    let query = this.db.from('episode_progress').select('*').eq('user_id', userId);
    if (tvId !== undefined) query = query.eq('tv_id', tvId);
    const { data, error } = await query.order('updated_at', { ascending: false }).limit(limit);
    ensureNoError(error);
    return data ?? [];
  }

  async listTrackedTitles(userId: string): Promise<Array<{ tmdb_id: number; media_type: MediaType; status: LibraryStatus }>> {
    const rows: Array<{ tmdb_id: number; media_type: MediaType; status: LibraryStatus }> = [];
    const pageSize = 1000;
    for (let page = 0; page < 20; page += 1) {
      const from = page * pageSize;
      const { data, error } = await this.db
        .from('library_items')
        .select('tmdb_id,media_type,status')
        .eq('user_id', userId)
        .range(from, from + pageSize - 1);
      ensureNoError(error);
      const batch = (data ?? []) as Array<{ tmdb_id: number; media_type: MediaType; status: LibraryStatus }>;
      rows.push(...batch);
      if (batch.length < pageSize) return rows;
    }
    throw new WatchboxDataError('The library is larger than this discovery operation can safely inspect.');
  }

  async topRatedTvItems(userId: string, limit = 100): Promise<unknown[]> {
    const { data, error } = await this.db
      .from('library_items')
      .select('*')
      .eq('user_id', userId)
      .eq('media_type', 'tv')
      .not('user_rating', 'is', null)
      .order('user_rating', { ascending: false, nullsFirst: false })
      .limit(limit);
    ensureNoError(error);
    return data ?? [];
  }

  async addToWatchlist(userId: string, item: Record<string, unknown>): Promise<unknown> {
    const { data, error } = await this.db
      .from('watchlist_items')
      .upsert({ ...item, user_id: userId }, { onConflict: 'user_id,tmdb_id,media_type' })
      .select('*')
      .single();
    ensureNoError(error);
    if (!data) throw new WatchboxDataError('Watchlist item was not returned after saving.');
    return data;
  }

  async removeFromWatchlist(userId: string, tmdbId: number, mediaType: MediaType): Promise<{ title: string | null }> {
    const { data, error } = await this.db
      .from('watchlist_items')
      .delete({ count: 'exact' })
      .eq('user_id', userId)
      .eq('tmdb_id', tmdbId)
      .eq('media_type', mediaType)
      .select('title');
    ensureNoError(error);
    if (!data?.length) throw new WatchboxDataError('No matching watchlist title was found for your account.');
    return { title: (data[0] as { title?: string | null }).title ?? null };
  }

  async addToLibrary(userId: string, item: Record<string, unknown>): Promise<unknown> {
    const { data, error } = await this.db
      .from('library_items')
      .upsert({ ...item, user_id: userId }, { onConflict: 'user_id,tmdb_id,media_type' })
      .select('*')
      .single();
    ensureNoError(error);
    if (!data) throw new WatchboxDataError('Library item was not returned after saving.');
    return data;
  }

  async updateLibraryItem(userId: string, tmdbId: number, mediaType: MediaType, updates: Record<string, unknown>): Promise<unknown> {
    const { data, error } = await this.db
      .from('library_items')
      .update(updates)
      .eq('user_id', userId)
      .eq('tmdb_id', tmdbId)
      .eq('media_type', mediaType)
      .select('*')
      .maybeSingle();
    ensureNoError(error);
    if (!data) throw new WatchboxDataError('No matching library title was found for your account.');
    return data;
  }

  async getTitleDetails(userId: string, tmdbId: number, mediaType: MediaType): Promise<{
    library_item: unknown | null;
    is_watchlist: boolean;
    is_favorite: boolean;
    episode_progress: unknown[];
  }> {
    const [libRes, wlRes, favRes, progRes] = await Promise.all([
      this.db.from('library_items').select('*').eq('user_id', userId).eq('tmdb_id', tmdbId).eq('media_type', mediaType).maybeSingle(),
      this.db.from('watchlist_items').select('id').eq('user_id', userId).eq('tmdb_id', tmdbId).eq('media_type', mediaType).maybeSingle(),
      this.db.from('favorite_items').select('id').eq('user_id', userId).eq('tmdb_id', tmdbId).eq('media_type', mediaType).maybeSingle(),
      mediaType === 'tv'
        ? this.db.from('episode_progress').select('*').eq('user_id', userId).eq('tv_id', tmdbId).order('season_number', { ascending: true }).order('episode_number', { ascending: true })
        : Promise.resolve({ data: [] as unknown[], error: null }),
    ]);

    ensureNoError(libRes.error);
    ensureNoError(wlRes.error);
    ensureNoError(favRes.error);
    ensureNoError(progRes.error);

    return {
      library_item: libRes.data ?? null,
      is_watchlist: Boolean(wlRes.data),
      is_favorite: Boolean(favRes.data),
      episode_progress: (progRes.data ?? []) as unknown[],
    };
  }

  async listActorFavorites(userId: string, limit = 100): Promise<unknown[]> {
    const { data, error } = await this.db.from('actor_favorites').select('*').eq('user_id', userId).order('added_at', { ascending: false }).limit(limit);
    ensureNoError(error);
    return data ?? [];
  }

  async addFavoriteTitle(userId: string, item: Record<string, unknown>): Promise<unknown> {
    const { data, error } = await this.db
      .from('favorite_items')
      .upsert({ ...item, user_id: userId }, { onConflict: 'user_id,tmdb_id,media_type' })
      .select('*')
      .single();
    ensureNoError(error);
    if (!data) throw new WatchboxDataError('Favorite item was not returned after saving.');
    return data;
  }

  async removeFavoriteTitle(userId: string, tmdbId: number, mediaType: MediaType): Promise<{ removed: boolean }> {
    const { data, error } = await this.db
      .from('favorite_items')
      .delete({ count: 'exact' })
      .eq('user_id', userId)
      .eq('tmdb_id', tmdbId)
      .eq('media_type', mediaType)
      .select('id');
    ensureNoError(error);
    if (!data?.length) throw new WatchboxDataError('No matching favorite title was found for your account.');
    return { removed: true };
  }

  async addFavoriteActor(userId: string, item: Record<string, unknown>): Promise<unknown> {
    const { data, error } = await this.db
      .from('actor_favorites')
      .upsert({ ...item, user_id: userId }, { onConflict: 'user_id,person_id' })
      .select('*')
      .single();
    ensureNoError(error);
    if (!data) throw new WatchboxDataError('Favorite actor was not returned after saving.');
    return data;
  }

  async removeFavoriteActor(userId: string, personId: number): Promise<{ removed: boolean }> {
    const { data, error } = await this.db
      .from('actor_favorites')
      .delete({ count: 'exact' })
      .eq('user_id', userId)
      .eq('person_id', personId)
      .select('id');
    ensureNoError(error);
    if (!data?.length) throw new WatchboxDataError('No matching favorite actor was found for your account.');
    return { removed: true };
  }

  async updateEpisodeProgress(
    userId: string,
    progress: { tv_id: number; season_number: number; episode_number: number; watched?: boolean; position_secs?: number; duration_secs?: number },
  ): Promise<unknown> {
    const { data, error } = await this.db
      .from('episode_progress')
      .upsert({ ...progress, user_id: userId }, { onConflict: 'user_id,tv_id,season_number,episode_number' })
      .select('*')
      .single();
    ensureNoError(error);
    if (!data) throw new WatchboxDataError('Episode progress was not returned after saving.');
    return data;
  }
}
