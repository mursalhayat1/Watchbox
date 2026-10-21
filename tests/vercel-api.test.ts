import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { afterAll, describe, expect, it } from 'vitest';

process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = 'https://watchbox-fixture.supabase.co';
process.env.SUPABASE_ANON_KEY = 'fixture-anon-key';
process.env.TMDB_API_KEY = 'fixture-tmdb-key';
process.env.MCP_PUBLIC_URL = 'https://watchbox.example.test';
process.env.MCP_READ_CLIENT_IDS = 'reader-client,writer-client';
process.env.MCP_WRITE_CLIENT_IDS = 'writer-client';

type Handler = (req: IncomingMessage, res: ServerResponse) => void | Promise<void>;
type TestResponse = { status: number; headers: Headers; text: string };

const { default: clientPermissions } = await import('../api/oauth/client-permissions.js');
const { default: runtimeConfig } = await import('../api/runtime-config.js');
const { default: protectedResource } = await import('../api/oauth-protected-resource.js');
const { default: health } = await import('../api/health.js');
const { default: mcp } = await import('../api/mcp.js');

async function request(handler: Handler, path: string, init?: RequestInit): Promise<TestResponse> {
  const server = createServer((req, res) => {
    Promise.resolve(handler(req, res)).catch((error) => {
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(String(error));
      } else if (!res.writableEnded) {
        res.destroy();
      }
    });
  });
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Could not start API test server.');
  try {
    const response = await fetch(`http://127.0.0.1:${address.port}${path}`, init);
    return { status: response.status, headers: response.headers, text: await response.text() };
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

describe('Vercel API adapters', () => {
  it('returns the configured read and write permissions for a registered client', async () => {
    const writer = await request(clientPermissions, '/api/oauth/client-permissions?client_id=writer-client');
    expect(writer.status).toBe(200);
    expect(JSON.parse(writer.text)).toEqual({
      read: true,
      write: true,
      destructive_actions_require_confirmation: true,
    });

    const reader = await request(clientPermissions, '/api/oauth/client-permissions?client_id=reader-client');
    expect(reader.status).toBe(200);
    expect(JSON.parse(reader.text)).toMatchObject({ read: true, write: false });

    const missing = await request(clientPermissions, '/api/oauth/client-permissions');
    expect(missing.status).toBe(400);
  });

  it('serves browser-safe runtime configuration as JavaScript', async () => {
    const response = await request(runtimeConfig, '/api/runtime-config.js');
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/javascript');
    expect(response.text).toContain('window.__WATCHBOX_CONFIG__');
    expect(response.text).toContain('fixture-anon-key');
    expect(response.text).not.toContain('service_role');
  });

  it('serves OAuth protected-resource metadata', async () => {
    const response = await request(protectedResource, '/.well-known/oauth-protected-resource/mcp');
    expect(response.status).toBe(200);
    expect(JSON.parse(response.text)).toMatchObject({
      resource: 'https://watchbox.example.test/mcp',
      authorization_servers: ['https://watchbox-fixture.supabase.co/auth/v1'],
    });
  });

  it('serves the health endpoint', async () => {
    const response = await request(health, '/_app/health');
    expect(response.status).toBe(200);
    expect(JSON.parse(response.text)).toMatchObject({ status: 'ok', service: 'watchbox', protocol: 'mcp' });
  });

  it('rejects non-POST MCP requests', async () => {
    const response = await request(mcp, '/mcp');
    expect(response.status).toBe(405);
    expect(response.headers.get('allow')).toContain('POST');
  });
});

afterAll(() => {
  // No shared listener; each request owns its server.
});
