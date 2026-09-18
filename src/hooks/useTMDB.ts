import { useState, useEffect, useRef } from 'react';
import type { TMDBResponse, Movie, MovieDetails } from '@/services/tmdb';

type FetchFn<T> = () => Promise<T>;

interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useAsync<T>(fetchFn: FetchFn<T>, deps: unknown[] = []): UseAsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);
    setError(null);
    fetchFn()
      .then((result) => {
        if (mountedRef.current) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (mountedRef.current) {
          setError(err instanceof Error ? err.message : 'An error occurred');
          setLoading(false);
        }
      });
    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}

export function useTMDBList(fetchFn: FetchFn<TMDBResponse>, deps: unknown[] = []) {
  const { data, loading, error } = useAsync(fetchFn, deps);
  return { movies: data?.results ?? [], loading, error };
}

export function useTMDBDetails(fetchFn: FetchFn<MovieDetails>, deps: unknown[] = []) {
  return useAsync(fetchFn, deps);
}

export function useMovieSearch(query: string) {
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { searchMulti } = await import('@/services/tmdb');
        const data = await searchMulti(query);
        setResults(data.results.filter((m) => m.poster_path));
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return { results, loading };
}
