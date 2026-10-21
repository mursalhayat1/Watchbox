import type { IncomingMessage, ServerResponse } from 'node:http';
import { authenticateRequest } from '../server/auth.js';
import { loadConfig } from '../server/config.js';
import { handleMcpPost } from '../server/http.js';
import { WatchboxRepository } from '../server/repository.js';
import { sendJson, setMcpCors } from '../server/response.js';

interface VercelRequest extends IncomingMessage {
  body?: unknown;
}

const config = loadConfig();

export default async function handler(req: VercelRequest, res: ServerResponse): Promise<void> {
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

  const rawContentType = req.headers['content-type'];
  const contentType = (Array.isArray(rawContentType) ? rawContentType[0] : rawContentType)
    ?.split(';', 1)[0]
    ?.trim()
    .toLowerCase();
  if (contentType !== 'application/json' && contentType !== 'application/json-rpc') {
    sendJson(res, 415, { error: 'MCP requests must use application/json.' });
    return;
  }

  await handleMcpPost(
    req,
    res,
    {
      config,
      authenticate: authenticateRequest,
      createRepository: (supabase) => new WatchboxRepository(supabase),
    },
    req.body,
  );
}
