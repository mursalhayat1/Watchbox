import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { createUserScopedSupabase, authenticateRequest, AuthenticationError } from './auth.js';
import { browserSafeConfig, isReadClientAllowed, isWriteClientAllowed, loadConfig, type WatchboxConfig } from './config.js';
import { challengeHeader, protectedResourceMetadata, rateMetadataProblem } from './oauth-metadata.js';
import { WatchboxRepository } from './repository.js';
import { escapeScriptJson, sendJson, setMcpCors } from './response.js';
import { createWatchboxMcpServer } from './tools.js';

export { protectedResourceMetadata, rateMetadataProblem } from './oauth-metadata.js';
export { escapeScriptJson, sendJson, setMcpCors } from './response.js';

const MCP_PATH = '/mcp';
const METADATA_PATHS = new Set([
  '/.well-known/oauth-protected-resource/mcp',
  '/.well-known/oauth-protected-resource',
]);
const MAX_MCP_BODY_BYTES = 1_048_576;

type Authenticator = typeof authenticateRequest;
type RepositoryFactory = (supabase: ReturnType<typeof createUserScopedSupabase>) => WatchboxRepository;

export interface HttpServerOptions {
  config?: WatchboxConfig;
  env?: NodeJS.ProcessEnv;
  staticRoot?: string;
  authenticate?: Authenticator;
  createRepository?: RepositoryFactory;
  fetcher?: typeof fetch;
}

class RequestProblem extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
    this.name = 'RequestProblem';
  }
}

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const contentType = req.headers['content-type']?.split(';', 1)[0]?.trim().toLowerCase();
  if (contentType !== 'application/json' && contentType !== 'application/json-rpc') {
    throw new RequestProblem(415, 'MCP requests must use application/json.');
  }
  const declaredLength = Number(req.headers['content-length'] ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_MCP_BODY_BYTES) {
    throw new RequestProblem(413, 'MCP request body is too large.');
  }

  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > MAX_MCP_BODY_BYTES) throw new RequestProblem(413, 'MCP request body is too large.');
    chunks.push(buffer);
  }
  if (size === 0) throw new RequestProblem(400, 'MCP request body is empty.');
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown;
  } catch {
    throw new RequestProblem(400, 'MCP request body is not valid JSON.');
  }
}

function contentType(path: string): string {
  const byExtension: Record<string, string> = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.ico': 'image/x-icon',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.map': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.txt': 'text/plain; charset=utf-8',
    '.webp': 'image/webp',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
  };
  return byExtension[extname(path).toLowerCase()] ?? 'application/octet-stream';
}

function htmlWithRuntimeConfig(html: string): string {
  const runtimeScript = '<script src="/api/runtime-config.js"></script>';
  if (html.includes('/api/runtime-config.js')) return html;
  return html.replace(/<head([^>]*)>/i, (match) => `${match}${runtimeScript}`);
}

async function serveStatic(req: IncomingMessage, res: ServerResponse, staticRoot: string): Promise<void> {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    sendJson(res, 405, { error: 'Method not allowed.' });
    return;
  }

  let pathname: string;
  try {
    pathname = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
  } catch {
    sendJson(res, 400, { error: 'Invalid URL path.' });
    return;
  }
  if (pathname.includes('\\') || pathname.includes('\0')) {
    sendJson(res, 400, { error: 'Invalid URL path.' });
    return;
  }

  const root = resolve(staticRoot);
  const candidate = resolve(root, `.${pathname}`);
  if (candidate !== root && !candidate.startsWith(`${root}${sep}`)) {
    sendJson(res, 403, { error: 'Path is not available.' });
    return;
  }

  let target = candidate;
  try {
    const info = await stat(target);
    if (info.isDirectory()) target = resolve(target, 'index.html');
    await stat(target);
  } catch {
    if (extname(pathname)) {
      sendJson(res, 404, { error: 'Asset not found.' });
      return;
    }
    target = resolve(root, 'index.html');
  }

  try {
    let body = await readFile(target);
    if (target === resolve(root, 'index.html')) body = Buffer.from(htmlWithRuntimeConfig(body.toString('utf8')));
    const isHtml = extname(target).toLowerCase() === '.html';
    const isHashedAsset = pathname.startsWith('/assets/');
    res.writeHead(200, {
      'Content-Type': contentType(target),
      'Content-Length': body.byteLength,
      'Cache-Control': isHtml ? 'no-store' : isHashedAsset ? 'public, max-age=31536000, immutable' : 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch {
    sendJson(res, 503, { error: 'Website files are not available yet.' });
  }
}

export async function handleMcpPost(
  req: IncomingMessage,
  res: ServerResponse,
  dependencies: Required<Pick<HttpServerOptions, 'config' | 'authenticate' | 'createRepository'>> & Pick<HttpServerOptions, 'fetcher'>,
  parsedBody?: unknown,
): Promise<void> {
  const { config, authenticate, createRepository, fetcher } = dependencies;
  const authorization = req.headers.authorization;
  const invalidToken = typeof authorization === 'string' && authorization.trim().length > 0;
  let authContext;
  let supabase;
  try {
    if (!authorization) throw new AuthenticationError();
    ({ auth: authContext, supabase } = await authenticate(authorization, config));
    if (!isReadClientAllowed(authContext.clientId, config)) throw new AuthenticationError('This OAuth client is not authorized for Watchbox access.');
  } catch (error) {
    if (!(error instanceof AuthenticationError)) console.warn('[watchbox-mcp] authentication verification failed');
    sendJson(res, 401, { error: 'Unauthorized', message: 'A valid Watchbox OAuth access token is required.' }, {
      'WWW-Authenticate': challengeHeader(config, invalidToken),
    });
    return;
  }

  let requestBody: unknown;
  if (parsedBody !== undefined) {
    try {
      if (Buffer.byteLength(JSON.stringify(parsedBody)) > MAX_MCP_BODY_BYTES) {
        throw new RequestProblem(413, 'MCP request body is too large.');
      }
      requestBody = parsedBody;
    } catch (error) {
      const problem = error instanceof RequestProblem ? error : new RequestProblem(400, 'Invalid MCP request.');
      sendJson(res, problem.status, { error: problem.message });
      return;
    }
  } else {
    try {
      requestBody = await readJsonBody(req);
    } catch (error) {
      const problem = error instanceof RequestProblem ? error : new RequestProblem(400, 'Invalid MCP request.');
      sendJson(res, problem.status, { error: problem.message });
      return;
    }
  }

  const mcp = createWatchboxMcpServer(authContext, createRepository(supabase), { config, fetcher });
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  res.once('close', () => {
    void transport.close().catch(() => undefined);
    void mcp.close().catch(() => undefined);
  });
  try {
    await mcp.connect(transport);
    await transport.handleRequest(req as never, res as never, requestBody as never);
  } catch (error) {
    console.warn('[watchbox-mcp] protocol request failed');
    if (!res.headersSent) sendJson(res, 500, { error: 'MCP request could not be completed.' });
    else if (!res.writableEnded) res.destroy();
    await transport.close().catch(() => undefined);
    await mcp.close().catch(() => undefined);
  }
}

async function handleRestAction(
  toolName: string,
  req: IncomingMessage,
  res: ServerResponse,
  dependencies: Required<Pick<HttpServerOptions, 'config' | 'authenticate' | 'createRepository'>> & Pick<HttpServerOptions, 'fetcher'>,
): Promise<void> {
  const { config, authenticate, createRepository, fetcher } = dependencies;
  const authorization = req.headers.authorization;
  let authContext;
  let supabase;
  try {
    if (!authorization) throw new AuthenticationError();
    ({ auth: authContext, supabase } = await authenticate(authorization, config));
    if (!isReadClientAllowed(authContext.clientId, config)) throw new AuthenticationError('This OAuth client is not authorized for Watchbox access.');
  } catch {
    sendJson(res, 401, { error: 'Unauthorized', message: 'A valid Watchbox OAuth access token is required.' });
    return;
  }

  let requestBody: Record<string, unknown> = {};
  if (req.method === 'POST') {
    try {
      requestBody = ((await readJsonBody(req)) as Record<string, unknown>) ?? {};
    } catch {
      requestBody = {};
    }
  }

  const mcp = createWatchboxMcpServer(authContext, createRepository(supabase), { config, fetcher });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: 'watchbox-chatgpt-bridge', version: '1.0.0' });

  try {
    await Promise.all([
      mcp.connect(serverTransport),
      client.connect(clientTransport),
    ]);
    const toolResult = await client.callTool({ name: toolName, arguments: requestBody });
    const contentList = Array.isArray(toolResult.content) ? toolResult.content : [];
    const firstText = contentList.length > 0 && typeof contentList[0] === 'object' && contentList[0] !== null && 'text' in contentList[0]
      ? String((contentList[0] as { text: unknown }).text)
      : undefined;
    if (toolResult.isError) {
      sendJson(res, 400, { ok: false, error: firstText ?? 'Action failed.' });
    } else {
      let data: unknown;
      try {
        data = firstText ? JSON.parse(firstText) : toolResult;
      } catch {
        data = toolResult;
      }
      sendJson(res, 200, { ok: true, data });
    }
  } catch (err) {
    sendJson(res, 500, { ok: false, error: err instanceof Error ? err.message : 'Internal error' });
  } finally {
    void client.close().catch(() => undefined);
    void mcp.close().catch(() => undefined);
  }
}

export function createWatchboxHttpServer(options: HttpServerOptions = {}) {
  const env = options.env ?? process.env;
  const config = options.config ?? loadConfig(env);
  const staticRoot = options.staticRoot ?? resolve(process.cwd(), 'dist');
  const authenticate = options.authenticate ?? authenticateRequest;
  const createRepository = options.createRepository ?? ((supabase) => new WatchboxRepository(supabase));
  const dependencies = { config, authenticate, createRepository, fetcher: options.fetcher };

  return createServer(async (req, res) => {
    const pathname = new URL(req.url ?? '/', 'http://localhost').pathname;

    if (pathname === '/_app/health') {
      sendJson(res, 200, { status: 'ok', service: 'watchbox', protocol: 'mcp' });
      return;
    }

    if (pathname === '/api/runtime-config.js' && req.method === 'GET') {
      const script = `window.__WATCHBOX_CONFIG__=${escapeScriptJson(browserSafeConfig(env))};`;
      res.writeHead(200, {
        'Content-Type': 'text/javascript; charset=utf-8',
        'Content-Length': Buffer.byteLength(script),
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      });
      res.end(script);
      return;
    }

    if (pathname === '/api/config' && req.method === 'GET') {
      sendJson(res, 200, browserSafeConfig(env));
      return;
    }

    if (pathname === '/api/oauth/client-permissions' && req.method === 'GET') {
      const url = new URL(req.url ?? '/', 'http://localhost');
      const clientId = url.searchParams.get('client_id')?.trim() ?? '';
      if (!clientId || clientId.length > 256) {
        sendJson(res, 400, { error: 'A valid OAuth client_id is required.' });
        return;
      }
      sendJson(res, 200, {
        read: isReadClientAllowed(clientId, config),
        write: isWriteClientAllowed(clientId, config),
        destructive_actions_require_confirmation: true,
      });
      return;
    }

    if (METADATA_PATHS.has(pathname) && req.method === 'GET') {
      const metadata = protectedResourceMetadata(config);
      if (!metadata) {
        sendJson(res, 503, rateMetadataProblem(config));
        return;
      }
      sendJson(res, 200, metadata, { 'Access-Control-Allow-Origin': '*', 'Vary': 'Origin' });
      return;
    }

    if (pathname === '/api/openapi.json' && (req.method === 'GET' || req.method === 'HEAD')) {
      try {
        const spec = await readFile(resolve(process.cwd(), 'docs/chatgpt-actions-openapi.json'), 'utf8');
        res.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache',
        });
        res.end(req.method === 'HEAD' ? undefined : spec);
      } catch {
        sendJson(res, 404, { error: 'OpenAPI specification file not found.' });
      }
      return;
    }

    if (pathname.startsWith('/api/actions/')) {
      setMcpCors(res);
      if (req.method === 'OPTIONS') {
        res.writeHead(204, { 'Content-Length': '0' });
        res.end();
        return;
      }
      if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST, OPTIONS');
        sendJson(res, 405, { error: 'Action endpoints accept POST requests only.' });
        return;
      }
      const toolName = pathname.slice('/api/actions/'.length);
      await handleRestAction(toolName, req, res, dependencies);
      return;
    }

    if (pathname === MCP_PATH) {
      setMcpCors(res);
      if (req.method === 'OPTIONS') {
        res.writeHead(204, { 'Content-Length': '0' });
        res.end();
        return;
      }
      if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST, OPTIONS');
        sendJson(res, 405, { error: 'This stateless MCP endpoint accepts POST requests only.' });
        return;
      }
      await handleMcpPost(req, res, dependencies);
      return;
    }

    if (pathname.startsWith('/api/') || pathname.startsWith('/.well-known/') || pathname.startsWith('/_app/')) {
      sendJson(res, 404, { error: 'Endpoint not found.' });
      return;
    }
    await serveStatic(req, res, staticRoot);
  });
}
