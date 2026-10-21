export const LIBRARY_STATUSES = [
  'Watching',
  'Completed',
  'Plan to Watch',
  'On Hold',
  'Dropped',
] as const;

export type LibraryStatus = (typeof LIBRARY_STATUSES)[number];

export function isLibraryStatus(status: unknown): status is LibraryStatus {
  return typeof status === 'string' && (LIBRARY_STATUSES as readonly string[]).includes(status);
}

export interface LibraryItemRecord {
  id: string;
  user_id: string;
  tmdb_id: number;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date: string | null;
  status: LibraryStatus;
  note: string | null;
  user_rating: number | null;
  added_at: string;
  updated_at: string;
}

export interface FavoriteItemRecord {
  id: string;
  user_id: string;
  tmdb_id: number;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date: string | null;
  added_at: string;
}

export interface ActorFavoriteRecord {
  id: string;
  user_id: string;
  person_id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string | null;
  added_at: string;
}

export interface EpisodeProgressRecord {
  id: string;
  user_id: string;
  tv_id: number;
  season_number: number;
  episode_number: number;
  watched: boolean;
  position_secs: number;
  duration_secs: number;
  updated_at: string;
}

export interface ProfileRecord {
  id: string;
  username: string | null;
  display_name: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}
