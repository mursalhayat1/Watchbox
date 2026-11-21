import { describe, expect, it } from 'vitest';
import { buildEmbedUrl } from '../src/lib/embed-providers';
import { validateProviderUrl } from '../src/lib/navigation-security';

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

  it('validates provider URLs against the exact approved origins', () => {
    expect(validateProviderUrl('https://vidbolt.pro/movie/550'))
      .toBe('https://vidbolt.pro/movie/550');
    expect(validateProviderUrl('https://vidbolt.pro.attacker.example/movie/550')).toBeNull();
    expect(validateProviderUrl('javascript:alert(1)')).toBeNull();
    expect(validateProviderUrl('http://nxsha.space/embed/movie/550')).toBeNull();
  });

  it('preserves the existing provider URLs', () => {
    expect(buildEmbedUrl('nxsha', 'movie', 550))
      .toBe('https://nxsha.space/embed/movie/550?color=%230e7490');
    expect(buildEmbedUrl('screenscape', 'tv', 1399, 2, 5))
      .toBe('https://screenscape.me/embed?tmdb=1399&type=tv&s=2&e=5');
  });
});
