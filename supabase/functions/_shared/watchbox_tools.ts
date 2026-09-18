/**
 * All Watchbox MCP tool logic — shared between mcp-server Edge Function.
 * Each function takes (db, userId, args) — userId is ALWAYS from the validated OAuth token.
 * The AI caller NEVER supplies user_id.
 */

import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_KEY  = () => Deno.env.get('TMDB_API_KEY') ?? '';

export type LibraryStatus = 'Watching' | 'Completed' | 'Plan to Watch' | 'On Hold' | 'Dropped';
export const LIBRARY_STATUSES: LibraryStatus[] = ['Watching','Completed','Plan to Watch','On Hold','Dropped'];

function isLibraryStatus(s: unknown): s is LibraryStatus {
  return typeof s === 'string' && (LIBRARY_STATUSES as string[]).includes(s);
}

function requireString(args: Record<string, unknown>, key: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) throw new Error(`'${key}' is required.`);
  return v.trim();
}

function requireNumber(args: Record<string, unknown>, key: string): number {
  const v = Number(args[key]);
  if (!Number.isFinite(v)) throw new Error(`'${key}' must be a number.`);
  return v;
}

function ok(data: unknown): string {
  return JSON.stringify({ ok: true, ...( typeof data === 'object' && data !== null ? data : { result: data }) });
}

function err(message: string): { error: string } {
  return { error: message };
}

// ── TMDB helpers ──────────────────────────────────────────────────────────────

async function tmdbFetch(path: string): Promise<unknown> {
  const res = await fetch(`${TMDB_BASE}${path}&api_key=${TMDB_KEY()}`);
  if (!res.ok) throw new Error(`TMDB error ${res.status}`);
  return res.json();
}

async function searchTmdb(query: string, mediaType?: string): Promise<unknown[]> {
  const endpoint = mediaType === 'movie'
    ? `/search/movie?query=${encodeURIComponent(query)}`
    : mediaType === 'tv'
    ? `/search/tv?query=${encodeURIComponent(query)}`
    : `/search/multi?query=${encodeURIComponent(query)}`;

  const data = await tmdbFetch(endpoint) as { results?: unknown[] };
  const results = (data.results ?? []) as Record<string, unknown>[];

  return results
    .filter(r => r['media_type'] === 'movie' || r['media_type'] === 'tv' || mediaType)
    .slice(0, 10)
    .map(r => ({
      tmdb_id: r['id'],
      media_type: r['media_type'] ?? mediaType,
      title: (r['title'] ?? r['name']) as string,
      overview: r['overview'],
      poster_path: r['poster_path'],
      backdrop_path: r['backdrop_path'],
      vote_average: r['vote_average'],
      release_date: (r['release_date'] ?? r['first_air_date']) as string | null,
    }));
}

// ── Read tools ────────────────────────────────────────────────────────────────

export async function getMyProfile(db: SupabaseClient, userId: string): Promise<string> {
  const { data, error } = await db.from('profiles').select('id,username,display_name,full_name,avatar_url,bio,created_at').eq('id', userId).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return JSON.stringify(err('Profile not found.'));
  return ok(data);
}

export async function getMyLibrary(db: SupabaseClient, userId: string): Promise<string> {
  const { data, error } = await db.from('library_items').select('*').eq('user_id', userId).order('added_at', { ascending: false }).limit(500);
  if (error) throw new Error(error.message);
  return ok({ items: data ?? [], count: (data ?? []).length });
}

export async function getMyWatching(db: SupabaseClient, userId: string): Promise<string> {
  const { data, error } = await db.from('library_items').select('*').eq('user_id', userId).eq('status', 'Watching').order('updated_at', { ascending: false }).limit(200);
  if (error) throw new Error(error.message);
  return ok({ items: data ?? [], count: (data ?? []).length });
}

export async function getMyWatched(db: SupabaseClient, userId: string): Promise<string> {
  const { data, error } = await db.from('library_items').select('*').eq('user_id', userId).eq('status', 'Completed').order('updated_at', { ascending: false }).limit(200);
  if (error) throw new Error(error.message);
  return ok({ items: data ?? [], count: (data ?? []).length });
}

export async function getMyWatchlist(db: SupabaseClient, userId: string): Promise<string> {
  const { data, error } = await db.from('library_items').select('*').eq('user_id', userId).eq('status', 'Plan to Watch').order('added_at', { ascending: false }).limit(200);
  if (error) throw new Error(error.message);
  return ok({ items: data ?? [], count: (data ?? []).length });
}

export async function getMyFavorites(db: SupabaseClient, userId: string): Promise<string> {
  const { data, error } = await db.from('favorite_items').select('*').eq('user_id', userId).order('added_at', { ascending: false }).limit(500);
  if (error) throw new Error(error.message);
  return ok({ items: data ?? [], count: (data ?? []).length });
}

export async function getMyFavoriteActors(db: SupabaseClient, userId: string): Promise<string> {
  const { data, error } = await db.from('actor_favorites').select('*').eq('user_id', userId).order('added_at', { ascending: false }).limit(100);
  if (error) throw new Error(error.message);
  return ok({ items: data ?? [], count: (data ?? []).length });
}

export async function searchMyLibrary(db: SupabaseClient, userId: string, args: Record<string, unknown>): Promise<string> {
  const query = requireString(args, 'query');
  const { data, error } = await db.from('library_items').select('*').eq('user_id', userId).ilike('title', `%${query}%`).order('updated_at', { ascending: false }).limit(50);
  if (error) throw new Error(error.message);
  return ok({ items: data ?? [], count: (data ?? []).length, query });
}

export async function getMyStats(db: SupabaseClient, userId: string): Promise<string> {
  const [libRes, favRes, actorRes] = await Promise.all([
    db.from('library_items').select('*').eq('user_id', userId),
    db.from('favorite_items').select('id').eq('user_id', userId),
    db.from('actor_favorites').select('id').eq('user_id', userId),
  ]);
  if (libRes.error) throw new Error(libRes.error.message);

  const items = (libRes.data ?? []) as Array<Record<string, unknown>>;
  const by_status = Object.fromEntries(LIBRARY_STATUSES.map(s => [s, items.filter(i => i['status'] === s).length]));
  const rated = items.filter(i => i['user_rating'] !== null && i['user_rating'] !== undefined);
  const avg_rating = rated.length > 0
    ? Math.round(rated.reduce((sum, i) => sum + (i['user_rating'] as number), 0) / rated.length * 10) / 10
    : null;

  return ok({
    total: items.length,
    by_status,
    movies: items.filter(i => i['media_type'] === 'movie').length,
    tv_shows: items.filter(i => i['media_type'] === 'tv').length,
    favorites: (favRes.data ?? []).length,
    favorite_actors: (actorRes.data ?? []).length,
    avg_rating,
    most_recent: items[0] ?? null,
  });
}

export async function getEpisodeProgress(db: SupabaseClient, userId: string, args: Record<string, unknown>): Promise<string> {
  const tvId = requireNumber(args, 'tv_id');
  const { data, error } = await db.from('episode_progress').select('*').eq('user_id', userId).eq('tv_id', tvId).order('updated_at', { ascending: false });
  if (error) throw new Error(error.message);
  return ok({ tv_id: tvId, episodes: data ?? [], count: (data ?? []).length });
}

// ── TMDB search tools ─────────────────────────────────────────────────────────

export async function searchTitles(args: Record<string, unknown>): Promise<string> {
  const query = requireString(args, 'query');
  const mediaType = (args['media_type'] as string | undefined);
  const results = await searchTmdb(query, mediaType);
  return ok({ results, count: results.length, query });
}

export async function getTitle(args: Record<string, unknown>): Promise<string> {
  const tmdbId = requireNumber(args, 'tmdb_id');
  const mediaType = requireString(args, 'media_type');
  if (mediaType !== 'movie' && mediaType !== 'tv') throw new Error("media_type must be 'movie' or 'tv'.");

  const data = await tmdbFetch(`/${mediaType}/${tmdbId}?`) as Record<string, unknown>;
  return ok({
    tmdb_id: data['id'],
    media_type: mediaType,
    title: (data['title'] ?? data['name']) as string,
    overview: data['overview'],
    poster_path: data['poster_path'],
    backdrop_path: data['backdrop_path'],
    vote_average: data['vote_average'],
    release_date: (data['release_date'] ?? data['first_air_date']) as string | null,
    genres: data['genres'],
    status: data['status'],
    number_of_seasons: data['number_of_seasons'],
    runtime: data['runtime'],
  });
}

// ── Write tools ───────────────────────────────────────────────────────────────

export async function addToLibrary(db: SupabaseClient, userId: string, args: Record<string, unknown>): Promise<string> {
  const tmdbId    = requireNumber(args, 'tmdb_id');
  const mediaType = requireString(args, 'media_type');
  const title     = requireString(args, 'title');
  const status    = (args['status'] as string) ?? 'Plan to Watch';

  if (mediaType !== 'movie' && mediaType !== 'tv') throw new Error("media_type must be 'movie' or 'tv'.");
  if (!isLibraryStatus(status)) throw new Error(`status must be one of: ${LIBRARY_STATUSES.join(', ')}`);

  const payload = {
    user_id:      userId,
    tmdb_id:      tmdbId,
    media_type:   mediaType,
    title,
    status,
    poster_path:   (args['poster_path']  as string | null) ?? null,
    backdrop_path: (args['backdrop_path'] as string | null) ?? null,
    vote_average:  (args['vote_average']  as number) ?? 0,
    release_date:  (args['release_date']  as string | null) ?? null,
  };

  // Upsert — same conflict key as the Watchbox app
  const { data, error } = await db
    .from('library_items')
    .upsert(payload, { onConflict: 'user_id,tmdb_id,media_type' })
    .select()
    .single();

  if (error) throw new Error(`Failed to add to library: ${error.message}`);

  // WRITE VERIFICATION: re-read and confirm
  const { data: verify, error: ve } = await db
    .from('library_items')
    .select('*')
    .eq('id', (data as Record<string, unknown>)['id'] as string)
    .eq('user_id', userId)
    .single();
  if (ve || !verify) throw new Error('Write verification failed — record not found after insert.');

  const v = verify as Record<string, unknown>;
  if (v['title'] !== title || v['status'] !== status) {
    throw new Error(`Write verification failed — expected status="${status}", got "${v['status']}".`);
  }

  return ok({ verified: true, item: verify, action: 'added_or_updated' });
}

export async function updateLibraryItem(db: SupabaseClient, userId: string, args: Record<string, unknown>): Promise<string> {
  const id = requireString(args, 'id');
  const updates: Record<string, unknown> = {};

  if (args['status'] !== undefined) {
    if (!isLibraryStatus(args['status'])) throw new Error(`status must be one of: ${LIBRARY_STATUSES.join(', ')}`);
    updates['status'] = args['status'];
  }
  if (args['note'] !== undefined)        updates['note']        = args['note'];
  if (args['user_rating'] !== undefined) updates['user_rating'] = args['user_rating'];

  if (Object.keys(updates).length === 0) throw new Error('No fields to update. Provide at least one of: status, note, user_rating.');

  updates['updated_at'] = new Date().toISOString();

  const { data, error } = await db
    .from('library_items')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)  // RLS double-lock: prevents cross-user updates
    .select()
    .single();

  if (error) throw new Error(`Update failed: ${error.message}`);
  if (!data) throw new Error('Item not found or you do not have permission to modify it.');

  // WRITE VERIFICATION
  const { data: verify, error: ve } = await db
    .from('library_items')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();
  if (ve || !verify) throw new Error('Write verification failed — record not found after update.');

  const v = verify as Record<string, unknown>;
  for (const [k, expected] of Object.entries(updates)) {
    if (k === 'updated_at') continue;
    if (v[k] !== expected) {
      throw new Error(`Write verification failed — ${k} expected "${expected}", got "${v[k]}".`);
    }
  }

  return ok({ verified: true, item: verify, updates_applied: updates });
}

export async function removeFromLibrary(db: SupabaseClient, userId: string, args: Record<string, unknown>): Promise<string> {
  const id = requireString(args, 'id');

  // Verify item exists and belongs to this user before deleting
  const { data: existing } = await db
    .from('library_items').select('id,title').eq('id', id).eq('user_id', userId).maybeSingle();
  if (!existing) throw new Error('Item not found or you do not have permission to remove it.');

  const { error, count } = await db
    .from('library_items')
    .delete({ count: 'exact' })
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw new Error(`Delete failed: ${error.message}`);
  if ((count ?? 0) === 0) throw new Error('Delete verification failed — 0 rows deleted.');

  // WRITE VERIFICATION: confirm it's gone
  const { data: gone } = await db
    .from('library_items').select('id').eq('id', id).eq('user_id', userId).maybeSingle();
  if (gone) throw new Error('Write verification failed — record still exists after delete.');

  return ok({ verified: true, removed_id: id, title: (existing as Record<string, unknown>)['title'] });
}

export async function setFavorite(db: SupabaseClient, userId: string, args: Record<string, unknown>): Promise<string> {
  const tmdbId    = requireNumber(args, 'tmdb_id');
  const mediaType = requireString(args, 'media_type');
  const title     = requireString(args, 'title');
  const favorited = args['favorited'] !== false; // default true (add)

  if (mediaType !== 'movie' && mediaType !== 'tv') throw new Error("media_type must be 'movie' or 'tv'.");

  if (!favorited) {
    const { error } = await db.from('favorite_items').delete().eq('user_id', userId).eq('tmdb_id', tmdbId).eq('media_type', mediaType);
    if (error) throw new Error(`Remove favorite failed: ${error.message}`);

    // WRITE VERIFICATION
    const { data: check } = await db.from('favorite_items').select('id').eq('user_id', userId).eq('tmdb_id', tmdbId).eq('media_type', mediaType).maybeSingle();
    if (check) throw new Error('Write verification failed — favorite still exists after removal.');

    return ok({ verified: true, favorited: false, tmdb_id: tmdbId, title });
  }

  const { error } = await db.from('favorite_items').upsert(
    { user_id: userId, tmdb_id: tmdbId, media_type: mediaType, title,
      poster_path: (args['poster_path'] as string | null) ?? null,
      backdrop_path: (args['backdrop_path'] as string | null) ?? null,
      vote_average: (args['vote_average'] as number) ?? 0,
      release_date: (args['release_date'] as string | null) ?? null },
    { onConflict: 'user_id,tmdb_id,media_type' },
  );
  if (error) throw new Error(`Add favorite failed: ${error.message}`);

  // WRITE VERIFICATION
  const { data: check } = await db.from('favorite_items').select('id').eq('user_id', userId).eq('tmdb_id', tmdbId).eq('media_type', mediaType).maybeSingle();
  if (!check) throw new Error('Write verification failed — favorite not found after insert.');

  return ok({ verified: true, favorited: true, tmdb_id: tmdbId, title });
}

export async function updateProgress(db: SupabaseClient, userId: string, args: Record<string, unknown>): Promise<string> {
  const tvId           = requireNumber(args, 'tv_id');
  const seasonNumber   = requireNumber(args, 'season_number');
  const episodeNumber  = requireNumber(args, 'episode_number');
  const positionSecs   = (args['position_secs']  as number) ?? 0;
  const durationSecs   = (args['duration_secs']  as number) ?? 0;
  const watchedArg     = args['watched'];
  const autoWatched    = durationSecs > 0 && positionSecs / durationSecs >= 0.9;
  const watched        = watchedArg !== undefined ? Boolean(watchedArg) : autoWatched;

  const { data, error } = await db.from('episode_progress').upsert(
    { user_id: userId, tv_id: tvId, season_number: seasonNumber, episode_number: episodeNumber,
      watched, position_secs: positionSecs, duration_secs: durationSecs },
    { onConflict: 'user_id,tv_id,season_number,episode_number' },
  ).select().single();

  if (error) throw new Error(`Update progress failed: ${error.message}`);

  // WRITE VERIFICATION
  const { data: verify, error: ve } = await db.from('episode_progress')
    .select('*').eq('user_id', userId).eq('tv_id', tvId)
    .eq('season_number', seasonNumber).eq('episode_number', episodeNumber).single();
  if (ve || !verify) throw new Error('Write verification failed — progress record not found after upsert.');

  return ok({ verified: true, progress: verify });
}
