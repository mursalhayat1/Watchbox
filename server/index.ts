import { pathToFileURL } from 'node:url';
import { createWatchboxHttpServer } from './http.js';
import { loadConfig } from './config.js';

export function startServer(): ReturnType<typeof createWatchboxHttpServer> {
  const config = loadConfig();
  const server = createWatchboxHttpServer({ config });
  server.listen(config.port, config.host, () => {
    console.info(`[watchbox] HTTP service listening on ${config.host}:${config.port}`);
  });
  return server;
}

const entry = process.argv[1] ? pathToFileURL(process.argv[1]).href : '';
if (entry && import.meta.url === entry) startServer();
