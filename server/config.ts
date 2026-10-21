export interface WatchboxConfig {
  nodeEnv: string;
  port: number;
  host: string;
  supabaseUrl: string | null;
  supabaseAnonKey: string | null;
  tmdbApiKey: string | null;
  publicOrigin: string | null;
  readClientIds: ReadonlySet<string>;
  writeClientIds: ReadonlySet<string>;
}

export interface BrowserSafeConfig {
  supabaseUrl: string | null;
  supabaseAnonKey: string | null;
  tmdbApiKey: string | null;
  siteUrl: string | null;
  appId: string | null;
}

function nonEmpty(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function parseClientIds(value: string | undefined): ReadonlySet<string> {
  if (!value?.trim()) return new Set();
  const raw = value.trim();
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((entry) => typeof entry === 'string')) {
      return new Set(parsed.map((entry) => entry.trim()).filter(Boolean));
    }
  } catch {
    // A comma-separated value is the documented human-editable form.
  }
  return new Set(raw.split(',').map((entry) => entry.trim()).filter(Boolean));
}

function trustedPublicOrigin(env: NodeJS.ProcessEnv, nodeEnv: string, port: number): string | null {
  const configured = nonEmpty(env.MCP_PUBLIC_URL) ?? nonEmpty(env.PUBLIC_URL) ?? nonEmpty(env.VITE_SITE_URL);
  if (!configured && nodeEnv !== 'production') return `http://127.0.0.1:${port}`;
  if (!configured) return null;

  try {
    const url = new URL(configured);
    if (url.username || url.password || url.search || url.hash) return null;
    if (url.protocol === 'https:') return url.origin;
    if (nodeEnv !== 'production' && url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname)) {
      return url.origin;
    }
  } catch {
    return null;
  }
  return null;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): WatchboxConfig {
  const nodeEnv = env.NODE_ENV ?? 'development';
  const parsedPort = Number(env.PORT ?? env.MCP_PORT ?? 3000);
  const port = Number.isInteger(parsedPort) && parsedPort >= 1024 && parsedPort <= 65535 ? parsedPort : 3000;

  return {
    nodeEnv,
    port,
    host: nodeEnv === 'production' ? '0.0.0.0' : (env.HOST ?? '127.0.0.1'),
    supabaseUrl: nonEmpty(env.SUPABASE_URL) ?? nonEmpty(env.VITE_SUPABASE_URL),
    supabaseAnonKey: nonEmpty(env.SUPABASE_ANON_KEY) ?? nonEmpty(env.VITE_SUPABASE_ANON_KEY),
    tmdbApiKey: nonEmpty(env.TMDB_API_KEY) ?? nonEmpty(env.VITE_TMDB_API_KEY),
    publicOrigin: trustedPublicOrigin(env, nodeEnv, port),
    readClientIds: parseClientIds(env.MCP_READ_CLIENT_IDS),
    writeClientIds: parseClientIds(env.MCP_WRITE_CLIENT_IDS),
  };
}

export function isReadClientAllowed(clientId: string, config: WatchboxConfig): boolean {
  return clientId.length > 0 && config.readClientIds.has(clientId);
}

export function isWriteClientAllowed(clientId: string, config: WatchboxConfig): boolean {
  return isReadClientAllowed(clientId, config) && config.writeClientIds.has(clientId);
}

export function browserSafeConfig(env: NodeJS.ProcessEnv = process.env): BrowserSafeConfig {
  const config = loadConfig(env);
  const appId = nonEmpty(env.VITE_APP_ID);
  const siteUrl = config.publicOrigin ?? nonEmpty(env.VITE_SITE_URL);
  return {
    supabaseUrl: config.supabaseUrl,
    supabaseAnonKey: config.supabaseAnonKey,
    tmdbApiKey: config.tmdbApiKey,
    siteUrl,
    appId,
  };
}

export function authIssuer(supabaseUrl: string): string {
  const parsed = new URL(supabaseUrl);
  const basePath = parsed.pathname.replace(/\/+$/, '');
  const authPath = basePath.endsWith('/auth/v1') ? basePath : `${basePath}/auth/v1`;
  return `${parsed.origin}${authPath}`;
}
