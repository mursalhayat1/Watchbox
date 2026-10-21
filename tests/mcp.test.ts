import { createServer } from 'node:http';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { AuthenticationError, type AuthenticatedMcpUser } from '../server/auth.js';
import { loadConfig } from '../server/config.js';
import { createWatchboxHttpServer, handleMcpPost } from '../server/http.js';
import type { WatchboxRepository } from '../server/repository.js';

const config = loadConfig({
  NODE_ENV: 'test',
  PORT: '8787',
  SUPABASE_URL: 'https://watchbox-fixture.supabase.co',
  SUPABASE_ANON_KEY: 'fixture-anon-key',
  MCP_PUBLIC_URL: 'https://watchbox.example.test',
  MCP_READ_CLIENT_IDS: 'reader-client,writer-client',
  MCP_WRITE_CLIENT_IDS: 'writer-client',
});

const repository = {
  listLibrary: vi.fn(async (userId: string, filters: unknown) => [{ user_id: userId, filters }]),
  searchLibrary: vi.fn(async (userId: string, query: string, filters: unknown) => [{ user_id: userId, query, filters }]),
  listWatchlist: vi.fn(async (userId: string) => [{ user_id: userId }]),
  listFavorites: vi.fn(async (userId: string) => [{ user_id: userId }]),
  listActorFavorites: vi.fn(async (userId: string) => [{ user_id: userId, actor: 'Song Kang-ho' }]),
  getStatistics: vi.fn(async (userId: string) => ({ user_id: userId, total: 42, completed: 15 })),
  listEpisodeProgress: vi.fn(async (userId: string, tvId?: number) => [{ user_id: userId, tv_id: tvId, episode_number: 1 }]),
  getTitleDetails: vi.fn(async (userId: string, tmdbId: number, mediaType: string) => ({
    library_item: { user_id: userId, tmdb_id: tmdbId, media_type: mediaType, status: 'Watching' },
    is_watchlist: false,
    is_favorite: true,
    episode_progress: [],
  })),
  addToWatchlist: vi.fn(async (userId: string, item: unknown) => ({ user_id: userId, item })),
  removeFromWatchlist: vi.fn(async (userId: string, tmdbId: number, mediaType: string) => ({ user_id: userId, tmdb_id: tmdbId, media_type: mediaType })),
  addToLibrary: vi.fn(async (userId: string, item: unknown) => ({ user_id: userId, item })),
  updateLibraryItem: vi.fn(async (userId: string, tmdbId: number, mediaType: string, updates: unknown) => ({ user_id: userId, tmdb_id: tmdbId, media_type: mediaType, updates })),
  updateEpisodeProgress: vi.fn(async (userId: string, progress: unknown) => ({ user_id: userId, progress })),
  addFavoriteTitle: vi.fn(async (userId: string, item: unknown) => ({ user_id: userId, item })),
  removeFavoriteTitle: vi.fn(async (userId: string, tmdbId: number, mediaType: string) => ({ removed: true, tmdb_id: tmdbId, media_type: mediaType })),
  addFavoriteActor: vi.fn(async (userId: string, item: unknown) => ({ user_id: userId, item })),
  removeFavoriteActor: vi.fn(async (userId: string, personId: number) => ({ removed: true, person_id: personId })),
  listTrackedTitles: vi.fn(async () => []),
  topRatedTvItems: vi.fn(async () => []),
};

const server = createWatchboxHttpServer({
  config,
  authenticate: async (authorization) => {
    const token = typeof authorization === 'string' ? authorization.replace(/^Bearer\s+/i, '') : '';
    const users: Record<string, { userId: string; clientId: string }> = {
      'user-a-token': { userId: 'fixture-user-a', clientId: 'reader-client' },
      'writer-token': { userId: 'fixture-user-a', clientId: 'writer-client' },
      'user-b-token': { userId: 'fixture-user-b', clientId: 'reader-client' },
    };
    const identity = users[token];
    if (!identity) throw new AuthenticationError();
    const auth: AuthenticatedMcpUser = {
      ...identity,
      scopes: ['openid', 'profile', 'email'],
      user: { id: identity.userId } as User,
    };
    return { auth, supabase: {} as SupabaseClient };
  },
  createRepository: () => repository as unknown as WatchboxRepository,
  fetcher: async () => new Response(JSON.stringify({ results: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } }),
});

let baseUrl = '';

async function connectClient(token: string) {
  const client = new Client({ name: 'watchbox-protocol-fixture', version: '1.0.0' });
  const transport = new StreamableHTTPClientTransport(new URL(`${baseUrl}/mcp`), {
    requestInit: { headers: { Authorization: `Bearer ${token}` } },
  });
  await client.connect(transport);
  return client;
}

beforeAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      server.off('error', reject);
      const address = server.address();
      if (!address || typeof address === 'string') return reject(new Error('Could not start MCP test server.'));
      baseUrl = `http://127.0.0.1:${address.port}`;
      resolve();
    });
  });
});

beforeEach(() => vi.clearAllMocks());

afterAll(async () => {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

describe('Watchbox Streamable HTTP MCP server', () => {
  it('initializes through the official SDK client and discovers authenticated-user tools', async () => {
    const client = await connectClient('user-a-token');
    try {
      const tools = await client.listTools();
      expect(tools.tools.map((tool) => tool.name)).toContain('watchbox_list_library');
      expect(tools.tools.map((tool) => tool.name)).not.toContain('watchbox_update_library_item');
    } finally {
      await client.close();
    }
  });

  it("returns library results scoped to the verified user's identity", async () => {
    const client = await connectClient('user-a-token');
    try {
      const result = await client.callTool({ name: 'watchbox_list_library', arguments: { limit: 5 } });
      expect(result.isError).not.toBe(true);
      expect(repository.listLibrary).toHaveBeenCalledWith('fixture-user-a', expect.objectContaining({ limit: 5 }));
      expect(JSON.stringify(result)).toContain('fixture-user-a');
    } finally {
      await client.close();
    }
  });

  it('never exposes write tools to a read-only OAuth client', async () => {
    const client = await connectClient('user-a-token');
    try {
      const tools = await client.listTools();
      expect(tools.tools.some((tool) => tool.name.startsWith('watchbox_update_'))).toBe(false);
      expect(tools.tools.some((tool) => tool.name === 'watchbox_add_to_watchlist')).toBe(false);
    } finally {
      await client.close();
    }
  });

  it('allows a write-enabled client to update only the identity bound to its verified token', async () => {
    const client = await connectClient('writer-token');
    try {
      const tools = await client.listTools();
      expect(tools.tools.map((tool) => tool.name)).toContain('watchbox_update_library_item');
      const result = await client.callTool({
        name: 'watchbox_update_library_item',
        arguments: { tmdb_id: 42, media_type: 'movie', user_rating: 9.5 },
      });
      expect(result.isError).not.toBe(true);
      expect(repository.updateLibraryItem).toHaveBeenCalledWith('fixture-user-a', 42, 'movie', { user_rating: 9.5 });
    } finally {
      await client.close();
    }
  });

  it('does not let a caller-supplied user ID override the verified account identity', async () => {
    const client = await connectClient('user-b-token');
    try {
      const result = await client.callTool({ name: 'watchbox_list_library', arguments: { limit: 3, user_id: 'fixture-user-a' } });
      expect(JSON.stringify(result)).toContain('fixture-user-b');
      expect(repository.listLibrary).toHaveBeenCalledWith('fixture-user-b', expect.objectContaining({ limit: 3 }));
      expect(repository.listLibrary).not.toHaveBeenCalledWith('fixture-user-a', expect.anything());
    } finally {
      await client.close();
    }
  });

  it('scopes Watchlist reads to the authenticated account rather than a device session', async () => {
    const client = await connectClient('user-b-token');
    try {
      const result = await client.callTool({ name: 'watchbox_list_watchlist', arguments: { limit: 10 } });
      expect(JSON.stringify(result)).toContain('fixture-user-b');
      expect(repository.listWatchlist).toHaveBeenCalledWith('fixture-user-b', undefined, 10);
    } finally {
      await client.close();
    }
  });

  it('rejects invalid tool arguments before repository access', async () => {
    const client = await connectClient('user-a-token');
    let rejected = false;
    try {
      const result = await client.callTool({ name: 'watchbox_list_library', arguments: { limit: 0 } });
      rejected = result.isError === true;
    } catch (error) {
      rejected = error instanceof Error;
    } finally {
      await client.close();
    }
    expect(rejected).toBe(true);
    expect(repository.listLibrary).not.toHaveBeenCalled();
  });

  it('requires explicit confirmation before removing one Watchlist title', async () => {
    const client = await connectClient('writer-token');
    let rejected = false;
    try {
      const result = await client.callTool({ name: 'watchbox_remove_from_watchlist', arguments: { tmdb_id: 7, media_type: 'movie' } });
      rejected = result.isError === true;
    } catch (error) {
      rejected = error instanceof Error;
    } finally {
      await client.close();
    }
    expect(rejected).toBe(true);
    expect(repository.removeFromWatchlist).not.toHaveBeenCalled();
  });

  it('rejects missing and invalid credentials before creating data access', async () => {
    for (const authorization of [undefined, 'Bearer revoked-token']) {
      const response = await fetch(`${baseUrl}/mcp`, {
        method: 'POST',
        headers: { ...(authorization ? { Authorization: authorization } : {}), 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'fixture', version: '1.0' } } }),
      });
      expect(response.status).toBe(401);
      expect(response.headers.get('www-authenticate')).toContain('Bearer');
    }
  });

  it('uses a pre-parsed MCP body without reading the request stream', async () => {
    const body = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2025-03-26',
        capabilities: {},
        clientInfo: { name: 'preparsed-fixture', version: '1.0.0' },
      },
    };
    const authenticate = async (authorization: string | string[] | undefined) => {
      const token = typeof authorization === 'string' ? authorization.replace(/^Bearer\s+/i, '') : '';
      if (token !== 'user-a-token') throw new AuthenticationError();
      const auth: AuthenticatedMcpUser = {
        userId: 'fixture-user-a',
        clientId: 'reader-client',
        scopes: ['openid', 'profile', 'email'],
        user: { id: 'fixture-user-a' } as User,
      };
      return { auth, supabase: {} as SupabaseClient };
    };
    const adapter = createServer((request, response) => {
      void handleMcpPost(request, response, {
        config,
        authenticate,
        createRepository: () => repository as unknown as WatchboxRepository,
      }, body);
    });
    await new Promise<void>((resolve, reject) => {
      adapter.once('error', reject);
      adapter.listen(0, '127.0.0.1', resolve);
    });
    const address = adapter.address();
    if (!address || typeof address === 'string') throw new Error('Could not start adapter test server.');
    try {
      const response = await fetch(`http://127.0.0.1:${address.port}/mcp`, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer user-a-token',
          'Content-Type': 'application/json',
          Accept: 'application/json, text/event-stream',
        },
        body: '{',
      });
      expect(response.status).toBe(200);
      expect(await response.text()).toContain('serverInfo');
    } finally {
      await new Promise<void>((resolve, reject) => adapter.close((error) => error ? reject(error) : resolve()));
    }
  });

  it('returns safe HTTP errors for malformed JSON and unsupported methods', async () => {
    const malformed = await fetch(`${baseUrl}/mcp`, {
      method: 'POST',
      headers: { Authorization: 'Bearer user-a-token', 'Content-Type': 'application/json' },
      body: '{',
    });
    expect(malformed.status).toBe(400);
    expect(await malformed.json()).toMatchObject({ error: 'MCP request body is not valid JSON.' });

    const unsupported = await fetch(`${baseUrl}/mcp`, { method: 'GET' });
    expect(unsupported.status).toBe(405);
    expect(unsupported.headers.get('allow')).toContain('POST');
  });

  describe('Canonical Section 6 MCP Tools', () => {
    it('executes search_titles with library filters', async () => {
      const client = await connectClient('user-a-token');
      try {
        const result = await client.callTool({
          name: 'search_titles',
          arguments: { query: 'Thriller', media_type: 'movie', status: 'Completed', min_rating: 8, release_year: 2023, limit: 10 },
        });
        expect(result.isError).not.toBe(true);
        expect(repository.searchLibrary).toHaveBeenCalledWith('fixture-user-a', 'Thriller', {
          mediaType: 'movie',
          status: 'Completed',
          minRating: 8,
          maxRating: undefined,
          releaseYear: 2023,
          limit: 10,
        });
      } finally {
        await client.close();
      }
    });

    it('executes get_title_details returning unified metadata and user state', async () => {
      const client = await connectClient('user-a-token');
      try {
        const result = await client.callTool({
          name: 'get_title_details',
          arguments: { tmdb_id: 496243, media_type: 'movie' },
        });
        expect(result.isError).not.toBe(true);
        expect(repository.getTitleDetails).toHaveBeenCalledWith('fixture-user-a', 496243, 'movie');
        const text = JSON.stringify(result);
        expect(text).toContain('in_favorites');
        expect(text).toContain('user_library_entry');
      } finally {
        await client.close();
      }
    });

    it('executes get_watchlist with media_type filter', async () => {
      const client = await connectClient('user-a-token');
      try {
        const result = await client.callTool({
          name: 'get_watchlist',
          arguments: { media_type: 'tv', limit: 25 },
        });
        expect(result.isError).not.toBe(true);
        expect(repository.listWatchlist).toHaveBeenCalledWith('fixture-user-a', 'tv', 25);
      } finally {
        await client.close();
      }
    });

    it('executes get_watch_history with status filter and sorting', async () => {
      const client = await connectClient('user-a-token');
      try {
        const result = await client.callTool({
          name: 'get_watch_history',
          arguments: { status: 'Completed', media_type: 'movie', sort_by: 'user_rating', limit: 15 },
        });
        expect(result.isError).not.toBe(true);
        expect(repository.listLibrary).toHaveBeenCalledWith('fixture-user-a', {
          mediaType: 'movie',
          status: 'Completed',
          sortBy: 'user_rating',
          limit: 15,
        });
      } finally {
        await client.close();
      }
    });

    it('executes get_library_stats with accurate user aggregates', async () => {
      const client = await connectClient('user-a-token');
      try {
        const result = await client.callTool({
          name: 'get_library_stats',
          arguments: {},
        });
        expect(result.isError).not.toBe(true);
        expect(repository.getStatistics).toHaveBeenCalledWith('fixture-user-a');
        expect(JSON.stringify(result)).toContain('42');
      } finally {
        await client.close();
      }
    });

    it('executes get_favorites with actor favorites inclusion', async () => {
      const client = await connectClient('user-a-token');
      try {
        const result = await client.callTool({
          name: 'get_favorites',
          arguments: { media_type: 'movie', include_actors: true, limit: 20 },
        });
        expect(result.isError).not.toBe(true);
        expect(repository.listFavorites).toHaveBeenCalledWith('fixture-user-a', 'movie', 20);
        expect(repository.listActorFavorites).toHaveBeenCalledWith('fixture-user-a', 20);
        expect(JSON.stringify(result)).toContain('favorite_actors');
      } finally {
        await client.close();
      }
    });

    it('executes get_viewing_progress for a specific TV show', async () => {
      const client = await connectClient('user-a-token');
      try {
        const result = await client.callTool({
          name: 'get_viewing_progress',
          arguments: { tv_id: 1399, limit: 50 },
        });
        expect(result.isError).not.toBe(true);
        expect(repository.listEpisodeProgress).toHaveBeenCalledWith('fixture-user-a', 1399, 50);
      } finally {
        await client.close();
      }
    });

    it('allows write client to call add_to_watchlist and verifies write payload', async () => {
      const client = await connectClient('writer-token');
      try {
        const result = await client.callTool({
          name: 'add_to_watchlist',
          arguments: {
            tmdb_id: 496243,
            media_type: 'movie',
            title: 'Parasite',
            poster_path: '/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
            vote_average: 8.5,
            release_date: '2019-05-30',
          },
        });
        expect(result.isError).not.toBe(true);
        expect(repository.addToWatchlist).toHaveBeenCalledWith('fixture-user-a', expect.objectContaining({
          tmdb_id: 496243,
          media_type: 'movie',
          title: 'Parasite',
        }));
      } finally {
        await client.close();
      }
    });

    it('allows write client to call remove_from_watchlist when confirmed', async () => {
      const client = await connectClient('writer-token');
      try {
        const result = await client.callTool({
          name: 'remove_from_watchlist',
          arguments: { tmdb_id: 496243, media_type: 'movie', confirm_remove: true },
        });
        expect(result.isError).not.toBe(true);
        expect(repository.removeFromWatchlist).toHaveBeenCalledWith('fixture-user-a', 496243, 'movie');
      } finally {
        await client.close();
      }
    });

    it('allows write client to call update_watch_status', async () => {
      const client = await connectClient('writer-token');
      try {
        const result = await client.callTool({
          name: 'update_watch_status',
          arguments: { tmdb_id: 496243, media_type: 'movie', status: 'Completed' },
        });
        expect(result.isError).not.toBe(true);
        expect(repository.updateLibraryItem).toHaveBeenCalledWith('fixture-user-a', 496243, 'movie', { status: 'Completed' });
      } finally {
        await client.close();
      }
    });

    it('allows write client to call update_rating and enforces rating validation', async () => {
      const client = await connectClient('writer-token');
      try {
        // Valid rating
        const result = await client.callTool({
          name: 'update_rating',
          arguments: { tmdb_id: 496243, media_type: 'movie', rating: 9.5 },
        });
        expect(result.isError).not.toBe(true);
        expect(repository.updateLibraryItem).toHaveBeenCalledWith('fixture-user-a', 496243, 'movie', { user_rating: 9.5 });

        // Invalid rating (> 10)
        const invalidResult = await client.callTool({
          name: 'update_rating',
          arguments: { tmdb_id: 496243, media_type: 'movie', rating: 10.5 },
        });
        expect(invalidResult.isError).toBe(true);

        // Invalid precision (> 1 decimal place)
        const invalidPrecision = await client.callTool({
          name: 'update_rating',
          arguments: { tmdb_id: 496243, media_type: 'movie', rating: 8.55 },
        });
        expect(invalidPrecision.isError).toBe(true);
      } finally {
        await client.close();
      }
    });

    it('allows write client to call update_notes and clears notes when null', async () => {
      const client = await connectClient('writer-token');
      try {
        const result = await client.callTool({
          name: 'update_notes',
          arguments: { tmdb_id: 496243, media_type: 'movie', notes: 'Masterpiece cinema.' },
        });
        expect(result.isError).not.toBe(true);
        expect(repository.updateLibraryItem).toHaveBeenCalledWith('fixture-user-a', 496243, 'movie', { note: 'Masterpiece cinema.' });

        const clearResult = await client.callTool({
          name: 'update_notes',
          arguments: { tmdb_id: 496243, media_type: 'movie', notes: null },
        });
        expect(clearResult.isError).not.toBe(true);
        expect(repository.updateLibraryItem).toHaveBeenCalledWith('fixture-user-a', 496243, 'movie', { note: null });
      } finally {
        await client.close();
      }
    });

    it('allows write client to call update_progress for an episode', async () => {
      const client = await connectClient('writer-token');
      try {
        const result = await client.callTool({
          name: 'update_progress',
          arguments: {
            tv_id: 1399,
            season_number: 1,
            episode_number: 1,
            position_secs: 3200,
            duration_secs: 3600,
            watched: true,
          },
        });
        expect(result.isError).not.toBe(true);
        expect(repository.updateEpisodeProgress).toHaveBeenCalledWith('fixture-user-a', expect.objectContaining({
          tv_id: 1399,
          season_number: 1,
          episode_number: 1,
          watched: true,
        }));
      } finally {
        await client.close();
      }
    });

    it('allows write client to manage title and actor favorites', async () => {
      const client = await connectClient('writer-token');
      try {
        // Add title favorite
        const addTitle = await client.callTool({
          name: 'manage_favorites',
          arguments: {
            action: 'add',
            target_type: 'title',
            tmdb_id: 496243,
            media_type: 'movie',
            title: 'Parasite',
          },
        });
        expect(addTitle.isError).not.toBe(true);
        expect(repository.addFavoriteTitle).toHaveBeenCalledWith('fixture-user-a', expect.objectContaining({
          tmdb_id: 496243,
          media_type: 'movie',
        }));

        // Add actor favorite
        const addActor = await client.callTool({
          name: 'manage_favorites',
          arguments: {
            action: 'add',
            target_type: 'actor',
            person_id: 20738,
            person_name: 'Song Kang-ho',
          },
        });
        expect(addActor.isError).not.toBe(true);
        expect(repository.addFavoriteActor).toHaveBeenCalledWith('fixture-user-a', expect.objectContaining({
          person_id: 20738,
          name: 'Song Kang-ho',
        }));

        // Remove actor favorite
        const removeActor = await client.callTool({
          name: 'manage_favorites',
          arguments: {
            action: 'remove',
            target_type: 'actor',
            person_id: 20738,
          },
        });
        expect(removeActor.isError).not.toBe(true);
        expect(repository.removeFavoriteActor).toHaveBeenCalledWith('fixture-user-a', 20738);
      } finally {
        await client.close();
      }
    });

    it('prevents read-only client from accessing canonical write tools', async () => {
      const client = await connectClient('user-a-token');
      try {
        const tools = await client.listTools();
        const toolNames = tools.tools.map((t) => t.name);
        expect(toolNames).not.toContain('add_to_watchlist');
        expect(toolNames).not.toContain('remove_from_watchlist');
        expect(toolNames).not.toContain('update_watch_status');
        expect(toolNames).not.toContain('update_rating');
        expect(toolNames).not.toContain('update_notes');
        expect(toolNames).not.toContain('update_progress');
        expect(toolNames).not.toContain('manage_favorites');
      } finally {
        await client.close();
      }
    });

    it('serves OpenAPI 3.1.0 specification for ChatGPT Actions at /api/openapi.json', async () => {
      const response = await fetch(`${baseUrl}/api/openapi.json`);
      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('application/json');
      const data = await response.json() as Record<string, unknown>;
      expect(data.openapi).toBe('3.1.0');
      expect((data.info as Record<string, unknown>).title).toContain('Watchbox');
      expect((data.paths as Record<string, unknown>)['/api/actions/get_watchlist']).toBeDefined();
    });

    it('executes tools via REST action bridge at /api/actions/:toolName for ChatGPT', async () => {
      const response = await fetch(`${baseUrl}/api/actions/get_watchlist`, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer user-a-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ limit: 10 }),
      });
      expect(response.status).toBe(200);
      const json = await response.json() as Record<string, unknown>;
      expect(json.ok).toBe(true);
      expect(repository.listWatchlist).toHaveBeenCalledWith('fixture-user-a', undefined, 10);
    });
  });
});
