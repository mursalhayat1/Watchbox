import { validateProviderUrl } from './navigation-security';

export type EmbedProvider = 'nxsha' | 'screenscape' | 'cinextream' | 'vidbolt';

export const PROVIDERS: { id: EmbedProvider; label: string }[] = [
  { id: 'nxsha', label: 'NxSha' },
  { id: 'screenscape', label: 'ScreenScape' },
  { id: 'cinextream', label: 'Cinextream' },
  { id: 'vidbolt', label: 'VidBolt' },
];

function approvedEmbedUrl(url: string): string {
  const validatedUrl = validateProviderUrl(url);
  if (!validatedUrl) throw new Error('Embed provider URL is not from an approved HTTPS origin.');
  return validatedUrl;
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
    return approvedEmbedUrl(`https://screenscape.me/embed?${params.toString()}`);
  }

  if (provider === 'cinextream') {
    if (mediaType === 'tv') {
      return approvedEmbedUrl(`https://cinextream.cc/api/embed/tv/${tmdbId}/${season}/${episode}`);
    }
    return approvedEmbedUrl(`https://cinextream.cc/api/embed/movie/${tmdbId}`);
  }

  if (provider === 'vidbolt') {
    if (mediaType === 'tv') {
      return approvedEmbedUrl(`https://vidbolt.pro/tv/${tmdbId}/${season}/${episode}`);
    }
    return approvedEmbedUrl(`https://vidbolt.pro/movie/${tmdbId}`);
  }

  const color = encodeURIComponent('#0e7490');
  if (mediaType === 'tv') {
    return approvedEmbedUrl(`https://nxsha.space/embed/tv/${tmdbId}/${season}/${episode}?color=${color}`);
  }
  return approvedEmbedUrl(`https://nxsha.space/embed/movie/${tmdbId}?color=${color}`);
}
