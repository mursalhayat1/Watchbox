import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadConfig } from '../server/config';
import { createWatchboxHttpServer } from '../server/http';

describe('custom server security headers', () => {
  it('serves the SPA with CSP and applies HSTS only behind HTTPS', async () => {
    const staticRoot = await mkdtemp(join(tmpdir(), 'watchbox-security-'));
    let server: ReturnType<typeof createWatchboxHttpServer> | null = null;

    try {
      const html = await readFile(join(process.cwd(), 'index.html'));
      await writeFile(join(staticRoot, 'index.html'), html);
      const testServer = createWatchboxHttpServer({
        config: loadConfig({
          NODE_ENV: 'test',
          PORT: '0',
          SUPABASE_URL: 'https://watchbox-fixture.supabase.co',
          SUPABASE_ANON_KEY: 'fixture-anon-key',
          MCP_PUBLIC_URL: 'https://watchbox.example.test',
          MCP_READ_CLIENT_IDS: 'reader-client',
          MCP_WRITE_CLIENT_IDS: '',
        }),
        env: {
          SUPABASE_URL: 'https://watchbox-fixture.supabase.co',
          SUPABASE_ANON_KEY: 'fixture-anon-key',
        },
        staticRoot,
      });
      server = testServer;
      const port = await new Promise<number>((resolve, reject) => {
        testServer.once('error', reject);
        testServer.listen(0, '127.0.0.1', () => {
          const address = testServer.address();
          if (!address || typeof address === 'string') {
            reject(new Error('Could not start static security test server.'));
            return;
          }
          resolve(address.port);
        });
      });

      const url = `http://127.0.0.1:${port}/`;
      const response = await fetch(url);
      await response.text();
      expect(response.status).toBe(200);
      expect(response.headers.get('content-security-policy')).toContain("frame-src 'self'");
      expect(response.headers.get('x-content-type-options')).toBe('nosniff');
      expect(response.headers.get('referrer-policy')).toBe('strict-origin');
      expect(response.headers.get('strict-transport-security')).toBeNull();

      const secureResponse = await fetch(url, { headers: { 'x-forwarded-proto': 'https' } });
      await secureResponse.text();
      expect(secureResponse.headers.get('strict-transport-security'))
        .toBe('max-age=31536000; includeSubDomains');
    } finally {
      if (server?.listening) {
        server.closeAllConnections();
        await new Promise<void>((resolve, reject) => {
          server.close(error => error ? reject(error) : resolve());
        });
      }
      await rm(staticRoot, { recursive: true, force: true });
    }
  });
});
