export interface WatchboxBrowserConfig {
  supabaseUrl: string | null;
  supabaseAnonKey: string | null;
  tmdbApiKey: string | null;
  siteUrl: string | null;
  appId: string | null;
}

declare global {
  interface Window {
    __WATCHBOX_CONFIG__?: Partial<WatchboxBrowserConfig>;
  }
}

function firstValue(...values: Array<string | null | undefined>): string | null {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return null;
}

const injected = typeof window === 'undefined' ? undefined : window.__WATCHBOX_CONFIG__;
const browserOrigin = typeof window === 'undefined' ? null : window.location.origin;

export const publicRuntimeConfig: WatchboxBrowserConfig = {
  supabaseUrl: firstValue(injected?.supabaseUrl, import.meta.env.VITE_SUPABASE_URL),
  supabaseAnonKey: firstValue(injected?.supabaseAnonKey, import.meta.env.VITE_SUPABASE_ANON_KEY),
  tmdbApiKey: firstValue(injected?.tmdbApiKey, import.meta.env.VITE_TMDB_API_KEY),
  siteUrl: firstValue(injected?.siteUrl, import.meta.env.VITE_SITE_URL, browserOrigin)?.replace(/\/$/, '') ?? null,
  appId: firstValue(injected?.appId, import.meta.env.VITE_APP_ID),
};
