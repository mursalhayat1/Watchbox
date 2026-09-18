/**
 * useLibrarySet — returns a stable Set of "tmdb_id-media_type" keys
 * for every item currently in the user's library.
 *
 * Usage:
 *   const libSet = useLibrarySet();          // fetches library
 *   const libSet = useLibrarySet(items);     // reuses already-loaded items (no extra call)
 *
 * excludeLibrary(movies, libSet, mediaType) — filters a Movie[] to remove
 * anything that already exists in the user's library.
 */

import { useState, useEffect, useMemo } from 'react';
import { getLibrary, type LibraryItem } from '@/lib/supabase/library';
import type { Movie } from '@/services/tmdb';
import { useAuth } from '@/contexts/AuthContext';

export type LibrarySet = Set<string>;

/** Build a lookup key from a TMDB id + media type. */
export function libKey(tmdbId: number, mediaType: 'movie' | 'tv'): string {
  return `${tmdbId}-${mediaType}`;
}

/**
 * Derive a LibrarySet from an already-loaded LibraryItem[].
 * Zero extra network requests — use this on pages that already
 * have libraryItems in state (e.g. HomePage).
 */
export function buildLibrarySet(items: LibraryItem[]): LibrarySet {
  return new Set(items.map(i => libKey(i.tmdb_id, i.media_type)));
}

/**
 * Hook that fetches the user's library and returns a LibrarySet.
 * Only fetches when the user is signed in; returns an empty set otherwise.
 * Use this on pages that don't already have libraryItems loaded.
 */
export function useLibrarySet(): LibrarySet {
  const { user } = useAuth();
  const [items, setItems] = useState<LibraryItem[]>([]);

  useEffect(() => {
    if (!user) { setItems([]); return; }
    getLibrary().then(setItems).catch(() => setItems([]));
  }, [user]);

  return useMemo(() => buildLibrarySet(items), [items]);
}

/**
 * Filter a Movie[] to exclude items that are already in the library.
 *
 * @param movies    - The raw list from TMDB
 * @param libSet    - LibrarySet from buildLibrarySet / useLibrarySet
 * @param mediaType - The media type of the row ('movie' | 'tv')
 *                    Pass 'auto' to read media_type from each item's own field.
 */
export function excludeLibrary(
  movies: Movie[],
  libSet: LibrarySet,
  mediaType: 'movie' | 'tv' | 'auto' = 'auto',
): Movie[] {
  if (libSet.size === 0) return movies;
  return movies.filter(m => {
    const type: 'movie' | 'tv' =
      mediaType === 'auto'
        ? ((m as unknown as { media_type?: string }).media_type === 'tv' ? 'tv' : 'movie')
        : mediaType;
    return !libSet.has(libKey(m.id, type));
  });
}
