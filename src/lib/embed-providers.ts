export type EmbedProvider = 'nxsha' | 'screenscape' | 'cinextream' | 'vidbolt';

export const PROVIDERS: { id: EmbedProvider; label: string }[] = [
  { id: 'nxsha', label: 'NxSha' },
  { id: 'screenscape', label: 'ScreenScape' },
  { id: 'cinextream', label: 'Cinextream' },
  { id: 'vidbolt', label: 'VidBolt' },
];

const IFRAME_SANDBOX = 'allow-scripts allow-same-origin allow-forms allow-presentation allow-popups-to-escape-sandbox';

export function getIframeSandbox(provider: EmbedProvider): string | undefined {
  // VidBolt refuses to run when its iframe has a sandbox attribute.
  return provider === 'vidbolt' ? undefined : IFRAME_SANDBOX;
}

export function buildEmbedUrl(
  provider: EmbedProvider,
  mediaType: 'movie' | 'tv',
  tmdbId: number,
  season = 1,
  episode = 1,
): string {
  if (provider === 'screenscape') {
    const params = new URLSearchParams({ tmdb: String(tmdbId), type: mediaType });
    if (mediaType === 'tv') {
      params.set('s', String(season));
      params.set('e', String(episode));
    }
    return `https://screenscape.me/embed?${params.toString()}`;
  }

  if (provider === 'cinextream') {
    if (mediaType === 'tv') {
      return `https://cinextream.cc/api/embed/tv/${tmdbId}/${season}/${episode}`;
    }
    return `https://cinextream.cc/api/embed/movie/${tmdbId}`;
  }

  if (provider === 'vidbolt') {
    if (mediaType === 'tv') {
      return `https://vidbolt.pro/tv/${tmdbId}/${season}/${episode}`;
    }
    return `https://vidbolt.pro/movie/${tmdbId}`;
  }

  const color = encodeURIComponent('#0e7490');
  if (mediaType === 'tv') {
    return `https://nxsha.space/embed/tv/${tmdbId}/${season}/${episode}?color=${color}`;
  }
  return `https://nxsha.space/embed/movie/${tmdbId}?color=${color}`;
}
