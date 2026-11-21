export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "script-src 'self' 'sha256-fvWlFZDErqiyfgKX1g4nMs5oITYsuovLEjtoHeS2K6s=' https://cookiehub.net https://www.googletagmanager.com https://www.google-analytics.com",
  "script-src-attr 'none'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https://image.tmdb.org https://img.youtube.com https://i.ytimg.com https://*.supabase.co",
  "connect-src 'self' https://api.themoviedb.org https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://region1.google-analytics.com https://analytics.google.com https://cookiehub.net https://*.cookiehub.net https://vitals.vercel-insights.com https://*.sentry.io",
  "frame-src 'self' https://nxsha.space https://screenscape.me https://cinextream.cc https://vidbolt.pro https://www.youtube-nocookie.com",
  "media-src 'self' data: blob: https:",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  'upgrade-insecure-requests',
].join('; ');

export const BASIC_SECURITY_HEADERS = {
  'Referrer-Policy': 'strict-origin',
  'X-Content-Type-Options': 'nosniff',
};

export const STRICT_TRANSPORT_SECURITY = 'max-age=31536000; includeSubDomains';
