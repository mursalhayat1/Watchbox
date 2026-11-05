// Episode navigation stepping logic for TV players.
// Pure + season-boundary aware; never throws. `counts` maps season number →
// number of episodes in that season. A missing/zero count makes the step
// indeterminate → the functions return null, so callers keep the button
// disabled until the count has loaded.

export interface EpisodeStep {
  season: number;
  episode: number;
}

export type SeasonCounts = Record<number, number>;

export function nextEpisode(
  season: number,
  episode: number,
  totalSeasons: number,
  counts: SeasonCounts,
): EpisodeStep | null {
  const count = counts[season];
  if (!count) return null; // unknown or empty season → can't step reliably
  if (episode < count) return { season, episode: episode + 1 };
  if (season < totalSeasons) return { season: season + 1, episode: 1 };
  return null; // last episode of the final season
}

export function prevEpisode(
  season: number,
  episode: number,
  counts: SeasonCounts,
): EpisodeStep | null {
  if (episode > 1) return { season, episode: episode - 1 };
  if (season > 1) {
    const prevCount = counts[season - 1];
    if (!prevCount) return null; // previous-season count pending → stay disabled
    return { season: season - 1, episode: prevCount };
  }
  return null; // very first episode
}
