const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/tmdb-D_Jm8xAZ.js","assets/rolldown-runtime-SbdDWaPq.js","assets/runtime-config-BtSr0Ory.js"])))=>i.map(i=>d[i]);
import { r as __toESM } from "./rolldown-runtime-SbdDWaPq.js";
import { J as require_react } from "./dist-CiZ_rQl8.js";
import { p as __vitePreload } from "./index-BqTDaTws.js";
// src/hooks/useTMDB.ts
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
function useAsync(fetchFn, deps = []) {
	const [data, setData] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)(null);
	const mountedRef = (0, import_react.useRef)(true);
	(0, import_react.useEffect)(() => {
		mountedRef.current = true;
		setLoading(true);
		setError(null);
		fetchFn().then((result) => {
			if (mountedRef.current) {
				setData(result);
				setLoading(false);
			}
		}).catch((err) => {
			if (mountedRef.current) {
				setError(err instanceof Error ? err.message : "An error occurred");
				setLoading(false);
			}
		});
		return () => {
			mountedRef.current = false;
		};
	}, deps);
	return {
		data,
		loading,
		error
	};
}
function useTMDBList(fetchFn, deps = []) {
	const { data, loading, error } = useAsync(fetchFn, deps);
	return {
		movies: data?.results ?? [],
		loading,
		error
	};
}
function useMovieSearch(query) {
	const [results, setResults] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const debounceRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (!query.trim()) {
			setResults([]);
			return;
		}
		if (debounceRef.current) clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(async () => {
			setLoading(true);
			try {
				const { searchMulti } = await __vitePreload(async () => {
					const { searchMulti } = await import("./tmdb-D_Jm8xAZ.js").then((n) => n.T);
					return { searchMulti };
				}, __vite__mapDeps([0,1,2]));
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
	return {
		results,
		loading
	};
}
export { useMovieSearch as n, useTMDBList as r, useAsync as t };
