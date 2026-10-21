const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export function getTmdbApiKey(): string {
  return (
    process.env.TMDB_API_KEY ||
    process.env.VITE_TMDB_API_KEY ||
    ''
  );
}

export interface TmdbSearchResult {
  tmdb_id: number;
  media_type: 'movie' | 'tv';
  title: string;
  original_title?: string;
  original_language?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date: string | null;
  genre_ids?: number[];
}

export interface TmdbDetailsResult extends TmdbSearchResult {
  genres: Array<{ id: number; name: string }>;
  status?: string;
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  tagline?: string;
}

export async function fetchFromTmdb<T>(path: string, queryParams: Record<string, string | number | undefined> = {}): Promise<T> {
  const apiKey = getTmdbApiKey();
  if (!apiKey) {
    throw new Error('TMDB API key is not configured. Please set TMDB_API_KEY or VITE_TMDB_API_KEY.');
  }

  const url = new URL(`${TMDB_BASE_URL}${path}`);
  url.searchParams.set('api_key', apiKey);
  for (const [key, value] of Object.entries(queryParams)) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`TMDB API error ${res.status}: ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

export async function searchTmdbTitles(
  query: string,
  mediaType?: 'movie' | 'tv',
  page = 1,
): Promise<TmdbSearchResult[]> {
  const endpoint = mediaType === 'movie'
    ? '/search/movie'
    : mediaType === 'tv'
    ? '/search/tv'
    : '/search/multi';

  const data = await fetchFromTmdb<{ results?: Array<Record<string, unknown>> }>(endpoint, {
    query,
    page,
    include_adult: 'false',
  });

  const results = data.results ?? [];
  return results
    .filter((r) => {
      const type = (r.media_type as string) || mediaType;
      return type === 'movie' || type === 'tv';
    })
    .slice(0, 20)
    .map((r) => {
      const type = ((r.media_type as string) || mediaType) as 'movie' | 'tv';
      return {
        tmdb_id: r.id as number,
        media_type: type,
        title: (type === 'movie' ? r.title : r.name) as string,
        original_title: (type === 'movie' ? r.original_title : r.original_name) as string | undefined,
        original_language: r.original_language as string | undefined,
        overview: (r.overview as string) || '',
        poster_path: (r.poster_path as string | null) || null,
        backdrop_path: (r.backdrop_path as string | null) || null,
        vote_average: typeof r.vote_average === 'number' ? Math.round(r.vote_average * 10) / 10 : 0,
        release_date: (type === 'movie' ? r.release_date : r.first_air_date) as string | null || null,
        genre_ids: Array.isArray(r.genre_ids) ? (r.genre_ids as number[]) : [],
      };
    });
}

export async function getTmdbDetails(
  tmdbId: number,
  mediaType: 'movie' | 'tv',
): Promise<TmdbDetailsResult> {
  const data = await fetchFromTmdb<Record<string, unknown>>(`/${mediaType}/${tmdbId}`);
  const title = (mediaType === 'movie' ? data.title : data.name) as string;
  const origTitle = (mediaType === 'movie' ? data.original_title : data.original_name) as string | undefined;

  return {
    tmdb_id: data.id as number,
    media_type: mediaType,
    title: title || 'Unknown Title',
    original_title: origTitle,
    original_language: data.original_language as string | undefined,
    overview: (data.overview as string) || '',
    poster_path: (data.poster_path as string | null) || null,
    backdrop_path: (data.backdrop_path as string | null) || null,
    vote_average: typeof data.vote_average === 'number' ? Math.round(data.vote_average * 10) / 10 : 0,
    release_date: (mediaType === 'movie' ? data.release_date : data.first_air_date) as string | null || null,
    genres: (data.genres as Array<{ id: number; name: string }>) || [],
    status: data.status as string | undefined,
    runtime: data.runtime as number | undefined,
    number_of_seasons: data.number_of_seasons as number | undefined,
    number_of_episodes: data.number_of_episodes as number | undefined,
    tagline: data.tagline as string | undefined,
  };
}

// Genre mapping for common queries like "Korean thrillers", "Action", "Romance"
export const GENRE_MAP: Record<string, number> = {
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  family: 10751,
  fantasy: 14,
  history: 36,
  horror: 27,
  music: 10402,
  mystery: 9648,
  romance: 10749,
  'science fiction': 878,
  scifi: 878,
  'sci-fi': 878,
  thriller: 53,
  war: 10752,
  western: 37,
};

export async function discoverTmdbTitles(params: {
  mediaType: 'movie' | 'tv';
  withOriginalLanguage?: string;
  withGenres?: string; // comma separated genre IDs
  primaryReleaseYear?: number;
  sortBy?: string;
  page?: number;
}): Promise<TmdbSearchResult[]> {
  const queryParams: Record<string, string | number | undefined> = {
    sort_by: params.sortBy || 'popularity.desc',
    page: params.page || 1,
    include_adult: 'false',
  };

  if (params.withOriginalLanguage) {
    queryParams.with_original_language = params.withOriginalLanguage;
  }
  if (params.withGenres) {
    queryParams.with_genres = params.withGenres;
  }
  if (params.primaryReleaseYear) {
    if (params.mediaType === 'movie') {
      queryParams.primary_release_year = params.primaryReleaseYear;
    } else {
      queryParams.first_air_date_year = params.primaryReleaseYear;
    }
  }

  const endpoint = `/discover/${params.mediaType}`;
  const data = await fetchFromTmdb<{ results?: Array<Record<string, unknown>> }>(endpoint, queryParams);
  const results = data.results ?? [];

  return results.slice(0, 20).map((r) => ({
    tmdb_id: r.id as number,
    media_type: params.mediaType,
    title: (params.mediaType === 'movie' ? r.title : r.name) as string,
    original_title: (params.mediaType === 'movie' ? r.original_title : r.original_name) as string | undefined,
    original_language: r.original_language as string | undefined,
    overview: (r.overview as string) || '',
    poster_path: (r.poster_path as string | null) || null,
    backdrop_path: (r.backdrop_path as string | null) || null,
    vote_average: typeof r.vote_average === 'number' ? Math.round(r.vote_average * 10) / 10 : 0,
    release_date: (params.mediaType === 'movie' ? r.release_date : r.first_air_date) as string | null || null,
    genre_ids: Array.isArray(r.genre_ids) ? (r.genre_ids as number[]) : [],
  }));
}
