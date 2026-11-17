import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MediaPlayerModal from '../src/components/movie/MediaPlayerModal';
import { getMovieProgress, saveMovieProgress } from '../src/hooks/usePlaybackProgress';

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: ReactNode }) => children,
  motion: { div: 'div' },
}));

describe('MediaPlayerModal VidBolt playback', () => {
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

    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://vidbolt.pro',
      source: iframe.contentWindow,
      data: { type: 'ready' },
    }));

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

    expect(getMovieProgress(550)).toMatchObject({
      positionSecs: 123,
      durationSecs: 360,
    });
  });
});
