import { useState, useEffect, useCallback } from 'react';
import {
  fetchLibrary, fetchLibraryItem, upsertLibraryItem,
  updateLibraryStatus, updateLibraryNoteRating, removeLibraryItem,
  type LibraryItem, type LibraryStatus, type AddPayload,
} from '@/lib/libraryApi';

// ── Full library list ─────────────────────────────────────────────────────────
export function useLibrary() {
  const [items, setItems]     = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchLibrary();
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load library');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const changeStatus = useCallback(async (id: string, status: LibraryStatus) => {
    await updateLibraryStatus(id, status);
    setItems(prev => prev.map(it => it.id === id ? { ...it, status } : it));
  }, []);

  const remove = useCallback(async (id: string) => {
    await removeLibraryItem(id);
    setItems(prev => prev.filter(it => it.id !== id));
  }, []);

  return { items, loading, error, reload: load, changeStatus, remove };
}

// ── Single-item state (for Detail page add/remove button) ─────────────────────
export function useLibraryItem(tmdbId: number, mediaType: 'movie' | 'tv') {
  const [item, setItem]       = useState<LibraryItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchLibraryItem(tmdbId, mediaType)
      .then(setItem)
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [tmdbId, mediaType]);

  const add = useCallback(async (payload: AddPayload) => {
    await upsertLibraryItem(payload);
    const updated = await fetchLibraryItem(tmdbId, mediaType);
    setItem(updated);
  }, [tmdbId, mediaType]);

  const remove = useCallback(async () => {
    if (!item) return;
    await removeLibraryItem(item.id);
    setItem(null);
  }, [item]);

  const changeStatus = useCallback(async (status: LibraryStatus) => {
    if (!item) return;
    await updateLibraryStatus(item.id, status);
    setItem(prev => prev ? { ...prev, status } : prev);
  }, [item]);

  const saveNoteRating = useCallback(async (note: string | null, userRating: number | null) => {
    if (!item) return;
    await updateLibraryNoteRating(item.id, note, userRating);
    setItem(prev => prev ? { ...prev, note, user_rating: userRating } : prev);
  }, [item]);

  return { item, setItem, loading, add, remove, changeStatus, saveNoteRating };
}
