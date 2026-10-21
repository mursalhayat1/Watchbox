import type { IncomingMessage, ServerResponse } from 'node:http';
import { browserSafeConfig } from '../server/config.js';
import { escapeScriptJson, sendJson } from '../server/response.js';

export default function handler(req: IncomingMessage, res: ServerResponse): void {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    sendJson(res, 405, { error: 'Method not allowed.' });
    return;
  }

  const script = `window.__WATCHBOX_CONFIG__=${escapeScriptJson(browserSafeConfig())};`;
  res.writeHead(200, {
    'Content-Type': 'text/javascript; charset=utf-8',
    'Content-Length': Buffer.byteLength(script),
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(script);
}
