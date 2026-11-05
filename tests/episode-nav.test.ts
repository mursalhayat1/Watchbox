// Episode navigation stepping logic — season-boundary aware.
import { describe, it, expect } from 'vitest';
import { nextEpisode, prevEpisode } from '../src/lib/episode-nav';

const counts = { 1: 4, 2: 6, 3: 2 };

describe('nextEpisode', () => {
  it('steps within a season', () => {
    expect(nextEpisode(1, 2, 3, counts)).toEqual({ season: 1, episode: 3 });
  });

  it('wraps to next season at season end', () => {
    expect(nextEpisode(1, 4, 3, counts)).toEqual({ season: 2, episode: 1 });
  });

  it('is null at the very last episode of the final season', () => {
    expect(nextEpisode(3, 2, 3, counts)).toBeNull();
  });

  it('is null while the season episode count is unknown', () => {
    expect(nextEpisode(1, 1, 3, { 2: 4, 3: 2 })).toBeNull();
  });

  it('is null for a degenerate zero-episode season', () => {
    expect(nextEpisode(2, 1, 3, { 1: 4, 2: 0, 3: 2 })).toBeNull();
  });
});

describe('prevEpisode', () => {
  it('steps within a season', () => {
    expect(prevEpisode(2, 3, counts)).toEqual({ season: 2, episode: 2 });
  });

  it('wraps to the last episode of the previous season', () => {
    expect(prevEpisode(2, 1, counts)).toEqual({ season: 1, episode: 4 });
  });

  it('is null while the previous season count is unknown', () => {
    expect(prevEpisode(2, 1, { 2: 6, 3: 2 })).toBeNull();
  });

  it('is null at the very first episode', () => {
    expect(prevEpisode(1, 1, counts)).toBeNull();
  });
});
