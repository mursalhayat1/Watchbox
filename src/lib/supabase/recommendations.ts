import { supabase, SESSION_ID } from './client';

export interface RecommendedItem {
  tmdb_id: number;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  vote_average: number;
  score: number; // recommendation relevance score (0–1)
}

export type InteractionType = 'view' | 'play' | 'like' | 'add_library' | 'add_watchlist';

export interface Interaction {
  session_id: string;
  tmdb_id: number;
  media_type: 'movie' | 'tv';
  interaction_type: InteractionType;
  genre_ids: number[];
  occurred_at: string;
}

// Fetch personalised recommendations based on recorded interactions
export async function getRecommendations(limit = 20): Promise<RecommendedItem[]> {
  // Derive genre preferences from most recent interactions
  const { data: interactions } = await supabase
    .from('interactions')
    .select('genre_ids, interaction_type')
    .eq('session_id', SESSION_ID)
    .order('occurred_at', { ascending: false })
    .limit(50);

  if (!interactions || interactions.length === 0) return [];

  // Tally genre frequency; weight 'like' and 'add_library' 2×
  const freq: Record<number, number> = {};
  for (const row of interactions) {
    const weight = ['like', 'add_library'].includes(row.interaction_type) ? 2 : 1;
    for (const g of (row.genre_ids ?? [])) {
      freq[g] = (freq[g] ?? 0) + weight;
    }
  }
  const topGenres = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([g]) => Number(g));

  if (topGenres.length === 0) return [];

  // Query library_items table for titles matching top genres
  const { data, error } = await supabase
    .from('recommendations')
    .select('*')
    .contains('genre_ids', topGenres.slice(0, 1))
    .eq('session_id', SESSION_ID)
    .order('score', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// Record a user interaction to improve future recommendations
export async function recordInteraction(
  tmdbId: number,
  mediaType: 'movie' | 'tv',
  interactionType: InteractionType,
  genreIds: number[] = [],
): Promise<void> {
  const { error } = await supabase
    .from('interactions')
    .insert({
      session_id: SESSION_ID,
      tmdb_id: tmdbId,
      media_type: mediaType,
      interaction_type: interactionType,
      genre_ids: genreIds,
      occurred_at: new Date().toISOString(),
    });
  if (error) throw error;
}
