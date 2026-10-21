import { authIssuer, type WatchboxConfig } from './config.js';

const MCP_PATH = '/mcp';

export function protectedResourceMetadata(config: WatchboxConfig): Record<string, unknown> | null {
  if (!config.publicOrigin || !config.supabaseUrl) return null;
  return {
    resource: new URL(MCP_PATH, config.publicOrigin).href,
    authorization_servers: [authIssuer(config.supabaseUrl)],
    bearer_methods_supported: ['header'],
    scopes_supported: ['openid', 'profile', 'email'],
    resource_name: 'Watchbox',
  };
}

export function challengeHeader(config: WatchboxConfig, invalidToken: boolean): string {
  const metadataUrl = config.publicOrigin
    ? new URL('/.well-known/oauth-protected-resource/mcp', config.publicOrigin).href
    : null;
  const parameters = [
    'realm="watchbox"',
    ...(metadataUrl ? [`resource_metadata="${metadataUrl}"`] : []),
    ...(invalidToken ? ['error="invalid_token"'] : []),
  ];
  return `Bearer ${parameters.join(', ')}`;
}

export function rateMetadataProblem(config: WatchboxConfig): Record<string, unknown> {
  if (!config.publicOrigin) return { error: 'OAuth protected-resource metadata is not ready; configure MCP_PUBLIC_URL to the published HTTPS origin.' };
  if (!config.supabaseUrl) return { error: 'OAuth protected-resource metadata is not ready; configure the existing Watchbox Supabase URL.' };
  return { error: 'OAuth protected-resource metadata is temporarily unavailable.' };
}
