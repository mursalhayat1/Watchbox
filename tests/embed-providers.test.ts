import { describe, expect, it } from 'vitest';
import { buildEmbedUrl, getIframeSandbox } from '../src/lib/embed-providers';

describe('buildEmbedUrl', () => {
  it('builds Cinextream movie and episode embed URLs', () => {
    expect(buildEmbedUrl('cinextream', 'movie', 550))
      .toBe('https://cinextream.cc/api/embed/movie/550');
    expect(buildEmbedUrl('cinextream', 'tv', 1399, 2, 5))
      .toBe('https://cinextream.cc/api/embed/tv/1399/2/5');
  });

  it('builds VidBolt movie and TV URLs', () => {
    expect(buildEmbedUrl('vidbolt', 'movie', 550))
      .toBe('https://vidbolt.pro/movie/550');
    expect(buildEmbedUrl('vidbolt', 'tv', 1399, 2, 5))
      .toBe('https://vidbolt.pro/tv/1399/2/5');
  });

  it('omits the iframe sandbox only for VidBolt', () => {
    expect(getIframeSandbox('vidbolt')).toBeUndefined();
    const existingProviderSandbox =
      'allow-scripts allow-same-origin allow-forms allow-presentation allow-popups-to-escape-sandbox';
    expect(getIframeSandbox('nxsha')).toBe(existingProviderSandbox);
    expect(getIframeSandbox('screenscape')).toBe(existingProviderSandbox);
    expect(getIframeSandbox('cinextream')).toBe(existingProviderSandbox);
  });

  it('preserves the existing provider URLs', () => {
    expect(buildEmbedUrl('nxsha', 'movie', 550))
      .toBe('https://nxsha.space/embed/movie/550?color=%230e7490');
    expect(buildEmbedUrl('screenscape', 'tv', 1399, 2, 5))
      .toBe('https://screenscape.me/embed?tmdb=1399&type=tv&s=2&e=5');
  });
});
