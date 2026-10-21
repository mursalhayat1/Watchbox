import type { IncomingMessage, ServerResponse } from 'node:http';
import { sendJson } from '../server/response.js';

export default function handler(req: IncomingMessage, res: ServerResponse): void {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    sendJson(res, 405, { error: 'Method not allowed.' });
    return;
  }

  sendJson(res, 200, { status: 'ok', service: 'watchbox', protocol: 'mcp' });
}
