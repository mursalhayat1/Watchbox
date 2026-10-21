import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { LIBRARY_STATUSES } from './types.js';
import {
  searchTitlesTool,
  getTitleDetailsTool,
  getWatchlistTool,
  getWatchHistoryTool,
  getLibraryStatsTool,
  getFavoritesTool,
  getViewingProgressTool,
  addToWatchlistTool,
  removeFromWatchlistTool,
  updateWatchStatusTool,
  updateRatingTool,
  updateNotesTool,
  updateProgressTool,
  manageFavoritesTool,
  addToLibraryTool,
  getMyProfileTool,
  type ToolResult,
} from './tools.js';

function formatMcpResponse(result: ToolResult) {
  if (!result.ok) {
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({ error: result.error }),
        },
      ],
      isError: true,
    };
  }

  const payload: Record<string, unknown> = {
    ok: true,
    ...(result.message ? { message: result.message } : {}),
    ...(result.data !== undefined ? { data: result.data } : {}),
  };

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(payload, null, 2),
      },
    ],
  };
}

/**
 * Creates and configures a Watchbox MCP server instance for an authenticated user.
 */
export function createWatchboxMcpServer(userId: string, db: SupabaseClient): McpServer {
  const server = new McpServer(
    {
      name: 'watchbox-mcp',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  // ── 1. search_titles ────────────────────────────────────────────────────────
  server.tool(
    'search_titles',
    'Search the user\'s library and discover titles by title, genre, year, status, and rating. Ideal for queries like "Find all the Korean thrillers I have not watched" or searching your library.',
    {
      query: z.string().optional().describe('Title text or query to search for'),
      media_type: z.enum(['movie', 'tv']).optional().describe('Filter by "movie" or "tv"'),
      status: z.enum(LIBRARY_STATUSES).optional().describe('Filter by watch status (Watching, Completed, Plan to Watch, On Hold, Dropped)'),
      min_rating: z.number().min(0).max(10).optional().describe('Minimum user rating (0-10)'),
      max_rating: z.number().min(0).max(10).optional().describe('Maximum user rating (0-10)'),
      release_year: z.number().int().min(1900).max(2100).optional().describe('Release year (e.g. 2024)'),
      genre: z.string().optional().describe('Genre name (e.g., "thriller", "action", "romance", "horror")'),
      language: z.string().optional().describe('ISO 639-1 language code (e.g. "ko" for Korean, "ja" for Japanese)'),
      include_discover: z.boolean().optional().describe('When true, also searches TMDB and checks your watch status for each item'),
      limit: z.number().int().min(1).max(100).default(20).describe('Max results to return'),
      offset: z.number().int().min(0).default(0).describe('Pagination offset'),
    },
    async (args) => {
      const res = await searchTitlesTool(db, userId, args);
      return formatMcpResponse(res);
    },
  );

  // ── 2. get_title_details ────────────────────────────────────────────────────
  server.tool(
    'get_title_details',
    'Get complete details for a specific movie or TV show, including genres, runtime, user rating, watch status, notes, favorite state, and episode progress.',
    {
      id: z.string().uuid().optional().describe('Watchbox library item UUID'),
      tmdb_id: z.number().int().optional().describe('TMDB ID of the title'),
      media_type: z.enum(['movie', 'tv']).optional().describe('Required if using tmdb_id'),
    },
    async (args) => {
      const res = await getTitleDetailsTool(db, userId, args);
      return formatMcpResponse(res);
    },
  );

  // ── 3. get_watchlist ────────────────────────────────────────────────────────
  server.tool(
    'get_watchlist',
    'Retrieve movies and TV shows from the authenticated user\'s watchlist (status: "Plan to Watch"). Supports pagination and filtering by content type.',
    {
      media_type: z.enum(['movie', 'tv']).optional().describe('Filter by "movie" or "tv"'),
      limit: z.number().int().min(1).max(200).default(50).describe('Max titles to return'),
      offset: z.number().int().min(0).default(0).describe('Pagination offset'),
      sort_by: z.enum(['added_at', 'title', 'vote_average']).default('added_at').describe('Sort field'),
      sort_order: z.enum(['asc', 'desc']).default('desc').describe('Sort direction'),
    },
    async (args) => {
      const res = await getWatchlistTool(db, userId, args);
      return formatMcpResponse(res);
    },
  );

  // ── 4. get_watch_history ────────────────────────────────────────────────────
  server.tool(
    'get_watch_history',
    'Retrieve watched, currently watching, dropped, or on-hold titles from the user\'s library. Useful for "Which shows did I drop?" or "What am I currently watching?".',
    {
      status: z.enum(['Completed', 'Watching', 'Dropped', 'On Hold']).optional().describe('Filter by specific status'),
      media_type: z.enum(['movie', 'tv']).optional().describe('Filter by "movie" or "tv"'),
      limit: z.number().int().min(1).max(200).default(50).describe('Max records to return'),
      offset: z.number().int().min(0).default(0).describe('Pagination offset'),
      sort_by: z.enum(['updated_at', 'added_at', 'user_rating', 'title']).default('updated_at').describe('Sort field'),
      sort_order: z.enum(['asc', 'desc']).default('desc').describe('Sort direction'),
    },
    async (args) => {
      const res = await getWatchHistoryTool(db, userId, args);
      return formatMcpResponse(res);
    },
  );

  // ── 5. get_library_stats ────────────────────────────────────────────────────
  server.tool(
    'get_library_stats',
    'Calculate and return accurate library statistics: total tracked, completed, watching, plan to watch, dropped, on hold, movies count, TV count, and average rating.',
    {},
    async () => {
      const res = await getLibraryStatsTool(db, userId);
      return formatMcpResponse(res);
    },
  );

  // ── 6. get_favorites ────────────────────────────────────────────────────────
  server.tool(
    'get_favorites',
    'Retrieve the user\'s favorite movies and TV shows, and optionally favorite actors.',
    {
      include_actors: z.boolean().default(true).describe('Whether to also include favorite actors'),
      media_type: z.enum(['movie', 'tv']).optional().describe('Filter favorite titles by "movie" or "tv"'),
      limit: z.number().int().min(1).max(500).default(100).describe('Max favorites to return'),
    },
    async (args) => {
      const res = await getFavoritesTool(db, userId, args);
      return formatMcpResponse(res);
    },
  );

  // ── 7. get_viewing_progress ─────────────────────────────────────────────────
  server.tool(
    'get_viewing_progress',
    'Retrieve season and episode viewing progress for a TV show (or recent viewing activity across all shows).',
    {
      tv_id: z.number().int().optional().describe('TMDB ID of the TV series'),
    },
    async (args) => {
      const res = await getViewingProgressTool(db, userId, args);
      return formatMcpResponse(res);
    },
  );

  // ── 8. add_to_watchlist ─────────────────────────────────────────────────────
  server.tool(
    'add_to_watchlist',
    'Add a movie or TV series to the user\'s watchlist (status = "Plan to Watch"). Resolves TMDB metadata automatically if only the ID is provided.',
    {
      tmdb_id: z.number().int().describe('TMDB ID of the movie or TV show'),
      media_type: z.enum(['movie', 'tv']).describe('Media type: "movie" or "tv"'),
      title: z.string().optional().describe('Title name (optional, fetched from TMDB if omitted)'),
      poster_path: z.string().nullable().optional().describe('Poster path'),
      backdrop_path: z.string().nullable().optional().describe('Backdrop path'),
      vote_average: z.number().optional().describe('TMDB vote average'),
      release_date: z.string().nullable().optional().describe('Release date string'),
    },
    async (args) => {
      const res = await addToWatchlistTool(db, userId, args);
      return formatMcpResponse(res);
    },
  );

  // ── 9. remove_from_watchlist ────────────────────────────────────────────────
  server.tool(
    'remove_from_watchlist',
    'Remove a title from the user\'s watchlist or library. Specify by library item UUID or tmdb_id + media_type.',
    {
      id: z.string().uuid().optional().describe('Watchbox library item UUID'),
      tmdb_id: z.number().int().optional().describe('TMDB ID (alternative to id)'),
      media_type: z.enum(['movie', 'tv']).optional().describe('Required if using tmdb_id'),
    },
    async (args) => {
      const res = await removeFromWatchlistTool(db, userId, args);
      return formatMcpResponse(res);
    },
  );

  // ── 10. update_watch_status ─────────────────────────────────────────────────
  server.tool(
    'update_watch_status',
    'Update a title\'s watch status to "Watching", "Completed", "Plan to Watch", "On Hold", or "Dropped". Preserves your existing ratings, notes, and progress.',
    {
      id: z.string().uuid().optional().describe('Watchbox library item UUID'),
      tmdb_id: z.number().int().optional().describe('TMDB ID (alternative to id)'),
      media_type: z.enum(['movie', 'tv']).optional().describe('Required if using tmdb_id'),
      status: z.enum(LIBRARY_STATUSES).describe('Target status: Watching, Completed, Plan to Watch, On Hold, or Dropped'),
    },
    async (args) => {
      const res = await updateWatchStatusTool(db, userId, args);
      return formatMcpResponse(res);
    },
  );

  // ── 11. update_rating ───────────────────────────────────────────────────────
  server.tool(
    'update_rating',
    'Set or update the user\'s rating for a movie or TV show. Scale is 0.0 to 10.0 (supports decimals like 9.5). Pass null to clear rating.',
    {
      id: z.string().uuid().optional().describe('Watchbox library item UUID'),
      tmdb_id: z.number().int().optional().describe('TMDB ID (alternative to id)'),
      media_type: z.enum(['movie', 'tv']).optional().describe('Required if using tmdb_id'),
      rating: z.number().min(0).max(10).nullable().describe('Rating from 0 to 10, or null to clear'),
    },
    async (args) => {
      const res = await updateRatingTool(db, userId, args);
      return formatMcpResponse(res);
    },
  );

  // ── 12. update_notes ────────────────────────────────────────────────────────
  server.tool(
    'update_notes',
    'Create or update personal notes for a title in your Watchbox library. Pass null or empty string to clear notes.',
    {
      id: z.string().uuid().optional().describe('Watchbox library item UUID'),
      tmdb_id: z.number().int().optional().describe('TMDB ID (alternative to id)'),
      media_type: z.enum(['movie', 'tv']).optional().describe('Required if using tmdb_id'),
      notes: z.string().nullable().describe('Note text, or null to clear notes'),
    },
    async (args) => {
      const res = await updateNotesTool(db, userId, args);
      return formatMcpResponse(res);
    },
  );

  // ── 13. update_progress ─────────────────────────────────────────────────────
  server.tool(
    'update_progress',
    'Record episode playback progress for a series. Sets season, episode, playback position in seconds, duration, and watched state.',
    {
      tv_id: z.number().int().describe('TMDB TV show ID'),
      season_number: z.number().int().min(0).describe('Season number (e.g. 1)'),
      episode_number: z.number().int().min(1).describe('Episode number (e.g. 4)'),
      watched: z.boolean().optional().describe('Explicitly mark watched/unwatched (defaults to true if position >= 90% duration)'),
      position_secs: z.number().int().min(0).default(0).describe('Playback position in seconds'),
      duration_secs: z.number().int().min(0).default(0).describe('Total duration in seconds'),
    },
    async (args) => {
      const res = await updateProgressTool(db, userId, args);
      return formatMcpResponse(res);
    },
  );

  // ── 14. manage_favorites ────────────────────────────────────────────────────
  server.tool(
    'manage_favorites',
    'Add or remove a movie/TV series or an actor from your Watchbox favorites.',
    {
      action: z.enum(['add', 'remove']).describe('Action: "add" or "remove"'),
      // Title favorite fields
      tmdb_id: z.number().int().optional().describe('TMDB ID of movie/TV show'),
      media_type: z.enum(['movie', 'tv']).optional().describe('Required for title favorite ("movie" or "tv")'),
      title: z.string().optional().describe('Title name (optional, fetched if omitted)'),
      poster_path: z.string().nullable().optional().describe('Poster path'),
      backdrop_path: z.string().nullable().optional().describe('Backdrop path'),
      vote_average: z.number().optional().describe('TMDB vote average'),
      release_date: z.string().nullable().optional().describe('Release date string'),
      // Actor favorite fields
      person_id: z.number().int().optional().describe('TMDB person ID for favorite actor'),
      person_name: z.string().optional().describe('Actor name (required when adding actor)'),
      profile_path: z.string().nullable().optional().describe('Actor photo URL path'),
      known_for_department: z.string().nullable().optional().describe('Department (e.g. "Acting")'),
    },
    async (args) => {
      const res = await manageFavoritesTool(db, userId, args);
      return formatMcpResponse(res);
    },
  );

  // ── 15. add_to_library ──────────────────────────────────────────────────────
  server.tool(
    'add_to_library',
    'Add or update a movie/series in your library with a specific status ("Watching", "Completed", "Plan to Watch", "On Hold", "Dropped") and optional initial rating or note.',
    {
      tmdb_id: z.number().int().describe('TMDB ID'),
      media_type: z.enum(['movie', 'tv']).describe('"movie" or "tv"'),
      title: z.string().optional().describe('Title (fetched from TMDB if omitted)'),
      status: z.enum(LIBRARY_STATUSES).describe('Status: Watching, Completed, Plan to Watch, On Hold, Dropped'),
      user_rating: z.number().min(0).max(10).nullable().optional().describe('Optional initial rating (0-10)'),
      note: z.string().nullable().optional().describe('Optional initial note'),
      poster_path: z.string().nullable().optional().describe('Poster path'),
      backdrop_path: z.string().nullable().optional().describe('Backdrop path'),
      vote_average: z.number().optional().describe('TMDB vote average'),
      release_date: z.string().nullable().optional().describe('Release date string'),
    },
    async (args) => {
      const res = await addToLibraryTool(db, userId, args);
      return formatMcpResponse(res);
    },
  );

  // ── 16. get_my_profile ──────────────────────────────────────────────────────
  server.tool(
    'get_my_profile',
    'Get the authenticated user\'s Watchbox profile details (username, display name, avatar, bio).',
    {},
    async () => {
      const res = await getMyProfileTool(db, userId);
      return formatMcpResponse(res);
    },
  );

  return server;
}
