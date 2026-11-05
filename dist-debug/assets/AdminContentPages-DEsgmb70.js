import { r as __toESM } from "./rolldown-runtime-SbdDWaPq.js";
import { J as require_react, L as require_jsx_runtime, z as Link } from "./dist-CiZ_rQl8.js";
import { t as Search } from "./search-B48WcWYH.js";
import { t as ExternalLink } from "./external-link-DerKKTRF.js";
import { t as Input } from "./input-DX_qP3JW.js";
import { t as Badge } from "./badge-CsydfRnh.js";
import { m as Skeleton } from "./index-BqTDaTws.js";
import { i as TabsTrigger, r as TabsList, t as Tabs } from "./tabs-D5Wvmc8_.js";
import { t as AdminLayout } from "./AdminLayout-RSqDNN0w.js";
import { S as tmdbImageUrl, h as getTrending, m as getTopRated, v as searchMulti, y as searchPerson } from "./tmdb-D_Jm8xAZ.js";
import { t as useDebounce } from "./use-debounce-CQhDhkOV.js";
import { r as useTMDBList } from "./useTMDB-iI3pS55R.js";
// src/pages/admin/AdminContentPages.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function ContentGrid({ items, loading, mediaType }) {
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3",
		children: Array.from({ length: 12 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "aspect-[2/3] rounded-lg" }, i))
	});
	if (items.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-center py-12 text-sm text-muted-foreground",
		children: "No results found"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3",
		children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: `/detail/${mediaType}/${item.id}`,
			target: "_blank",
			rel: "noopener noreferrer",
			className: "group relative rounded-lg overflow-hidden bg-muted/40 hover:bg-muted/70 transition-colors",
			children: [
				item.poster_path ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: tmdbImageUrl(item.poster_path, "w185") ?? "",
					alt: item.title || item.name,
					className: "w-full aspect-[2/3] object-cover",
					loading: "lazy"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "w-full aspect-[2/3] flex items-center justify-center bg-muted text-muted-foreground text-xs text-center p-2",
					children: item.title || item.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-white text-[10px] font-medium truncate",
							children: item.title || item.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1 mt-0.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								variant: "secondary",
								className: "text-[9px] px-1 py-0 bg-black/60 text-white border-0",
								children: ["★ ", item.vote_average?.toFixed(1)]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "w-2.5 h-2.5 text-white/80" })]
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[10px] text-muted-foreground p-1.5 truncate",
					children: item.title || item.name
				})
			]
		}, item.id))
	});
}
function MoviesBrowser() {
	const [subTab, setSubTab] = (0, import_react.useState)("trending");
	const [query, setQuery] = (0, import_react.useState)("");
	const debouncedQuery = useDebounce(query, 400);
	const [searchResults, setSearchResults] = (0, import_react.useState)([]);
	const [searching, setSearching] = (0, import_react.useState)(false);
	const { movies: trending, loading: tLoading } = useTMDBList(() => getTrending("movie"));
	const { movies: topRated, loading: trLoading } = useTMDBList(() => getTopRated("movie"));
	(0, import_react.useEffect)(() => {
		if (!debouncedQuery.trim()) {
			setSearchResults([]);
			return;
		}
		setSearching(true);
		searchMulti(debouncedQuery).then((r) => setSearchResults(r.results ?? [])).catch(() => setSearchResults([])).finally(() => setSearching(false));
	}, [debouncedQuery]);
	const isSearching = debouncedQuery.trim().length > 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col md:flex-row items-start md:items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative flex-1 min-w-0 w-full md:max-w-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "Search movies…",
					value: query,
					onChange: (e) => setQuery(e.target.value),
					className: "pl-8 h-8 text-sm"
				})]
			}), !isSearching && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
				value: subTab,
				onValueChange: (v) => setSubTab(v),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
					className: "h-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: "trending",
						className: "text-xs",
						children: "Trending"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: "top_rated",
						className: "text-xs",
						children: "Top Rated"
					})]
				})
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContentGrid, {
			items: isSearching ? searchResults : subTab === "trending" ? trending : topRated,
			loading: isSearching ? searching : subTab === "trending" ? tLoading : trLoading,
			mediaType: "movies"
		})]
	});
}
function TVBrowser() {
	const [subTab, setSubTab] = (0, import_react.useState)("trending");
	const [query, setQuery] = (0, import_react.useState)("");
	const debouncedQuery = useDebounce(query, 400);
	const [searchResults, setSearchResults] = (0, import_react.useState)([]);
	const [searching, setSearching] = (0, import_react.useState)(false);
	const { movies: trending, loading: tLoading } = useTMDBList(() => getTrending("tv"));
	const { movies: topRated, loading: trLoading } = useTMDBList(() => getTopRated("tv"));
	(0, import_react.useEffect)(() => {
		if (!debouncedQuery.trim()) {
			setSearchResults([]);
			return;
		}
		setSearching(true);
		searchMulti(debouncedQuery).then((r) => setSearchResults((r.results ?? []).filter((m) => m.media_type === "tv"))).catch(() => setSearchResults([])).finally(() => setSearching(false));
	}, [debouncedQuery]);
	const isSearching = debouncedQuery.trim().length > 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col md:flex-row items-start md:items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative flex-1 min-w-0 w-full md:max-w-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "Search TV shows…",
					value: query,
					onChange: (e) => setQuery(e.target.value),
					className: "pl-8 h-8 text-sm"
				})]
			}), !isSearching && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
				value: subTab,
				onValueChange: (v) => setSubTab(v),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
					className: "h-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: "trending",
						className: "text-xs",
						children: "Trending"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: "top_rated",
						className: "text-xs",
						children: "Top Rated"
					})]
				})
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContentGrid, {
			items: isSearching ? searchResults : subTab === "trending" ? trending : topRated,
			loading: isSearching ? searching : subTab === "trending" ? tLoading : trLoading,
			mediaType: "tv"
		})]
	});
}
function ActorsBrowser() {
	const [query, setQuery] = (0, import_react.useState)("");
	const debouncedQuery = useDebounce(query, 400);
	const [results, setResults] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!debouncedQuery.trim()) {
			setResults([]);
			return;
		}
		setLoading(true);
		searchPerson(debouncedQuery).then((r) => setResults(r.results ?? [])).catch(() => setResults([])).finally(() => setLoading(false));
	}, [debouncedQuery]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative w-full md:max-w-xs",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				placeholder: "Search actors…",
				value: query,
				onChange: (e) => setQuery(e.target.value),
				className: "pl-8 h-8 text-sm"
			})]
		}), !debouncedQuery.trim() ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground py-8 text-center",
			children: "Type a name to search for actors"
		}) : loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3",
			children: Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "aspect-[2/3] rounded-lg" }, i))
		}) : results.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-center py-8 text-sm text-muted-foreground",
			children: "No actors found"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3",
			children: results.map((actor) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: `/person/${actor.id}`,
				className: "group rounded-lg overflow-hidden bg-muted/40 hover:bg-muted/70 transition-colors",
				children: [actor.profile_path ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: tmdbImageUrl(actor.profile_path, "w185") ?? "",
					alt: actor.name,
					className: "w-full aspect-[2/3] object-cover",
					loading: "lazy"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "w-full aspect-[2/3] bg-muted flex items-center justify-center text-muted-foreground text-2xl font-bold",
					children: (actor.name ?? "?").charAt(0)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10px] font-medium truncate",
						children: actor.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[9px] text-muted-foreground truncate",
						children: actor.known_for_department
					})]
				})]
			}, actor.id))
		})]
	});
}
function AdminMoviesPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminLayout, {
		title: "Movies",
		breadcrumbs: [{ label: "Content" }, { label: "Movies" }],
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoviesBrowser, {})
	});
}
function AdminTVPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminLayout, {
		title: "TV Shows",
		breadcrumbs: [{ label: "Content" }, { label: "TV Shows" }],
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TVBrowser, {})
	});
}
function AdminActorsPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminLayout, {
		title: "Actors",
		breadcrumbs: [{ label: "Content" }, { label: "Actors" }],
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActorsBrowser, {})
	});
}
export { AdminActorsPage, AdminMoviesPage, AdminTVPage };
