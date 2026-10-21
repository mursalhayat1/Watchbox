#!/usr/bin/env node
/**
 * Watchbox Production MCP Server
 *
 * Implements the Model Context Protocol (MCP) over Streamable HTTP and SSE transports.
 * Connects AI assistants (ChatGPT, Claude, Cursor, etc.) directly to the user's Watchbox database.
 * Enforces per-user authentication and database Row Level Security (RLS).
 */

import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { randomUUID } from 'node:crypto';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { validateBearerToken, createUserSupabaseClient, getSupabaseUrl } from './auth.js';
import { createWatchboxMcpServer } from './server.js';

// ── Environment variable loader ───────────────────────────────────────────────
try {
  const { readFileSync } = await import('node:fs');
  const envContent = readFileSync(new URL('../.env', import.meta.url), 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
} catch {
  // .env file is optional if env vars are passed directly
}

// ── Configuration ─────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.MCP_PORT || '3001', 10);
const HOST = process.env.MCP_HOST || '0.0.0.0';
const MAX_REQUEST_SIZE = 2 * 1024 * 1024; // 2MB

// ── Session stores ────────────────────────────────────────────────────────────
interface StreamableSession {
  transport: StreamableHTTPServerTransport;
  userId: string;
  createdAt: number;
  lastActive: number;
}

interface SseSession {
  transport: SSEServerTransport;
  userId: string;
  createdAt: number;
  lastActive: number;
}

const streamableSessions = new Map<string, StreamableSession>();
const sseSessions = new Map<string, SseSession>();

// Cleanup inactive sessions every minute (TTL: 30 minutes)
const SESSION_TTL_MS = 30 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of streamableSessions) {
    if (now - session.lastActive > SESSION_TTL_MS) {
      session.transport.close().catch(() => {});
      streamableSessions.delete(id);
    }
  }
  for (const [id, session] of sseSessions) {
    if (now - session.lastActive > SESSION_TTL_MS) {
      session.transport.close().catch(() => {});
      sseSessions.delete(id);
    }
  }
}, 60_000);

// ── CORS Headers ──────────────────────────────────────────────────────────────
const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type, Accept, Mcp-Session-Id, X-Requested-With',
  'Access-Control-Expose-Headers': 'Mcp-Session-Id',
};

function applyCors(res: ServerResponse) {
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    res.setHeader(key, value);
  }
}

function sendJson(res: ServerResponse, status: number, data: unknown) {
  applyCors(res);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// ── Request authentication helper ─────────────────────────────────────────────
async function authenticateRequest(req: IncomingMessage) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.slice(7).trim();
  if (!token) return null;
  return validateBearerToken(token);
}

// ── HTTP Request Handler ──────────────────────────────────────────────────────
const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  const correlationId = randomUUID().slice(0, 8);
  const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  try {
    // 1. CORS Preflight
    if (req.method === 'OPTIONS') {
      applyCors(res);
      res.writeHead(204);
      res.end();
      return;
    }

    // 2. Health check
    if (pathname === '/health' && req.method === 'GET') {
      sendJson(res, 200, {
        status: 'healthy',
        service: 'watchbox-mcp',
        version: '1.0.0',
        active_streamable_sessions: streamableSessions.size,
        active_sse_sessions: sseSessions.size,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // 3. OAuth 2.1 Metadata endpoints for ChatGPT / Claude
    if (pathname === '/.well-known/oauth-authorization-server' && req.method === 'GET') {
      const publicBase = `http://${req.headers.host || 'localhost:3001'}`;
      sendJson(res, 200, {
        issuer: publicBase,
        authorization_endpoint: `${publicBase}/oauth/authorize`,
        token_endpoint: `${publicBase}/oauth/token`,
        response_types_supported: ['code'],
        grant_types_supported: ['authorization_code'],
        token_endpoint_auth_methods_supported: ['none', 'client_secret_post'],
        scopes_supported: ['read', 'write'],
        code_challenge_methods_supported: ['S256'],
      });
      return;
    }

    if (pathname === '/.well-known/oauth-protected-resource' && req.method === 'GET') {
      const publicBase = `http://${req.headers.host || 'localhost:3001'}`;
      sendJson(res, 200, {
        resource: `${publicBase}/mcp`,
        authorization_servers: [publicBase],
        scopes_supported: ['read', 'write'],
        bearer_methods_supported: ['header'],
      });
      return;
    }

    // 4. Streamable HTTP Transport (/mcp)
    if (pathname === '/mcp') {
      const authUser = await authenticateRequest(req);
      if (!authUser) {
        applyCors(res);
        res.writeHead(401, {
          'Content-Type': 'application/json',
          'WWW-Authenticate': 'Bearer realm="watchbox-mcp"',
        });
        res.end(
          JSON.stringify({
            error: 'unauthorized',
            message: 'Missing or invalid Bearer token. Please provide your Watchbox/Supabase access token.',
          }),
        );
        return;
      }

      const sessionId = req.headers['mcp-session-id'] as string | undefined;

      // Existing Streamable HTTP session
      if (sessionId && streamableSessions.has(sessionId)) {
        const session = streamableSessions.get(sessionId)!;
        if (session.userId !== authUser.id) {
          sendJson(res, 403, { error: 'forbidden', message: 'Session is bound to a different user identity.' });
          return;
        }
        session.lastActive = Date.now();
        applyCors(res);
        await session.transport.handleRequest(req, res);
        return;
      }

      // New Streamable HTTP session (POST only)
      if (req.method === 'POST') {
        const userDb = createUserSupabaseClient(authUser.token);
        const mcpServer = createWatchboxMcpServer(authUser.id, userDb);

        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
        });

        transport.onclose = () => {
          const sid = transport.sessionId;
          if (sid) streamableSessions.delete(sid);
        };

        await mcpServer.connect(transport);
        applyCors(res);
        await transport.handleRequest(req, res);

        const newSid = transport.sessionId;
        if (newSid) {
          streamableSessions.set(newSid, {
            transport,
            userId: authUser.id,
            createdAt: Date.now(),
            lastActive: Date.now(),
          });
        }
        return;
      }

      if (req.method === 'GET' || req.method === 'DELETE') {
        sendJson(res, 400, { error: 'bad_request', message: 'Invalid or missing Mcp-Session-Id header.' });
        return;
      }

      sendJson(res, 405, { error: 'method_not_allowed' });
      return;
    }

    // 5. SSE Transport (/sse and /messages)
    if (pathname === '/sse' && req.method === 'GET') {
      const authUser = await authenticateRequest(req);
      if (!authUser) {
        applyCors(res);
        res.writeHead(401, {
          'Content-Type': 'application/json',
          'WWW-Authenticate': 'Bearer realm="watchbox-mcp"',
        });
        res.end(JSON.stringify({ error: 'unauthorized', message: 'Bearer token required for SSE stream.' }));
        return;
      }

      const userDb = createUserSupabaseClient(authUser.token);
      const mcpServer = createWatchboxMcpServer(authUser.id, userDb);

      const sseTransport = new SSEServerTransport('/messages', res);
      const sseId = sseTransport.sessionId;

      sseSessions.set(sseId, {
        transport: sseTransport,
        userId: authUser.id,
        createdAt: Date.now(),
        lastActive: Date.now(),
      });

      sseTransport.onclose = () => {
        sseSessions.delete(sseId);
      };

      await mcpServer.connect(sseTransport);
      await sseTransport.start();
      return;
    }

    if (pathname === '/messages' && req.method === 'POST') {
      const sessionId = parsedUrl.searchParams.get('sessionId');
      if (!sessionId || !sseSessions.has(sessionId)) {
        sendJson(res, 404, { error: 'session_not_found', message: 'SSE session not found or expired.' });
        return;
      }

      const session = sseSessions.get(sessionId)!;
      session.lastActive = Date.now();
      applyCors(res);
      await session.transport.handlePostMessage(req, res);
      return;
    }

    // 404 Fallback
    sendJson(res, 404, {
      error: 'not_found',
      message: 'Watchbox MCP endpoint is available at /mcp (Streamable HTTP) or /sse (Server-Sent Events).',
    });
  } catch (err) {
    console.error(`[${correlationId}] Server error:`, err instanceof Error ? err.message : err);
    if (!res.headersSent) {
      sendJson(res, 500, { error: 'internal_server_error', message: 'An unexpected server error occurred.' });
    }
  }
});

// ── Graceful Shutdown ─────────────────────────────────────────────────────────
function shutdown() {
  console.log('\n[mcp] Shutting down Watchbox MCP Server...');
  for (const session of streamableSessions.values()) {
    session.transport.close().catch(() => {});
  }
  for (const session of sseSessions.values()) {
    session.transport.close().catch(() => {});
  }
  streamableSessions.clear();
  sseSessions.clear();
  server.close(() => {
    console.log('[mcp] Server closed successfully.');
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// ── Server Start ──────────────────────────────────────────────────────────────
server.listen(PORT, HOST, () => {
  console.log('════════════════════════════════════════════════════════════════════');
  console.log(`🎬 Watchbox MCP Server is running!`);
  console.log(`   Host:            http://${HOST}:${PORT}`);
  console.log(`   MCP Endpoint:    http://${HOST}:${PORT}/mcp (Streamable HTTP)`);
  console.log(`   SSE Endpoint:    http://${HOST}:${PORT}/sse (Server-Sent Events)`);
  console.log(`   Health Check:    http://${HOST}:${PORT}/health`);
  console.log(`   Supabase Target: ${getSupabaseUrl()}`);
  console.log('════════════════════════════════════════════════════════════════════');
});

export default server;
