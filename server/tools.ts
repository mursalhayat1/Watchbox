import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import type { AuthenticatedMcpUser } from './auth.js';
import { isReadClientAllowed, isWriteClientAllowed, type WatchboxConfig } from './config.js';
import { LIBRARY_STATUSES, WatchboxRepository, type LibraryStatus, type MediaType } from './repository.js';

const Media = z.enum(['movie', 'tv']);
const Status = z.enum(LIBRARY_STATUSES);
const Rating = z.number().min(0).max(10).refine((value) => Math.abs(value * 10 - Math.round(value * 10)) < 1e-8, 'Rating must use at most one decimal place.');
const Limit = z.number().int().min(1).max(100).default(50);

class ToolFailure extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ToolFailure';
  }
}

function safeError(error: unknown): string {
  if (error instanceof ToolFailure) return error.message;
  if (error instanceof Error && error.name === 'WatchboxDataError') return error.message;
  return 'The Watchbox request could not be completed. Check the server configuration and your account permissions.';
}

function result(value: unknown, isError = false): CallToolResult {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(value) }],
    ...(isError ? { isError: true } : {}),
  };
}

function addReadTool<T extends z.AnyZodObject>(
  server: McpServer,
  auth: AuthenticatedMcpUser,
  _repo: WatchboxRepository,
  config: WatchboxConfig,
  name: string,
  title: string,
  description: string,
  inputSchema: T,
  handler: (args: z.infer<T>) => Promise<unknown>,
) {
  server.registerTool(name, {
    title,
    description,
    inputSchema: inputSchema.shape,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  }, async (args: Record<string, unknown>) => {
    if (!isReadClientAllowed(auth.clientId, config)) return result({ error: 'This OAuth client is not authorized to read Watchbox data.' }, true);
    const parsed = inputSchema.safeParse(args);
    if (!parsed.success) return result({ error: 'Invalid tool arguments.', issues: parsed.error.issues.map(({ path, message }) => ({ path, message })) }, true);
    try {
      return result(await handler(parsed.data as z.infer<T>));
    } catch (error) {
      return result({ error: safeError(error) }, true);
    }
  });
}

function addWriteTool<T extends z.AnyZodObject>(
  server: McpServer,
  auth: AuthenticatedMcpUser,
  _repo: WatchboxRepository,
  config: WatchboxConfig,
  name: string,
  title: string,
  description: string,
  inputSchema: T,
  handler: (args: z.infer<T>) => Promise<unknown>,
  destructive = false,
) {
  server.registerTool(name, {
    title,
    description,
    inputSchema: inputSchema.shape,
    annotations: { readOnlyHint: false, destructiveHint: destructive, idempotentHint: false, openWorldHint: false },
  }, async (args: Record<string, unknown>) => {
    if (!isWriteClientAllowed(auth.clientId, config)) return result({ error: 'This OAuth client is read-only. Watchbox writes are not authorized for this client.' }, true);
    const parsed = inputSchema.safeParse(args);
    if (!parsed.success) return result({ error: 'Invalid tool arguments.', issues: parsed.error.issues.map(({ path, message }) => ({ path, message })) }, true);
    try {
      return result(await handler(parsed.data as z.infer<T>));
    } catch (error) {
      return result({ error: safeError(error) }, true);
    }
  });
}

function tmdbKey(config: WatchboxConfig): string {
  if (!config.tmdbApiKey) throw new ToolFailure('TMDB search is not configured on the Watchbox server.');
  return config.tmdbApiKey;
}

async function tmdbGet<T>(
  config: WatchboxConfig,
  fetcher: typeof fetch,
  endpoint: string,
  params: Record<string, string | number | boolean | undefined> = {},
): Promise<T> {
  const url = new URL(endpoint.replace(/^\//, ''), 'https://api.themoviedb.org/3/');
  url.searchParams.set('api_key', tmdbKey(config));
  for (const [key, value] of Object.entries(params)) if (value !== undefined) url.searchParams.set(key, String(value));
  const response = await fetcher(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(12_000) });
  if (!response.ok) throw new ToolFailure(`TMDB metadata search is temporarily unavailable (HTTP ${response.status}).`);
  return await response.json() as T;
}

function toTmdbTitle(row: Record<string, unknown>, mediaType?: MediaType) {
  const resolvedType = mediaType ?? (row.media_type === 'tv' ? 'tv' : 'movie');
  return {
    tmdb_id: row.id,
    media_type: resolvedType,
    title: row.title ?? row.name,
    overview: row.overview ?? null,
    poster_path: row.poster_path ?? null,
    backdrop_path: row.backdrop_path ?? null,
    vote_average: row.vote_average ?? null,
    release_date: row.release_date ?? row.first_air_date ?? null,
    original_language: row.original_language ?? null,
  };
}

async function fetchDiscoverPage(
  config: WatchboxConfig,
  fetcher: typeof fetch,
  mediaType: MediaType,
  language: string,
  genreIds: string,
  page: number,
  sortBy: string,
) {
  const data = await tmdbGet<{ results?: Array<Record<string, unknown>> }>(config, fetcher, `discover/${mediaType}`, {
    with_original_language: language,
    with_genres: genreIds,
    sort_by: sortBy,
    include_adult: false,
    page,
  });
  return data.results ?? [];
}

export interface ToolDependencies {
  config: WatchboxConfig;
  fetcher?: typeof fetch;
}

export function createWatchboxMcpServer(
  auth: AuthenticatedMcpUser,
  repo: WatchboxRepository,
  dependencies: ToolDependencies,
): McpServer {
  const { config } = dependencies;
  const fetcher = dependencies.fetcher ?? fetch;
  const server = new McpServer({ name: 'watchbox-mcp', version: '1.0.0' }, {
    capabilities: { tools: {} },
    instructions: 'Use only the authenticated user’s Watchbox data. User identity is obtained from the verified OAuth access token; tool arguments never accept a user ID. A client must be explicitly allow-listed for writes. Watchbox uses title status values Watching, Completed, Plan to Watch, On Hold, and Dropped; ratings are 0–10 with one decimal place.',
  });

  addReadTool(server, auth, repo, config, 'watchbox_list_library', 'List library', 'List titles in the authenticated user’s Watchbox library. Filter by status or media type; use sort_by=user_rating to find highly rated items. Results are limited to at most 100 rows.', z.object({
    media_type: Media.optional(),
    status: Status.optional(),
    sort_by: z.enum(['updated_at', 'added_at', 'user_rating', 'title']).default('updated_at'),
    limit: Limit,
  }).strict(), async ({ media_type, status, sort_by, limit }) => ({
    items: await repo.listLibrary(auth.userId, { mediaType: media_type, status, sortBy: sort_by, limit }),
  }));

  addReadTool(server, auth, repo, config, 'watchbox_search_library', 'Search library', 'Search the authenticated user’s library by title, optionally filtering status or movie/TV type.', z.object({
    query: z.string().trim().min(1).max(120),
    media_type: Media.optional(),
    status: Status.optional(),
    limit: Limit,
  }).strict(), async ({ query, media_type, status, limit }) => ({
    query,
    items: await repo.searchLibrary(auth.userId, query, { mediaType: media_type, status, limit }),
  }));

  addReadTool(server, auth, repo, config, 'watchbox_list_watchlist', 'List watchlist', 'List titles in the authenticated user’s separate Watchlist table, optionally filtered to movies or TV.', z.object({
    media_type: Media.optional(),
    limit: Limit,
  }).strict(), async ({ media_type, limit }) => ({ items: await repo.listWatchlist(auth.userId, media_type, limit) }));

  addReadTool(server, auth, repo, config, 'watchbox_list_favorites', 'List favorites', 'List the authenticated user’s favorite movies and TV shows.', z.object({
    media_type: Media.optional(),
    limit: Limit,
  }).strict(), async ({ media_type, limit }) => ({ items: await repo.listFavorites(auth.userId, media_type, limit) }));

  addReadTool(server, auth, repo, config, 'watchbox_get_statistics', 'Get library statistics', 'Return counts for the authenticated user’s library, watchlist, favorites and each library status. Average rating uses the most recently updated 1,000 rated entries at most; the sample limit is included in the response.', z.object({}).strict(), async () => repo.getStatistics(auth.userId));

  addReadTool(server, auth, repo, config, 'watchbox_get_episode_progress', 'Get episode progress', 'Read the authenticated user’s TV episode progress, optionally for one TMDB TV ID.', z.object({
    tv_id: z.number().int().positive().optional(),
    limit: Limit,
  }).strict(), async ({ tv_id, limit }) => ({
    episodes: await repo.listEpisodeProgress(auth.userId, tv_id, limit),
  }));

  addReadTool(server, auth, repo, config, 'watchbox_search_tmdb', 'Search movie and TV metadata', 'Search TMDB metadata for a title. This does not read or change library data.', z.object({
    query: z.string().trim().min(1).max(120),
    media_type: Media.optional(),
    limit: z.number().int().min(1).max(20).default(10),
  }).strict(), async ({ query, media_type, limit }) => {
    const endpoint = media_type ? `search/${media_type}` : 'search/multi';
    const data = await tmdbGet<{ results?: Array<Record<string, unknown>> }>(config, fetcher, endpoint, { query, include_adult: false });
    const results = (data.results ?? []).filter((item) => media_type || item.media_type === 'movie' || item.media_type === 'tv').slice(0, limit);
    return { query, results: results.map((row) => toTmdbTitle(row, media_type)) };
  });

  addReadTool(server, auth, repo, config, 'watchbox_discover_titles', 'Discover movies or TV', 'Discover TMDB titles by original language, genre IDs and sort order. Set original_language=ko and genre_ids=18 with media_type=tv to browse Korean dramas. Set only_untracked=true to omit items already tracked outside Plan to Watch in the user’s library.', z.object({
    media_type: Media,
    original_language: z.string().trim().min(2).max(8).default('ko'),
    genre_ids: z.string().trim().regex(/^\d+(?:,\d+)*$/).max(80),
    sort_by: z.enum(['popularity.desc', 'vote_average.desc', 'release_date.desc']).default('popularity.desc'),
    only_untracked: z.boolean().default(false),
    limit: z.number().int().min(1).max(50).default(20),
  }).strict(), async ({ media_type, original_language, genre_ids, sort_by, only_untracked, limit }) => {
    const pages = Math.max(1, Math.ceil(limit / 20));
    const rows = (await Promise.all(Array.from({ length: pages }, (_, index) =>
      fetchDiscoverPage(config, fetcher, media_type, original_language, genre_ids, index + 1, sort_by),
    ))).flat().slice(0, Math.max(limit * 2, 20));
    const tracked = only_untracked ? await repo.listTrackedTitles(auth.userId) : [];
    const trackedIds = new Set(tracked.filter((item) => item.status !== 'Plan to Watch').map((item) => `${item.media_type}:${item.tmdb_id}`));
    const results = rows
      .filter((item) => !trackedIds.has(`${media_type}:${String(item.id)}`))
      .slice(0, limit)
      .map((row) => toTmdbTitle(row, media_type));
    return { results, count: results.length, media_type, original_language, genre_ids };
  });

  addReadTool(server, auth, repo, config, 'watchbox_find_unwatched_korean_thrillers', 'Find unwatched Korean thrillers', 'Discover Korean movies and TV thrillers (TMDB genre 53, original language ko) and omit titles already tracked in the user’s library as Watching, Completed, On Hold or Dropped. Plan to Watch titles may remain in the results. Returns up to the requested number of popular matches.', z.object({
    limit: z.number().int().min(1).max(40).default(20),
  }).strict(), async ({ limit }) => {
    const [movies, shows, tracked] = await Promise.all([
      fetchDiscoverPage(config, fetcher, 'movie', 'ko', '53', 1, 'popularity.desc'),
      fetchDiscoverPage(config, fetcher, 'tv', 'ko', '53', 1, 'popularity.desc'),
      repo.listTrackedTitles(auth.userId),
    ]);
    const trackedIds = new Set(tracked.filter((item) => item.status !== 'Plan to Watch').map((item) => `${item.media_type}:${item.tmdb_id}`));
    const results = [...movies.map((row) => toTmdbTitle(row, 'movie')), ...shows.map((row) => toTmdbTitle(row, 'tv'))]
      .filter((row) => !trackedIds.has(`${row.media_type}:${row.tmdb_id}`))
      .slice(0, limit);
    return { results, count: results.length, filters: { original_language: 'ko', tmdb_genre_id: 53 } };
  });

  addReadTool(server, auth, repo, config, 'watchbox_top_rated_korean_dramas', 'Find highest-rated Korean dramas', 'Inspect the authenticated user’s 100 highest user-rated TV titles, fetch TMDB metadata, keep only Korean-language dramas (TMDB TV genre 18), and return them in the user-rating order.', z.object({
    limit: z.number().int().min(1).max(20).default(10),
  }).strict(), async ({ limit }) => {
    const items = await repo.topRatedTvItems(auth.userId, 100) as Array<Record<string, unknown>>;
    const matched: Array<Record<string, unknown>> = [];
    for (let offset = 0; offset < items.length; offset += 5) {
      const batch = items.slice(offset, offset + 5);
      const details = await Promise.all(batch.map(async (item) => {
        const id = Number(item.tmdb_id);
        if (!Number.isInteger(id) || id <= 0) return null;
        const metadata = await tmdbGet<Record<string, unknown>>(config, fetcher, `tv/${id}`);
        const genres = Array.isArray(metadata.genres) ? metadata.genres as Array<Record<string, unknown>> : [];
        if (metadata.original_language !== 'ko' || !genres.some((genre) => Number(genre.id) === 18)) return null;
        return { ...item, tmdb: toTmdbTitle(metadata, 'tv') };
      }));
      for (const detail of details) if (detail !== null) matched.push(detail);
    }
    return { items: matched.slice(0, limit), inspected_library_items: items.length };
  });

  // ── Canonical MCP Tools (Section 6 Requirements) ───────────────────────────

  // 1. search_titles
  addReadTool(server, auth, repo, config, 'search_titles', 'Search titles', 'Search the authenticated user’s library by title, status, genre, release year, or rating range. Set include_discover=true to also search external TMDB titles and see watch status for each result.', z.object({
    query: z.string().trim().max(120).optional(),
    media_type: Media.optional(),
    status: Status.optional(),
    min_rating: z.number().min(0).max(10).optional(),
    max_rating: z.number().min(0).max(10).optional(),
    release_year: z.number().int().min(1900).max(2100).optional(),
    include_discover: z.boolean().default(false),
    limit: Limit,
  }).strict(), async ({ query, media_type, status, min_rating, max_rating, release_year, include_discover, limit }) => {
    const libraryItems = await repo.searchLibrary(auth.userId, query ?? '', {
      mediaType: media_type,
      status,
      minRating: min_rating,
      maxRating: max_rating,
      releaseYear: release_year,
      limit,
    });

    let discoverResults: unknown[] = [];
    if (include_discover && query?.trim()) {
      try {
        const endpoint = media_type ? `search/${media_type}` : 'search/multi';
        const data = await tmdbGet<{ results?: Array<Record<string, unknown>> }>(config, fetcher, endpoint, { query: query.trim(), include_adult: false });
        discoverResults = (data.results ?? []).filter((item) => media_type || item.media_type === 'movie' || item.media_type === 'tv').slice(0, 10).map((row) => toTmdbTitle(row, media_type));
      } catch {
        // TMDB discovery optional
      }
    }

    return {
      items: libraryItems,
      count: (libraryItems as unknown[]).length,
      ...(include_discover ? { discover_results: discoverResults } : {}),
    };
  });

  // 2. get_title_details
  addReadTool(server, auth, repo, config, 'get_title_details', 'Get title details', 'Retrieve details for a title, combining TMDB metadata with the user’s library status, rating, personal notes, favorite state, and TV episode progress.', z.object({
    tmdb_id: z.number().int().positive(),
    media_type: Media,
  }).strict(), async ({ tmdb_id, media_type }) => {
    const [userState, tmdbData] = await Promise.all([
      repo.getTitleDetails(auth.userId, tmdb_id, media_type),
      tmdbGet<Record<string, unknown>>(config, fetcher, `${media_type}/${tmdb_id}`).catch(() => null),
    ]);

    return {
      tmdb_id,
      media_type,
      metadata: tmdbData ? toTmdbTitle(tmdbData, media_type) : null,
      genres: tmdbData && Array.isArray(tmdbData.genres) ? tmdbData.genres : [],
      user_library_entry: userState.library_item,
      in_watchlist: userState.is_watchlist,
      in_favorites: userState.is_favorite,
      episode_progress: userState.episode_progress,
    };
  });

  // 3. get_watchlist
  addReadTool(server, auth, repo, config, 'get_watchlist', 'Get watchlist', 'Return the authenticated user’s watchlist, optionally filtered to movies or TV series.', z.object({
    media_type: Media.optional(),
    limit: Limit,
  }).strict(), async ({ media_type, limit }) => ({
    watchlist: await repo.listWatchlist(auth.userId, media_type, limit),
  }));

  // 4. get_watch_history
  addReadTool(server, auth, repo, config, 'get_watch_history', 'Get watch history', 'Retrieve completed, currently watching, dropped, or on-hold titles from the authenticated user’s library.', z.object({
    status: z.enum(['Completed', 'Watching', 'Dropped', 'On Hold']).optional(),
    media_type: Media.optional(),
    sort_by: z.enum(['updated_at', 'added_at', 'user_rating', 'title']).default('updated_at'),
    limit: Limit,
  }).strict(), async ({ status, media_type, sort_by, limit }) => ({
    history: await repo.listLibrary(auth.userId, { mediaType: media_type, status, sortBy: sort_by, limit }),
  }));

  // 5. get_library_stats
  addReadTool(server, auth, repo, config, 'get_library_stats', 'Get library stats', 'Return accurate aggregate statistics for the authenticated user: total tracked, completed, watching, planned, dropped, on hold, movies count, TV count, favorite counts, and average rating.', z.object({}).strict(), async () => repo.getStatistics(auth.userId));

  // 6. get_favorites
  addReadTool(server, auth, repo, config, 'get_favorites', 'Get favorites', 'Retrieve the authenticated user’s favorite titles and favorite actors.', z.object({
    media_type: Media.optional(),
    include_actors: z.boolean().default(true),
    limit: Limit,
  }).strict(), async ({ media_type, include_actors, limit }) => {
    const titles = await repo.listFavorites(auth.userId, media_type, limit);
    const actors = include_actors ? await repo.listActorFavorites(auth.userId, limit) : [];
    return {
      favorites: titles,
      count: (titles as unknown[]).length,
      ...(include_actors ? { favorite_actors: actors, actor_count: (actors as unknown[]).length } : {}),
    };
  });

  // 7. get_viewing_progress
  addReadTool(server, auth, repo, config, 'get_viewing_progress', 'Get viewing progress', 'Retrieve episode and season progress for a TV show or recent progress across all shows.', z.object({
    tv_id: z.number().int().positive().optional(),
    limit: Limit,
  }).strict(), async ({ tv_id, limit }) => ({
    progress: await repo.listEpisodeProgress(auth.userId, tv_id, limit),
  }));

  if (isWriteClientAllowed(auth.clientId, config)) {
    // 8. add_to_watchlist
    addWriteTool(server, auth, repo, config, 'add_to_watchlist', 'Add to watchlist', 'Add a movie or TV series to the authenticated user’s watchlist.', z.object({
      tmdb_id: z.number().int().positive(),
      media_type: Media,
      title: z.string().trim().min(1).max(300),
      poster_path: z.string().max(300).nullable().optional(),
      vote_average: z.number().min(0).max(10).optional(),
      release_date: z.string().max(32).nullable().optional(),
    }).strict(), async (args) => ({ item: await repo.addToWatchlist(auth.userId, args as unknown as Record<string, unknown>) }));

    // 9. remove_from_watchlist
    addWriteTool(server, auth, repo, config, 'remove_from_watchlist', 'Remove from watchlist', 'Remove a title from the authenticated user’s watchlist. Requires confirm_remove=true.', z.object({
      tmdb_id: z.number().int().positive(),
      media_type: Media,
      confirm_remove: z.literal(true).describe('Explicit confirmation to remove this title from the watchlist.'),
    }).strict(), async ({ tmdb_id, media_type }) => ({
      removed: true,
      ...(await repo.removeFromWatchlist(auth.userId, tmdb_id, media_type)),
      tmdb_id,
      media_type,
    }), true);

    // 10. update_watch_status
    addWriteTool(server, auth, repo, config, 'update_watch_status', 'Update watch status', 'Update a title’s watch status to Watching, Completed, Plan to Watch, On Hold, or Dropped. Preserves ratings and notes.', z.object({
      tmdb_id: z.number().int().positive(),
      media_type: Media,
      status: Status,
    }).strict(), async ({ tmdb_id, media_type, status }) => ({
      item: await repo.updateLibraryItem(auth.userId, tmdb_id, media_type, { status }),
    }));

    // 11. update_rating
    addWriteTool(server, auth, repo, config, 'update_rating', 'Update rating', 'Set or update the user’s rating for a title on a 0 to 10 scale (in 0.1 increments). Pass null to clear rating.', z.object({
      tmdb_id: z.number().int().positive(),
      media_type: Media,
      rating: Rating.nullable(),
    }).strict(), async ({ tmdb_id, media_type, rating }) => ({
      item: await repo.updateLibraryItem(auth.userId, tmdb_id, media_type, { user_rating: rating }),
    }));

    // 12. update_notes
    addWriteTool(server, auth, repo, config, 'update_notes', 'Update personal notes', 'Create or update personal notes for a title in your library. Pass null to clear notes.', z.object({
      tmdb_id: z.number().int().positive(),
      media_type: Media,
      notes: z.string().max(5000).nullable(),
    }).strict(), async ({ tmdb_id, media_type, notes }) => ({
      item: await repo.updateLibraryItem(auth.userId, tmdb_id, media_type, { note: notes }),
    }));

    // 13. update_progress
    addWriteTool(server, auth, repo, config, 'update_progress', 'Update viewing progress', 'Update playback progress for a TV episode (season, episode, position in seconds, duration, watched state).', z.object({
      tv_id: z.number().int().positive(),
      season_number: z.number().int().min(0).max(999),
      episode_number: z.number().int().min(0).max(9999),
      watched: z.boolean().optional(),
      position_secs: z.number().int().min(0).max(86_400_000).optional(),
      duration_secs: z.number().int().min(0).max(86_400_000).optional(),
    }).strict(), async (args) => {
      if (args.watched === undefined && args.position_secs === undefined && args.duration_secs === undefined) throw new ToolFailure('Provide watched, position_secs, or duration_secs.');
      return { item: await repo.updateEpisodeProgress(auth.userId, {
        tv_id: args.tv_id,
        season_number: args.season_number,
        episode_number: args.episode_number,
        watched: args.watched,
        position_secs: args.position_secs,
        duration_secs: args.duration_secs,
      }) };
    });

    // 14. manage_favorites
    addWriteTool(server, auth, repo, config, 'manage_favorites', 'Manage favorites', 'Add or remove a title or actor from the authenticated user’s favorites.', z.object({
      action: z.enum(['add', 'remove']),
      target_type: z.enum(['title', 'actor']).default('title'),
      tmdb_id: z.number().int().positive().optional(),
      media_type: Media.optional(),
      title: z.string().max(300).optional(),
      poster_path: z.string().max(300).nullable().optional(),
      person_id: z.number().int().positive().optional(),
      person_name: z.string().max(300).optional(),
      profile_path: z.string().max(300).nullable().optional(),
    }).strict(), async ({ action, target_type, tmdb_id, media_type, title, poster_path, person_id, person_name, profile_path }) => {
      if (target_type === 'actor' || person_id !== undefined) {
        if (action === 'add') {
          if (!person_id || !person_name) throw new ToolFailure('person_id and person_name are required when adding an actor to favorites.');
          return { item: await repo.addFavoriteActor(auth.userId, { person_id, name: person_name, profile_path }) };
        } else {
          if (!person_id) throw new ToolFailure('person_id is required when removing an actor from favorites.');
          return await repo.removeFavoriteActor(auth.userId, person_id);
        }
      }

      if (!tmdb_id || !media_type) throw new ToolFailure('tmdb_id and media_type are required for title favorites.');
      if (action === 'add') {
        if (!title) throw new ToolFailure('title is required when adding a title to favorites.');
        return { item: await repo.addFavoriteTitle(auth.userId, { tmdb_id, media_type, title, poster_path }) };
      } else {
        return await repo.removeFavoriteTitle(auth.userId, tmdb_id, media_type);
      }
    });

    // ── Legacy Aliases ────────────────────────────────────────────────────────
    addWriteTool(server, auth, repo, config, 'watchbox_add_to_watchlist', 'Add to watchlist', 'Add or update one movie/TV title in the authenticated user’s Watchlist. The account identity is always taken from the validated OAuth token.', z.object({
      tmdb_id: z.number().int().positive(),
      media_type: Media,
      title: z.string().trim().min(1).max(300),
      poster_path: z.string().max(300).nullable().optional(),
      vote_average: z.number().min(0).max(10).optional(),
      release_date: z.string().max(32).nullable().optional(),
    }).strict(), async (args) => ({ item: await repo.addToWatchlist(auth.userId, args as unknown as Record<string, unknown>) }));

    addWriteTool(server, auth, repo, config, 'watchbox_remove_from_watchlist', 'Remove one watchlist title', 'Permanently remove one matching title from the authenticated user’s Watchlist. This single-record destructive action requires confirm_remove=true; no bulk-delete or clear-history operation is available.', z.object({
      tmdb_id: z.number().int().positive(),
      media_type: Media,
      confirm_remove: z.literal(true).describe('Explicit confirmation to remove exactly this title from the authenticated user’s Watchlist.'),
    }).strict(), async ({ tmdb_id, media_type }) => ({
      removed: true,
      ...(await repo.removeFromWatchlist(auth.userId, tmdb_id, media_type)),
      tmdb_id,
      media_type,
    }), true);

    addWriteTool(server, auth, repo, config, 'watchbox_add_to_library', 'Add to library', 'Add or update one movie/TV title in the authenticated user’s library with one of Watchbox’s existing statuses.', z.object({
      tmdb_id: z.number().int().positive(),
      media_type: Media,
      title: z.string().trim().min(1).max(300),
      status: Status.default('Plan to Watch'),
      poster_path: z.string().max(300).nullable().optional(),
      backdrop_path: z.string().max(300).nullable().optional(),
      vote_average: z.number().min(0).max(10).optional(),
      release_date: z.string().max(32).nullable().optional(),
    }).strict(), async (args) => ({ item: await repo.addToLibrary(auth.userId, args as unknown as Record<string, unknown>) }));

    addWriteTool(server, auth, repo, config, 'watchbox_update_library_item', 'Update library item', 'Update a single existing library title by TMDB ID and media type. Supports a Watchbox status, note (null clears it) and/or user rating from 0 to 10 in 0.1 increments. It will not add a missing item.', z.object({
      tmdb_id: z.number().int().positive(),
      media_type: Media,
      status: Status.optional(),
      note: z.string().max(5000).nullable().optional(),
      user_rating: Rating.nullable().optional(),
    }).strict(), async ({ tmdb_id, media_type, status, note, user_rating }) => {
      if (status === undefined && note === undefined && user_rating === undefined) throw new ToolFailure('Provide at least one field to update.');
      const updates: Record<string, unknown> = {};
      if (status !== undefined) updates.status = status as LibraryStatus;
      if (note !== undefined) updates.note = note;
      if (user_rating !== undefined) updates.user_rating = user_rating;
      return { item: await repo.updateLibraryItem(auth.userId, tmdb_id, media_type, updates) };
    });

    addWriteTool(server, auth, repo, config, 'watchbox_update_episode_progress', 'Update episode progress', 'Upsert progress for exactly one TV episode in the authenticated user’s progress table. All episode and duration positions are non-negative integers.', z.object({
      tv_id: z.number().int().positive(),
      season_number: z.number().int().min(0).max(999),
      episode_number: z.number().int().min(0).max(9999),
      watched: z.boolean().optional(),
      position_secs: z.number().int().min(0).max(86_400_000).optional(),
      duration_secs: z.number().int().min(0).max(86_400_000).optional(),
    }).strict(), async (args) => {
      if (args.watched === undefined && args.position_secs === undefined && args.duration_secs === undefined) throw new ToolFailure('Provide watched, position_secs, or duration_secs.');
      return { item: await repo.updateEpisodeProgress(auth.userId, {
        tv_id: args.tv_id,
        season_number: args.season_number,
        episode_number: args.episode_number,
        watched: args.watched,
        position_secs: args.position_secs,
        duration_secs: args.duration_secs,
      }) };
    });
  }

  return server;
}
