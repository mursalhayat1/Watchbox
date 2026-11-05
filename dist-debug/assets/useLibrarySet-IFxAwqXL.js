import { r as __toESM } from "./rolldown-runtime-SbdDWaPq.js";
import { A as useAuth, J as require_react } from "./dist-CiZ_rQl8.js";
import { r as getLibrary } from "./library-7WjW2so0.js";
// src/hooks/useLibrarySet.ts
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
/** Build a lookup key from a TMDB id + media type. */
function libKey(tmdbId, mediaType) {
	return `${tmdbId}-${mediaType}`;
}
/**
* Derive a LibrarySet from an already-loaded LibraryItem[].
* Zero extra network requests — use this on pages that already
* have libraryItems in state (e.g. HomePage).
*/
function buildLibrarySet(items) {
	return new Set(items.map((i) => libKey(i.tmdb_id, i.media_type)));
}
/**
* Hook that fetches the user's library and returns a LibrarySet.
* Only fetches when the user is signed in; returns an empty set otherwise.
* Use this on pages that don't already have libraryItems loaded.
*/
function useLibrarySet() {
	const { user } = useAuth();
	const [items, setItems] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		if (!user) {
			setItems([]);
			return;
		}
		getLibrary().then(setItems).catch(() => setItems([]));
	}, [user]);
	return (0, import_react.useMemo)(() => buildLibrarySet(items), [items]);
}
/**
* Filter a Movie[] to exclude items that are already in the library.
*
* @param movies    - The raw list from TMDB
* @param libSet    - LibrarySet from buildLibrarySet / useLibrarySet
* @param mediaType - The media type of the row ('movie' | 'tv')
*                    Pass 'auto' to read media_type from each item's own field.
*/
function excludeLibrary(movies, libSet, mediaType = "auto") {
	if (libSet.size === 0) return movies;
	return movies.filter((m) => {
		const type = mediaType === "auto" ? m.media_type === "tv" ? "tv" : "movie" : mediaType;
		return !libSet.has(libKey(m.id, type));
	});
}
export { excludeLibrary as n, useLibrarySet as r, buildLibrarySet as t };
