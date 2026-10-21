# Watchbox Model Context Protocol (MCP) Server Setup & Integration Guide

This guide details the architecture, configuration, tool interface, authentication, and client integration instructions for the **Watchbox MCP Server**.

---

## 1. Architecture Overview

Watchbox is a personal movie and TV tracking application. The Watchbox MCP server enables AI assistants (such as Claude Desktop, ChatGPT, Cursor, and custom agents) to securely query the user's library, discover unwatched content, update watch statuses, log ratings, record notes, and track viewing progress.

```
┌─────────────────┐       ┌─────────────────┐       ┌────────────────────────┐
│   AI Assistant   │ ----> │   MCP Client    │ ----> │ Watchbox MCP Endpoint  │
│ (Claude/ChatGPT)│       │ (Streamable HTTP│       │      (POST /mcp)       │
└─────────────────┘       └─────────────────┘       └───────────┬────────────┘
                                                                │
                                            ┌───────────────────┴───────────────────┐
                                            │ Authenticated User Token Verification │
                                            │  (Supabase Auth & OAuth 2.1 Metadata) │
                                            └───────────────────┬───────────────────┘
                                                                │
                                ┌───────────────────────────────┴───────────────────────────────┐
                                ▼                                                               ▼
                     ┌──────────────────────┐                                        ┌──────────────────────┐
                     │ Supabase PostgreSQL  │                                        │       TMDB API       │
                     │  (RLS: auth.uid())   │                                        │  (Metadata & Search) │
                     └──────────────────────┘                                        └──────────────────────┘
```

### Key Components

1. **Protocol Standard**: Model Context Protocol (MCP) implemented via the official `@modelcontextprotocol/sdk` (v1.32.1).
2. **Transport**: Streamable HTTP transport (`POST /mcp`) with standard JSON-RPC 2.0 framing, capability negotiation, and optional SSE fallback.
3. **Dual Deployment Support**:
   - **Integrated Production Server (`server/`)**: Runs directly within the Watchbox Node/Docker container alongside the frontend, serving SPA routes, OAuth discovery, and MCP endpoints simultaneously.
   - **Standalone Microservice (`mcp-server/`)**: Standalone lightweight Node server (`npx tsx mcp-server/index.ts`) for dedicated hosting or Edge proxy environments.
4. **Database & Isolation**:
   - Backed by Supabase PostgreSQL tables: `profiles`, `library_items`, `watchlist_items`, `favorite_items`, `actor_favorites`, and `episode_progress`.
   - **Zero Service-Role Usage**: The server never operates with administrative service-role keys. Requests execute with the user's verified bearer token and public anonymous key, ensuring that PostgreSQL Row Level Security (RLS) automatically confines data access to `auth.uid() = user_id`.
5. **Metadata Provider**: The Movie Database (TMDB) API for canonical movie/TV metadata, poster images, cast details, and genre mappings.

---

## 2. Environment Configuration

### Required Environment Variables

Configure the following variables in your environment or `.env` file:

| Variable | Description | Example / Default | Required |
| :--- | :--- | :--- | :--- |
| `SUPABASE_URL` / `MCP_SUPABASE_URL` | URL of the Supabase project containing Watchbox user data | `https://your-project.supabase.co` | **Yes** |
| `SUPABASE_ANON_KEY` / `MCP_SUPABASE_ANON_KEY` | Public anonymous Supabase key (RLS-enforced) | `eyJhbGciOi...` | **Yes** |
| `TMDB_API_KEY` | TMDB API v3 developer key for media lookups | `d4e5f6...` | **Yes** |
| `MCP_PUBLIC_URL` | Canonical public HTTPS origin of your deployment | `https://watchbox.yourdomain.com` | Production |
| `MCP_READ_CLIENT_IDS` | Comma-separated allowlist of OAuth client IDs for read access | `claude-desktop,chatgpt-mcp` | Recommended |
| `MCP_WRITE_CLIENT_IDS` | Comma-separated allowlist of OAuth client IDs for write access | `claude-desktop` | Recommended |
| `PORT` / `MCP_PORT` | Port for the HTTP MCP listener | `8787` (dev) / `3000` (prod) | Optional |
| `MCP_HOST` | Host binding interface | `127.0.0.1` (dev) / `0.0.0.0` (prod) | Optional |

> [!IMPORTANT]
> **Fail-Closed Security**: If `MCP_READ_CLIENT_IDS` is configured and an incoming request presents a `client_id` not present in that list, access is denied. Write tools (`add_to_watchlist`, `update_rating`, etc.) are hidden and rejected unless the client is explicitly listed in `MCP_WRITE_CLIENT_IDS`.

---

## 3. Tool Catalog

The server exposes 14 canonical tools matching the Watchbox data model, plus backwards-compatible `watchbox_*` aliases.

### Read Tools

#### 1. `search_titles`
Search the authenticated user's library by title, watch status, genre, release year, or rating range. Optionally query TMDB discover to find new titles.
- **Inputs**:
  - `query` *(string, optional)*: Partial title match (up to 120 chars).
  - `media_type` *(enum: `'movie' | 'tv'`, optional)*: Filter by content type.
  - `status` *(enum: `'Watching' | 'Completed' | 'Plan to Watch' | 'On Hold' | 'Dropped'`, optional)*: Filter by watch status.
  - `min_rating` *(number: 0–10, optional)*: Minimum user rating.
  - `max_rating` *(number: 0–10, optional)*: Maximum user rating.
  - `release_year` *(integer: 1900–2100, optional)*: Filter by release year.
  - `include_discover` *(boolean, default: `false`)*: Search TMDB simultaneously.
  - `limit` *(integer: 1–100, default: `50`)*: Maximum results.

#### 2. `get_title_details`
Retrieve complete information for a specific title, combining TMDB metadata with the authenticated user's library record, watchlist status, favorite state, and TV episode progress.
- **Inputs**:
  - `tmdb_id` *(integer, positive)*: TMDB ID of the title.
  - `media_type` *(enum: `'movie' | 'tv'`)*: Media classification.

#### 3. `get_watchlist`
Return the authenticated user's watchlist (`watchlist_items`).
- **Inputs**:
  - `media_type` *(enum: `'movie' | 'tv'`, optional)*: Filter by movie or TV.
  - `limit` *(integer: 1–100, default: `50`)*: Maximum results.

#### 4. `get_watch_history`
Retrieve completed, currently watching, dropped, or on-hold titles from the user's library.
- **Inputs**:
  - `status` *(enum: `'Completed' | 'Watching' | 'Dropped' | 'On Hold'`, optional)*: Filter by status.
  - `media_type` *(enum: `'movie' | 'tv'`, optional)*: Filter by media type.
  - `sort_by` *(enum: `'updated_at' | 'added_at' | 'user_rating' | 'title'`, default: `'updated_at'`)*: Sort field.
  - `limit` *(integer: 1–100, default: `50`)*: Maximum results.

#### 5. `get_library_stats`
Calculates accurate aggregate statistics directly from accessible database records.
- **Inputs**: None (`{}`).
- **Returns**: Total tracked titles, completed count, watching count, plan-to-watch count, dropped count, on-hold count, movie count, TV count, total favorites, favorite actors count, and average user rating.

#### 6. `get_favorites`
Retrieve the authenticated user's favorite titles (`favorite_items`) and favorite actors (`actor_favorites`).
- **Inputs**:
  - `media_type` *(enum: `'movie' | 'tv'`, optional)*: Filter favorite titles.
  - `include_actors` *(boolean, default: `true`)*: Whether to include favorite actors.
  - `limit` *(integer: 1–100, default: `50`)*: Maximum results.

#### 7. `get_viewing_progress`
Retrieve episode-by-episode viewing progress for a TV show or recent progress across all shows.
- **Inputs**:
  - `tv_id` *(integer, positive, optional)*: TMDB TV show ID.
  - `limit` *(integer: 1–100, default: `50`)*: Maximum results.

---

### Write Tools (Requires Write Client Authorization)

#### 8. `add_to_watchlist`
Add a movie or TV series to the user's watchlist.
- **Inputs**:
  - `tmdb_id` *(integer, positive)*: TMDB identifier.
  - `media_type` *(enum: `'movie' | 'tv'`)*: Media classification.
  - `title` *(string, 1–300 chars)*: Title string.
  - `poster_path` *(string, optional, nullable)*: TMDB poster path.
  - `vote_average` *(number: 0–10, optional)*: TMDB score.
  - `release_date` *(string, optional, nullable)*: Release date (`YYYY-MM-DD`).

#### 9. `remove_from_watchlist`
Remove a single title from the user's watchlist.
- **Inputs**:
  - `tmdb_id` *(integer, positive)*: TMDB identifier.
  - `media_type` *(enum: `'movie' | 'tv'`)*: Media classification.
  - `confirm_remove` *(literal `true`)*: Explicit confirmation required for destructive deletion.

#### 10. `update_watch_status`
Update a title's watch status in the library. Preserves existing ratings, notes, and progress.
- **Inputs**:
  - `tmdb_id` *(integer, positive)*: TMDB identifier.
  - `media_type` *(enum: `'movie' | 'tv'`)*: Media classification.
  - `status` *(enum: `'Watching' | 'Completed' | 'Plan to Watch' | 'On Hold' | 'Dropped'`)*: New watch status.

#### 11. `update_rating`
Set or update the user's personal rating for a title.
- **Inputs**:
  - `tmdb_id` *(integer, positive)*: TMDB identifier.
  - `media_type` *(enum: `'movie' | 'tv'`)*: Media classification.
  - `rating` *(number: 0–10 with at most 1 decimal place, nullable)*: Rating value, or `null` to clear.

#### 12. `update_notes`
Create, update, or clear personal notes for a title in the library.
- **Inputs**:
  - `tmdb_id` *(integer, positive)*: TMDB identifier.
  - `media_type` *(enum: `'movie' | 'tv'`)*: Media classification.
  - `notes` *(string up to 5000 chars, nullable)*: Note content, or `null` to clear.

#### 13. `update_progress`
Log episode viewing progress for a TV show.
- **Inputs**:
  - `tv_id` *(integer, positive)*: TMDB TV show ID.
  - `season_number` *(integer: 0–999)*: Season index.
  - `episode_number` *(integer: 0–9999)*: Episode index.
  - `watched` *(boolean, optional)*: Marked as completed.
  - `position_secs` *(integer: 0–86400000, optional)*: Current playback position.
  - `duration_secs` *(integer: 0–86400000, optional)*: Total runtime.

#### 14. `manage_favorites`
Add or remove a movie, TV show, or actor from favorites.
- **Inputs**:
  - `action` *(enum: `'add' | 'remove'`)*: Favorite operation.
  - `target_type` *(enum: `'title' | 'actor'`, default: `'title'`)*: Target category.
  - Title fields: `tmdb_id`, `media_type`, `title`, `poster_path`.
  - Actor fields: `person_id`, `person_name`, `profile_path`.

---

## 4. Authentication and Security

### 1. Token Verification & RLS
Every incoming MCP request must supply a valid Supabase JWT Bearer token:
```http
POST /mcp HTTP/1.1
Host: watchbox.example.com
Authorization: Bearer <SUPABASE_JWT_ACCESS_TOKEN>
Content-Type: application/json
```
The server validates the JWT using the Supabase project configuration:
- Rejects missing, expired, or malformed tokens with `401 Unauthorized` and `WWW-Authenticate: Bearer`.
- Derives the active user ID strictly from the verified token claims (`sub`).
- **Caller-Supplied User IDs Are Disallowed**: Arguments attempting to specify another `user_id` are rejected or overwritten with the token identity.
- Database operations run via `createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: 'Bearer ...' } } })`, which enforces Supabase Row Level Security at the database layer.

### 2. OAuth 2.1 Discovery & Protected Resource Metadata
The server publishes OAuth 2.1 discovery documents:
- `GET /.well-known/oauth-protected-resource/mcp`
- `GET /.well-known/oauth-authorization-server`
- Dynamic consent endpoint: `GET /oauth/consent`

---

## 5. Client Configuration Guides

### OpenCode

This repository includes a project-level [`opencode.json`](../opencode.json) that registers the local Watchbox MCP endpoint with OAuth. OpenCode uses its own OAuth callback listener, so the client must be registered in Supabase with the exact loopback redirect URI.

1. **Register the OpenCode client in Supabase**
   - Open the data-owning project in the Supabase Dashboard.
   - Go to **Authentication** > **OAuth Apps** > **Add a new client**.
   - **Client name**: `OpenCode`
   - **Client type**: `Public`
   - **Redirect URI**: `http://127.0.0.1:19876/callback` (exact match; no wildcards)
   - Create the client and copy its **Client ID** (a public client has no secret).
2. **Allow the client on the MCP server**
   - Set `WATCHBOX_MCP_CLIENT_ID=<client-id>` in the environment used to start the server (or in the ignored root `.env`).
   - For local development, `server/dev.ts` uses this value as `MCP_READ_CLIENT_IDS` when that variable is empty. If `MCP_READ_CLIENT_IDS` is already set, add the client ID to it manually.
   - To allow writes, also add the client ID to `MCP_WRITE_CLIENT_IDS`. Read-only is the default.
   - Restart `pnpm run dev:mcp` after changing the allowlist.
3. **Confirm the OpenCode client ID**
   - The project `opencode.json` already contains the registered client ID in `oauth.client_id`.
   - If you rotate or replace the client, update that value. To keep it out of the file, replace it with `{env:WATCHBOX_MCP_CLIENT_ID}` and set that variable in the environment that launches OpenCode (OpenCode does not read the project `.env`).
4. **Start the local services**
   ```powershell
   pnpm run dev:mcp
   ```
   In a second terminal, start the website so the `/oauth/consent` page is available:
   ```powershell
   pnpm run dev
   ```
   Confirm `http://127.0.0.1:8787/_app/health` returns `{"status":"ok","service":"watchbox","protocol":"mcp"}`. The Supabase **Site URL** must point at the local website origin (normally `http://127.0.0.1:5173`) while testing locally.
5. **Connect OpenCode**
   ```powershell
   opencode mcp list
   ```
   If the CLI is not on `PATH`, use the **OpenCode desktop app** and run `/mcps` instead. If the server shows `needs authentication`, select **watchbox** and complete the browser sign-in and consent flow. The server exposes its tools as `watchbox_*` once connected.
6. **Production**
   - Change `url` in `opencode.json` to the published HTTPS endpoint, for example `https://watchbox.example.com/mcp`.
   - Register the same loopback redirect URI on the production OAuth client and set `MCP_PUBLIC_URL` to the exact published origin.
   - Add the production client ID to the server's `MCP_READ_CLIENT_IDS` allowlist (and `MCP_WRITE_CLIENT_IDS` only when writes are intended).

Troubleshooting:

| Symptom | Cause / fix |
| :--- | :--- |
| `connection refused` | The local MCP service is not running. Start `pnpm run dev:mcp`. |
| `needs authentication` | Complete `/mcps` > **watchbox** > sign in. Ensure `oauth.client_id` in `opencode.json` matches the registered Supabase client. |
| `401 Unauthorized` | Token is missing/expired, or the token's `client_id` is not in `MCP_READ_CLIENT_IDS`. |
| `invalid_client` or consent shows the wrong app | The client ID does not match the Supabase OAuth client, or the redirect URI is not registered exactly as `http://127.0.0.1:19876/callback`. |
| Consent redirects to the wrong site | Check the Supabase **Site URL** and **Authorization Path** settings for the environment being used (see [mcp-server.md](mcp-server.md)). |
| `Failed to start server. Is port 19876 in use?` | A previous OAuth attempt still owns the callback listener. In `/mcps`, disconnect **watchbox** (or restart OpenCode) to release port 19876, then reconnect and complete sign-in once. Repeated retries reuse the same stuck listener. |

> [!IMPORTANT]
> The server fails closed. An empty `MCP_READ_CLIENT_IDS` denies every client, so OAuth sign-in alone is not enough until the OpenCode client ID is allow-listed. Do not use a service-role key for OpenCode or any other MCP client.

### Claude Desktop

Edit your `claude_desktop_config.json` (located at `%APPDATA%\Claude\claude_desktop_config.json` on Windows or `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "watchbox": {
      "command": "node",
      "args": ["c:/Users/Mursal Hayat/Desktop/Watchbox/dist-server/index.js"],
      "env": {
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_ANON_KEY": "eyJhbGciOi...",
        "TMDB_API_KEY": "your-tmdb-api-key",
        "MCP_READ_CLIENT_IDS": "claude-desktop",
        "MCP_WRITE_CLIENT_IDS": "claude-desktop"
      }
    }
  }
}
```

Or for remote HTTP connection:
```json
{
  "mcpServers": {
    "watchbox": {
      "url": "https://watchbox.yourdomain.com/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_SUPABASE_USER_TOKEN"
      }
    }
  }
}
```

### Cursor IDE

Create or update `.cursor/mcp.json` in your workspace:

```json
{
  "mcpServers": {
    "watchbox": {
      "url": "http://127.0.0.1:8787/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_SUPABASE_USER_TOKEN"
      }
    }
  }
}
```

### ChatGPT Integration

OpenAI deprecated legacy "ChatGPT Plugins" in 2024 and replaced them with **Custom GPT Actions** on the web, while introducing native **Model Context Protocol (MCP)** support in the **ChatGPT Desktop app**. Both connection methods are supported:

#### Method 1: ChatGPT Desktop App (Native MCP)
If you are using the ChatGPT Desktop application (macOS or Windows):
1. Open **ChatGPT Settings** (`Ctrl + ,` or `Cmd + ,`).
2. Navigate to **Developer** or **Connected Apps** -> **Model Context Protocol (MCP)**.
3. Click **Add Server**:
   - **Name**: `Watchbox`
   - **Transport**: `Streamable HTTP`
   - **URL**: `https://your-watchbox-domain.com/mcp` (or `http://127.0.0.1:8787/mcp` for local testing)
   - **Headers**: Add `Authorization: Bearer <YOUR_SUPABASE_JWT_ACCESS_TOKEN>`
4. Save and restart a chat session. ChatGPT will automatically discover all 14 tools and query your library.

#### Method 2: ChatGPT Web & Mobile via Custom GPT Action (Successor to Plugins)
To use Watchbox with ChatGPT on the web (chatgpt.com) or mobile app:
1. Go to [ChatGPT](https://chatgpt.com) -> In the left sidebar, click **Explore GPTs** -> Click **+ Create** (top right).
2. Under the **Configure** tab:
   - **Name**: `Watchbox Assistant`
   - **Description**: `AI assistant to manage and search your Watchbox movies, TV shows, and watchlists.`
   - **Instructions**:
     ```markdown
     You are the Watchbox Assistant. You help the user manage their movie and TV tracking library.
     - When the user asks about their watchlist or history, call the appropriate Watchbox action.
     - When adding or updating items, confirm the action and report updated ratings/progress clearly.
     - For destructive actions (e.g., removing a title), explicitly confirm with the user.
     ```
3. Scroll down to **Actions** and click **Create new action**.
4. **Authentication**:
   - Click the gear icon next to **Authentication**.
   - **Authentication Type**: Select **API Key**.
   - **Auth Type**: Select **Bearer**.
   - **API Key**: Paste your personal Supabase access token (JWT).
5. **Schema**:
   - Either click **Import from URL** and enter:
     `https://your-watchbox-domain.com/api/openapi.json`
   - Or open [`docs/chatgpt-actions-openapi.json`](docs/chatgpt-actions-openapi.json), copy the entire JSON content, and paste it directly into the **Schema** box.
   - *Note: Replace `https://your-watchbox-url.com` in the `servers` block with your actual deployment URL or ngrok tunnel.*
6. **Privacy Policy**: Enter `https://your-watchbox-domain.com/privacy` or your project URL.
7. Click **Save / Update** (top right) to publish the GPT for yourself or your team.

---

### MCP Inspector (Debugging)

To interactively test and debug tools with the official MCP Inspector:

1. Start the Watchbox MCP server:
   ```bash
   pnpm run dev:mcp
   ```
2. In a separate terminal, launch the Inspector:
   ```bash
   npx @modelcontextprotocol/inspector
   ```
3. In the Inspector UI:
   - **Transport Type**: Select `Streamable HTTP` (or `SSE`).
   - **URL**: `http://127.0.0.1:8787/mcp`
   - **Headers**: Add `Authorization: Bearer <YOUR_SUPABASE_JWT>`
   - Click **Connect** to inspect all tools, schemas, and live responses.

---

## 6. Testing & Quality Assurance

The test suite validates protocol compliance, authentication boundaries, tool schemas, and data isolation without modifying live user records:

```bash
# Run MCP automated test suite (25 tests covering all 14 canonical tools)
pnpm run test:mcp

# Build server TypeScript bundle
pnpm run build:server

# Build production frontend bundle
pnpm run build
```

### Test Coverage Highlights
- **100% of Canonical Tools Tested**: All 14 tools verified for correct argument validation, repository invocation, and output serialization.
- **Identity Isolation**: Verifies that User A cannot read or write data for User B even if User B's ID is explicitly passed in tool arguments.
- **Scope Enforcement**: Verifies that read-only clients cannot access write tools (`add_to_watchlist`, `update_rating`, etc.).
- **Validation Rules**: Verifies bounds checking (ratings must be 0–10 with max 1 decimal place; removal requires explicit confirmation).
- **Transport & Errors**: Verifies 401 on missing tokens, 400 on malformed JSON, and 405 on unsupported HTTP methods.
