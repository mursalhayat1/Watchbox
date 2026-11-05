import { r as __toESM } from "./rolldown-runtime-SbdDWaPq.js";
import { J as require_react, K as useSearchParams, L as require_jsx_runtime, z as Link } from "./dist-CiZ_rQl8.js";
import { t as ArrowLeft } from "./arrow-left-w48oU94W.js";
import { t as Search } from "./search-B48WcWYH.js";
import { n as Navbar, t as Footer } from "./Footer-DJ1ZEBZc.js";
import { n as MovieCard, t as MovieCardSkeleton } from "./MovieCardSkeleton-DvLu1Noy.js";
import { t as Input } from "./input-DX_qP3JW.js";
import { v as searchMulti } from "./tmdb-D_Jm8xAZ.js";
import { a as generateStaticMetadata, t as PageMeta } from "./index-BqTDaTws.js";
// src/pages/SearchPage.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function SearchPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const [query, setQuery] = (0, import_react.useState)(searchParams.get("q") ?? "");
	const [results, setResults] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [searched, setSearched] = (0, import_react.useState)(false);
	const doSearch = async (q) => {
		if (!q.trim()) {
			setResults([]);
			return;
		}
		setLoading(true);
		setSearched(true);
		try {
			const data = await searchMulti(q);
			setResults(data.results.filter((m) => m.poster_path));
		} catch {
			setResults([]);
		} finally {
			setLoading(false);
		}
	};
	(0, import_react.useEffect)(() => {
		const q = searchParams.get("q");
		if (q) {
			setQuery(q);
			doSearch(q);
		}
	}, []);
	const handleSubmit = (e) => {
		e.preventDefault();
		setSearchParams(query ? { q: query } : {});
		doSearch(query);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col min-h-screen bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageMeta, { seo: generateStaticMetadata({
				title: "Search",
				description: "Search for movies, TV shows, and actors on WatchBox. Find exactly what you want to watch next.",
				path: "/search",
				robots: "noindex, follow"
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navbar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "pt-14 flex-1 max-w-screen-2xl mx-auto w-full px-4 md:px-6 py-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-4 mb-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/",
							className: "flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "w-4 h-4" }), " Home"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-xl md:text-2xl font-bold text-foreground",
							children: "Search"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleSubmit,
						className: "flex gap-3 mb-8 max-w-xl",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: query,
							onChange: (e) => setQuery(e.target.value),
							placeholder: "Search movies & TV shows...",
							className: "bg-secondary border-border text-foreground placeholder:text-muted-foreground flex-1",
							autoFocus: true
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "submit",
							className: "flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "w-4 h-4" }), " Search"]
						})]
					}),
					loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-3",
						children: Array.from({ length: 16 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MovieCardSkeleton, {}, i))
					}),
					!loading && searched && results.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-center py-20",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-muted-foreground text-lg",
							children: [
								"No results found for “",
								query,
								"”"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground mt-2",
							children: "Try a different search term"
						})]
					}),
					!loading && results.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted-foreground mb-4",
						children: [
							results.length,
							" results for “",
							query,
							"”"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-3",
						children: results.map((movie) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MovieCard, {
							movie,
							mediaType: movie.media_type === "tv" ? "tv" : "movie"
						}, movie.id))
					})] }),
					!searched && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-center py-20",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "w-12 h-12 text-muted-foreground mx-auto mb-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-muted-foreground",
							children: "Search for movies and TV shows"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, {})
		]
	});
}
export { SearchPage as default };
