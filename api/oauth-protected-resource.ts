import type { IncomingMessage, ServerResponse } from 'node:http';
import { loadConfig } from '../server/config.js';
import { protectedResourceMetadata, rateMetadataProblem } from '../server/oauth-metadata.js';
import { sendJson } from '../server/response.js';

const config = loadConfig();

export default function handler(req: IncomingMessage, res: ServerResponse): void {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    sendJson(res, 405, { error: 'Method not allowed.' });
    return;
  }

  const metadata = protectedResourceMetadata(config);
  if (!metadata) {
    sendJson(res, 503, rateMetadataProblem(config));
    return;
  }

  sendJson(res, 200, metadata, {
    'Access-Control-Allow-Origin': '*',
    Vary: 'Origin',
  });
}
