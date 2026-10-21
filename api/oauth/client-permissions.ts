import type { IncomingMessage, ServerResponse } from 'node:http';
import { isReadClientAllowed, isWriteClientAllowed, loadConfig } from '../../server/config.js';
import { sendJson } from '../../server/response.js';

const config = loadConfig();

export default function handler(req: IncomingMessage, res: ServerResponse): void {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    sendJson(res, 405, { error: 'Method not allowed.' });
    return;
  }

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
}
