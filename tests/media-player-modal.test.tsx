import { act, fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MediaPlayerModal from '../src/components/movie/MediaPlayerModal';
import { getMovieProgress, saveMovieProgress } from '../src/hooks/usePlaybackProgress';

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: ReactNode }) => children,
  motion: { div: 'div' },
}));

describe('MediaPlayerModal provider playback', () => {
  const storage = new Map<string, string>();

  beforeEach(() => {
    storage.clear();
    vi.stubGlobal('localStorage', {
      clear: () => storage.clear(),
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    });
    storage.set('watchbox_embed_provider', 'vidbolt');
  });

  it('uses VidBolt when no provider preference is saved', () => {
    storage.delete('watchbox_embed_provider');
    render(
      <MediaPlayerModal
        open
        onClose={vi.fn()}
        tmdbId={550}
        mediaType="movie"
        title="Test movie"
      />,
    );

    const iframe = screen.getByTitle('Test movie player') as HTMLIFrameElement;
    expect(iframe.getAttribute('src')).toBe('https://vidbolt.pro/movie/550');
  });

  it.each(['nxsha', 'screenscape', 'cinextream', 'vidbolt'])(
    'keeps the %s player iframe unrestricted with playback permissions',
    provider => {
      storage.set('watchbox_embed_provider', provider);
      render(
        <MediaPlayerModal
          open
          onClose={vi.fn()}
          tmdbId={550}
          mediaType="movie"
          title="Test movie"
        />,
      );

      const iframe = screen.getByTitle('Test movie player') as HTMLIFrameElement;
      expect(iframe.hasAttribute('sandbox')).toBe(false);
      expect(iframe.getAttribute('allow')).toContain('autoplay');
      expect(iframe.getAttribute('allow')).toContain('fullscreen');
      expect(iframe.hasAttribute('allowfullscreen')).toBe(true);
    },
  );

  it('switches providers without restricting the selected iframe', () => {
    render(
      <MediaPlayerModal
        open
        onClose={vi.fn()}
        tmdbId={550}
        mediaType="movie"
        title="Test movie"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Switch embed provider' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cinextream' }));

    const iframe = screen.getByTitle('Test movie player') as HTMLIFrameElement;
    expect(iframe.getAttribute('src')).toBe('https://cinextream.cc/api/embed/movie/550');
    expect(iframe.hasAttribute('sandbox')).toBe(false);
    expect(storage.get('watchbox_embed_provider')).toBe('cinextream');
  });

  it('seeks to saved progress when VidBolt is ready and saves playback events', () => {
    saveMovieProgress(550, 90, 300);
    render(
      <MediaPlayerModal
        open
        onClose={vi.fn()}
        tmdbId={550}
        mediaType="movie"
        title="Test movie"
      />,
    );

    const iframe = screen.getByTitle('Test movie player') as HTMLIFrameElement;
    const postMessage = vi.spyOn(iframe.contentWindow!, 'postMessage');
    fireEvent.load(iframe);
    fireEvent.click(screen.getByRole('button', { name: /Resume/ }));
    expect(postMessage).not.toHaveBeenCalled();

    act(() => {
      window.dispatchEvent(new MessageEvent('message', {
        origin: 'https://vidbolt.pro',
        source: iframe.contentWindow,
        data: { type: 'ready' },
      }));
    });

    expect(postMessage).toHaveBeenNthCalledWith(
      1,
      { type: 'seek', time: 90 },
      'https://vidbolt.pro',
    );
    expect(postMessage).toHaveBeenNthCalledWith(
      2,
      { type: 'play' },
      'https://vidbolt.pro',
    );

    act(() => {
      window.dispatchEvent(new MessageEvent('message', {
        origin: 'https://untrusted.example',
        source: iframe.contentWindow,
        data: { type: 'timeupdate', time: 999 },
      }));
      window.dispatchEvent(new MessageEvent('message', {
        origin: 'https://vidbolt.pro',
        source: iframe.contentWindow,
        data: { type: 'timeupdate', time: 123 },
      }));
      window.dispatchEvent(new MessageEvent('message', {
        origin: 'https://vidbolt.pro',
        source: iframe.contentWindow,
        data: { type: 'durationchange', duration: 360 },
      }));
    });

    expect(getMovieProgress(550)).toMatchObject({
      positionSecs: 123,
      durationSecs: 360,
    });
  });

});
