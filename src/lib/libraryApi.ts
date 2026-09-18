// Legacy shim — re-exports from the structured supabase/library module.
// All existing imports of '@/lib/libraryApi' continue to work unchanged.
export type { LibraryItem, LibraryStatus, AddPayload } from './supabase/library';
export { LIBRARY_STATUSES } from './supabase/library';

// Alias old function names to the new API
export {
  getLibrary      as fetchLibrary,
  getLibraryItem  as fetchLibraryItem,
  addToLibrary    as upsertLibraryItem,
  updateLibraryStatus,
  updateLibraryNoteRating,
  removeFromLibrary as removeLibraryItem,
} from './supabase/library';
