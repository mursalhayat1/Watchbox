const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p';

export const tmdbImageUrl = (path: string | null, size: string = 'w342') =>
  path ? `${IMG_BASE}/${size}${path}` : null;

export const tmdbBackdropUrl = (path: string | null) =>
  tmdbImageUrl(path, 'w1280');

export const tmdbProviderLogoUrl = (path: string | null) =>
  tmdbImageUrl(path, 'w45');

/** Title logo image (PNG with transparency) — use w500 for crisp display */
export const tmdbLogoUrl = (path: string | null) =>
  tmdbImageUrl(path, 'w500');

const getApiKey = () => import.meta.env.VITE_TMDB_API_KEY as string | undefined;

export async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('TMDB API key not configured. Set VITE_TMDB_API_KEY.');
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set('api_key', apiKey);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB error ${res.status}: ${res.statusText}`);
  return res.json() as Promise<T>;
}

export interface Movie {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids: number[];
  media_type?: string;
}

export interface TMDBResponse {
  results: Movie[];
  page: number;
  total_pages: number;
  total_results: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface WatchProvidersContainer {
  results: Record<string, { flatrate?: WatchProvider[]; rent?: WatchProvider[]; buy?: WatchProvider[] }>;
}

export interface ProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface MovieDetails extends Movie {
  genres: Genre[];
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  tagline?: string;
  status?: string;
  budget?: number;
  revenue?: number;
  original_language?: string;
  homepage?: string;
  imdb_id?: string;
  production_companies?: ProductionCompany[];
  videos?: { results: Video[] };
  credits?: { cast: CastMember[]; crew: CrewMember[] };
  watch_providers?: WatchProvidersResponse;
  similar?: TMDBResponse;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  known_for_department?: string;
  order?: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  profile_path: string | null;
}

export interface WatchProvider {
  logo_path: string;
  provider_id: number;
  provider_name: string;
}

export interface WatchProvidersResponse {
  results: Record<string, { flatrate?: WatchProvider[]; rent?: WatchProvider[]; buy?: WatchProvider[] }>;
}

// Trending
export const getTrending = (mediaType: 'movie' | 'tv' | 'all', page = '1') =>
  tmdbFetch<TMDBResponse>(`/trending/${mediaType}/week`, { page });

// Upcoming movies
export const getUpcomingMovies = (page = '1') =>
  tmdbFetch<TMDBResponse>('/movie/upcoming', { page });

// Upcoming TV (on-the-air)
export const getUpcomingTV = (page = '1') =>
  tmdbFetch<TMDBResponse>('/tv/on_the_air', { page });

// Anime — TV with genre 16 (Animation) and language ja
export const getAnime = (page = '1', params: Record<string, string> = {}) =>
  tmdbFetch<TMDBResponse>('/discover/tv', {
    with_genres: '16',
    with_original_language: 'ja',
    sort_by: 'popularity.desc',
    page,
    ...params,
  });

// Flexible discover for the Discover page (movies, tv, or anime)
export interface DiscoverParams {
  mediaType: 'movie' | 'tv';
  genre?: string;
  year?: string;
  sortBy?: string;
  provider?: string;
  region?: string;
  page?: string;
  anime?: boolean;
  keywords?: string; // comma-separated TMDB keyword IDs
}

export const discoverFiltered = ({ mediaType, genre, year, sortBy, provider, region, page = '1', anime, keywords }: DiscoverParams) => {
  const endpoint = `/discover/${mediaType}`;
  const params: Record<string, string> = {
    sort_by: sortBy ?? 'popularity.desc',
    page,
  };
  if (genre) params['with_genres'] = genre;
  if (year) {
    if (mediaType === 'movie') params['primary_release_year'] = year;
    else params['first_air_date_year'] = year;
  }
  // Provider requires watch_region; country-of-origin uses with_origin_country
  if (provider) { params['with_watch_providers'] = provider; params['watch_region'] = region ?? 'US'; }
  if (region) params['with_origin_country'] = region;
  if (anime) { params['with_genres'] = genre ? `${genre},16` : '16'; params['with_original_language'] = 'ja'; }
  if (keywords) params['with_keywords'] = keywords;
  return tmdbFetch<TMDBResponse>(endpoint, params);
};

// Keyword search — returns matching TMDB keyword IDs for a query string
export interface TMDBKeyword { id: number; name: string; }
export const searchKeywords = (query: string) =>
  tmdbFetch<{ results: TMDBKeyword[] }>('/search/keyword', { query });

// Top Rated
export const getTopRated = (mediaType: 'movie' | 'tv', page = '1') =>
  tmdbFetch<TMDBResponse>(`/${mediaType}/top_rated`, { page });

// Discover with genres
export const discoverMovies = (params: Record<string, string> = {}) =>
  tmdbFetch<TMDBResponse>('/discover/movie', { sort_by: 'popularity.desc', ...params });

export const discoverTV = (params: Record<string, string> = {}) =>
  tmdbFetch<TMDBResponse>('/discover/tv', { sort_by: 'popularity.desc', ...params });

// Search
export const searchMulti = (query: string, page = '1') =>
  tmdbFetch<TMDBResponse>('/search/multi', { query, page });

export interface PersonSearchResult {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department?: string;
}
export const searchPerson = (query: string, page = '1') =>
  tmdbFetch<{ results: PersonSearchResult[] }>('/search/person', { query, page });

// Movie details
export const getMovieDetails = (id: number) =>
  tmdbFetch<MovieDetails>(`/movie/${id}`, { append_to_response: 'videos,credits,similar,watch/providers,external_ids' });

export const getTVDetails = (id: number) =>
  tmdbFetch<MovieDetails>(`/tv/${id}`, { append_to_response: 'videos,credits,similar,watch/providers,external_ids' });

// TV Season details
export interface TvEpisode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  still_path: string | null;
  air_date: string | null;
  runtime: number | null;
  vote_average: number;
}

export interface TvSeason {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  overview: string;
  poster_path: string | null;
  air_date: string | null;
  episodes: TvEpisode[];
}

export const getTVSeason = (tvId: number, seasonNumber: number) =>
  tmdbFetch<TvSeason>(`/tv/${tvId}/season/${seasonNumber}`);

// Genres
export const getMovieGenres = () =>
  tmdbFetch<{ genres: Genre[] }>('/genre/movie/list');

export const getTVGenres = () =>
  tmdbFetch<{ genres: Genre[] }>('/genre/tv/list');

// Watch providers (streaming services available)
export const getMovieWatchProviders = () =>
  tmdbFetch<{ results: WatchProvider[] }>('/watch/providers/movie', { watch_region: 'US' });

// Get movie/TV by provider (Netflix=8, Disney+=337, Apple TV+=350, Hulu=15, HBO Max=1899, Peacock=386, Paramount+=531, Prime=9, STARZ=43)
export const discoverByProvider = (mediaType: 'movie' | 'tv', providerId: number, page = '1') => {
  const endpoint = mediaType === 'movie' ? '/discover/movie' : '/discover/tv';
  return tmdbFetch<TMDBResponse>(endpoint, {
    with_watch_providers: String(providerId),
    watch_region: 'US',
    sort_by: 'popularity.desc',
    page,
  });
};

// By genre IDs — award-winning approximation: high vote, high rating
export const getAwardWinners = (mediaType: 'movie' | 'tv', page = '1') => {
  const endpoint = mediaType === 'movie' ? '/discover/movie' : '/discover/tv';
  return tmdbFetch<TMDBResponse>(endpoint, {
    sort_by: 'vote_average.desc',
    'vote_count.gte': '500',
    page,
  });
};

// Oscar nominees (uses keyword 1721 = Academy Award for Best Picture)
export const getOscarNominees = (page = '1') =>
  tmdbFetch<TMDBResponse>('/discover/movie', {
    with_keywords: '1721',
    sort_by: 'vote_average.desc',
    'vote_count.gte': '200',
    page,
  });

// Psychological thrillers (genre 53 = Thriller, 27 = Horror)
export const getPsychologicalThrillers = (page = '1') =>
  tmdbFetch<TMDBResponse>('/discover/movie', {
    with_genres: '53',
    sort_by: 'vote_average.desc',
    'vote_count.gte': '500',
    page,
  });

// Cannes (keyword 6556 = Cannes Film Festival)
export const getCannesFilms = (page = '1') =>
  tmdbFetch<TMDBResponse>('/discover/movie', {
    with_keywords: '6556',
    sort_by: 'vote_average.desc',
    page,
  });

// Halloween movies (genre 27 = Horror)
export const getHalloweenMovies = (page = '1') =>
  tmdbFetch<TMDBResponse>('/discover/movie', {
    with_genres: '27',
    sort_by: 'vote_average.desc',
    'vote_count.gte': '200',
    page,
  });

// Mind-bending movies (mystery/sci-fi genre mix: 9648 + 878)
export const getMindBendingMovies = (page = '1') =>
  tmdbFetch<TMDBResponse>('/discover/movie', {
    with_genres: '9648',
    sort_by: 'vote_average.desc',
    'vote_count.gte': '500',
    page,
  });

// Based on true story (keyword 9672)
export const getBasedOnTrueStory = (page = '1') =>
  tmdbFetch<TMDBResponse>('/discover/movie', {
    with_keywords: '9672',
    sort_by: 'vote_average.desc',
    'vote_count.gte': '200',
    page,
  });

// Similar movies
export const getSimilarMovies = (movieId: number, page = '1') =>
  tmdbFetch<TMDBResponse>(`/movie/${movieId}/similar`, { page });

// Similar TV
export const getSimilarTV = (tvId: number, page = '1') =>
  tmdbFetch<TMDBResponse>(`/tv/${tvId}/similar`, { page });

// Rotten Tomatoes best = top rated movies all time
export const getRottenTomatoesBest = (page = '1') =>
  tmdbFetch<TMDBResponse>('/discover/movie', {
    sort_by: 'vote_average.desc',
    'vote_count.gte': '2000',
    page,
  });

// Popular TV shows
export const getPopularTV = (page = '1') =>
  tmdbFetch<TMDBResponse>('/tv/popular', { page });

// K-Drama (Korean language TV)
export const getKDrama = (page = '1') =>
  tmdbFetch<TMDBResponse>('/discover/tv', {
    with_original_language: 'ko',
    sort_by: 'popularity.desc',
    page,
  });

// Trending this week (all media)
export const getTrendingThisWeek = (page = '1') =>
  tmdbFetch<TMDBResponse>('/trending/all/week', { page });

// Netflix originals (provider 8)
export const getNetflixOriginals = (mediaType: 'movie' | 'tv' = 'tv', page = '1') =>
  tmdbFetch<TMDBResponse>(`/discover/${mediaType}`, {
    with_watch_providers: '8',
    watch_region: 'US',
    sort_by: 'popularity.desc',
    page,
  });

// Action & Adventure movies (genre 28)
export const getActionMovies = (page = '1') =>
  tmdbFetch<TMDBResponse>('/discover/movie', {
    with_genres: '28',
    sort_by: 'popularity.desc',
    page,
  });

// Drama TV (genre 18)
export const getDramaTV = (page = '1') =>
  tmdbFetch<TMDBResponse>('/discover/tv', {
    with_genres: '18',
    sort_by: 'vote_average.desc',
    'vote_count.gte': '100',
    page,
  });

// Sci-Fi movies (genre 878)
export const getSciFiMovies = (page = '1') =>
  tmdbFetch<TMDBResponse>('/discover/movie', {
    with_genres: '878',
    sort_by: 'popularity.desc',
    page,
  });

// ── Person ────────────────────────────────────────────────────────────────────
export interface PersonDetails {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  gender: number; // 0=unset,1=female,2=male,3=nb
  known_for_department: string;
  popularity: number;
  profile_path: string | null;
  also_known_as: string[];
  imdb_id: string | null;
  homepage: string | null;
  combined_credits?: {
    cast: PersonCredit[];
    crew: PersonCredit[];
  };
  external_ids?: { imdb_id?: string; };
}

export interface PersonCredit {
  id: number;
  title?: string;
  name?: string;
  character?: string;
  job?: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  media_type: 'movie' | 'tv';
  vote_average?: number;
}

export const getPersonDetails = (id: number) =>
  tmdbFetch<PersonDetails>(`/person/${id}`, {
    append_to_response: 'combined_credits,external_ids',
  });

/** Fetch English title logos for a movie or TV show from TMDB /images endpoint */
export interface TMDBImagesResponse {
  logos: { file_path: string; iso_639_1: string | null; vote_average: number; width: number }[];
}

export const getMovieImages = (id: number) =>
  tmdbFetch<TMDBImagesResponse>(`/movie/${id}/images`, { include_image_language: 'en,null' });

export const getTVImages = (id: number) =>
  tmdbFetch<TMDBImagesResponse>(`/tv/${id}/images`, { include_image_language: 'en,null' });
