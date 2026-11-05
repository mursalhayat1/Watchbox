import { r as __toESM } from "./rolldown-runtime-SbdDWaPq.js";
import { J as require_react } from "./dist-CiZ_rQl8.js";
import { a as removeFromLibrary, i as getLibraryItem, n as addToLibrary, o as updateLibraryNoteRating, r as getLibrary, s as updateLibraryStatus } from "./library-7WjW2so0.js";
// src/lib/libraryApi.ts
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
// src/hooks/useLibrary.ts
function useLibrary() {
	const [items, setItems] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)(null);
	const load = (0, import_react.useCallback)(async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await getLibrary();
			setItems(data);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed to load library");
		} finally {
			setLoading(false);
		}
	}, []);
	(0, import_react.useEffect)(() => {
		load();
	}, [load]);
	return {
		items,
		loading,
		error,
		reload: load,
		changeStatus: (0, import_react.useCallback)(async (id, status) => {
			await updateLibraryStatus(id, status);
			setItems((prev) => prev.map((it) => it.id === id ? {
				...it,
				status
			} : it));
		}, []),
		remove: (0, import_react.useCallback)(async (id) => {
			await removeFromLibrary(id);
			setItems((prev) => prev.filter((it) => it.id !== id));
		}, [])
	};
}
function useLibraryItem(tmdbId, mediaType) {
	const [item, setItem] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		setLoading(true);
		getLibraryItem(tmdbId, mediaType).then(setItem).catch(() => setItem(null)).finally(() => setLoading(false));
	}, [tmdbId, mediaType]);
	return {
		item,
		setItem,
		loading,
		add: (0, import_react.useCallback)(async (payload) => {
			await addToLibrary(payload);
			const updated = await getLibraryItem(tmdbId, mediaType);
			setItem(updated);
		}, [tmdbId, mediaType]),
		remove: (0, import_react.useCallback)(async () => {
			if (!item) return;
			await removeFromLibrary(item.id);
			setItem(null);
		}, [item]),
		changeStatus: (0, import_react.useCallback)(async (status) => {
			if (!item) return;
			await updateLibraryStatus(item.id, status);
			setItem((prev) => prev ? {
				...prev,
				status
			} : prev);
		}, [item]),
		saveNoteRating: (0, import_react.useCallback)(async (note, userRating) => {
			if (!item) return;
			await updateLibraryNoteRating(item.id, note, userRating);
			setItem((prev) => prev ? {
				...prev,
				note,
				user_rating: userRating
			} : prev);
		}, [item])
	};
}
export { useLibraryItem as n, useLibrary as t };
