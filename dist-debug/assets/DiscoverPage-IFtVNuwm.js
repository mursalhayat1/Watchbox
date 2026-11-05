import { r as __toESM } from "./rolldown-runtime-SbdDWaPq.js";
import { J as require_react, L as require_jsx_runtime, W as useNavigate, z as Link } from "./dist-CiZ_rQl8.js";
import { t as Search } from "./search-B48WcWYH.js";
import { t as X } from "./x-DnkSYaUr.js";
import { t as createLucideIcon } from "./createLucideIcon-CdXsxZqL.js";
import { t as ChevronDown } from "./chevron-down-dH9xOy80.js";
import { t as ChevronUp } from "./chevron-up-D5izdcCq.js";
import { t as Film } from "./film-uoMQFx7L.js";
import { t as Tv } from "./tv-CASs2yUo.js";
import { n as Navbar, r as Sparkles, t as Footer } from "./Footer-DJ1ZEBZc.js";
import { t as User } from "./user-Bo4eTJUg.js";
import { t as Star } from "./star-CXxyzINu.js";
import { t as LoaderCircle } from "./loader-circle-CB8huMWq.js";
import { t as Silk } from "./Silk-D_eXH-HI.js";
import { t as CarouselRow } from "./CarouselRow-CApptQNT.js";
import { n as MovieCard, t as MovieCardSkeleton } from "./MovieCardSkeleton-DvLu1Noy.js";
import { r as useTMDBList } from "./useTMDB-iI3pS55R.js";
import { S as tmdbImageUrl, _ as searchKeywords, d as getTVGenres, g as getUpcomingMovies, h as getTrending, i as getMovieGenres, m as getTopRated, n as getAnime, s as getPopularTV, t as discoverFiltered, v as searchMulti, y as searchPerson } from "./tmdb-D_Jm8xAZ.js";
import { a as generateStaticMetadata, t as PageMeta } from "./index-BqTDaTws.js";
/**
* @license lucide-react v0.576.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var SlidersHorizontal = createLucideIcon("sliders-horizontal", [
	["path", {
		d: "M10 5H3",
		key: "1qgfaw"
	}],
	["path", {
		d: "M12 19H3",
		key: "yhmn1j"
	}],
	["path", {
		d: "M14 3v4",
		key: "1sua03"
	}],
	["path", {
		d: "M16 17v4",
		key: "1q0r14"
	}],
	["path", {
		d: "M21 12h-9",
		key: "1o4lsq"
	}],
	["path", {
		d: "M21 19h-5",
		key: "1rlt1p"
	}],
	["path", {
		d: "M21 5h-7",
		key: "1oszz2"
	}],
	["path", {
		d: "M8 10v4",
		key: "tgpxqk"
	}],
	["path", {
		d: "M8 12H3",
		key: "a7s4jb"
	}]
]);
// src/pages/DiscoverPage.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var EMPTY_FILTERS = {
	genre: "",
	country: "",
	provider: "",
	year: "",
	sortBy: "hottest"
};
var PROVIDERS = [
	{
		value: "8",
		label: "Netflix"
	},
	{
		value: "9",
		label: "Prime Video"
	},
	{
		value: "337",
		label: "Disney+"
	},
	{
		value: "350",
		label: "Apple TV+"
	},
	{
		value: "15",
		label: "Hulu"
	},
	{
		value: "1899",
		label: "Max"
	},
	{
		value: "386",
		label: "Peacock"
	},
	{
		value: "531",
		label: "Paramount+"
	},
	{
		value: "283",
		label: "Crunchyroll"
	},
	{
		value: "2",
		label: "Apple iTunes"
	},
	{
		value: "3",
		label: "Google Play"
	}
];
var COUNTRIES = [
	{
		value: "US",
		label: "United States"
	},
	{
		value: "GB",
		label: "United Kingdom"
	},
	{
		value: "KR",
		label: "Korea"
	},
	{
		value: "JP",
		label: "Japan"
	},
	{
		value: "PK",
		label: "Pakistan"
	},
	{
		value: "IN",
		label: "India"
	},
	{
		value: "CN",
		label: "China"
	},
	{
		value: "FR",
		label: "France"
	},
	{
		value: "DE",
		label: "Germany"
	},
	{
		value: "TH",
		label: "Thailand"
	},
	{
		value: "TR",
		label: "Turkey"
	},
	{
		value: "IT",
		label: "Italy"
	},
	{
		value: "ES",
		label: "Spain"
	}
];
var YEARS = [
	"2026",
	"2025",
	"2024",
	"2023",
	"2022",
	"2021",
	"2020",
	"2010s",
	"2000s",
	"1990s",
	"1980s"
];
var SORT_OPTIONS = [
	{
		value: "hottest",
		label: "Hottest"
	},
	{
		value: "release_date.desc",
		label: "Latest"
	},
	{
		value: "vote_average.desc",
		label: "Rating"
	},
	{
		value: "popularity.desc",
		label: "Trending"
	}
];
function Chip({ active, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		onClick,
		className: "px-3 py-1 rounded-full text-xs font-medium transition-all duration-150 shrink-0",
		style: active ? {
			background: "rgba(255,255,255,0.95)",
			color: "#000"
		} : {
			background: "rgba(255,255,255,0.06)",
			color: "rgba(255,255,255,0.65)",
			border: "1px solid rgba(255,255,255,0.13)"
		},
		children
	});
}
function FilterPanel({ open, filters, setFilter, onReset, movieGenres, tvGenres, contentType }) {
	const [expanded, setExpanded] = (0, import_react.useState)({
		genre: true,
		country: true,
		provider: true,
		year: true,
		sort: true
	});
	const toggle = (s) => setExpanded((p) => ({
		...p,
		[s]: !p[s]
	}));
	const genres = contentType === "movies" ? movieGenres : tvGenres;
	if (!open) return null;
	const sectionCls = "rounded-2xl px-5 py-4 mb-2";
	const sectionStyle = {
		background: "rgba(255,255,255,0.05)",
		border: "1px solid rgba(255,255,255,0.10)",
		backdropFilter: "blur(20px)"
	};
	const headerCls = "flex items-center justify-between mb-3 cursor-pointer select-none";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: sectionCls,
				style: sectionStyle,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: headerCls,
					onClick: () => toggle("genre"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-2 text-sm font-semibold text-white",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Film, { className: "w-4 h-4 text-white/50" }), " Genre"]
					}), expanded.genre ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "w-4 h-4 text-white/40" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "w-4 h-4 text-white/40" })]
				}), expanded.genre && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
						active: !filters.genre,
						onClick: () => setFilter("genre")(""),
						children: "All"
					}), genres.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
						active: filters.genre === String(g.id),
						onClick: () => setFilter("genre")(String(g.id)),
						children: g.name
					}, g.id))]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: sectionCls,
				style: sectionStyle,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: headerCls,
					onClick: () => toggle("country"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-2 text-sm font-semibold text-white",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "w-4 h-4 text-white/50 text-base leading-none",
							children: "🌐"
						}), " Country"]
					}), expanded.country ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "w-4 h-4 text-white/40" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "w-4 h-4 text-white/40" })]
				}), expanded.country && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
						active: !filters.country,
						onClick: () => setFilter("country")(""),
						children: "All"
					}), COUNTRIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
						active: filters.country === c.value,
						onClick: () => setFilter("country")(c.value),
						children: c.label
					}, c.value))]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: sectionCls,
				style: sectionStyle,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: headerCls,
					onClick: () => toggle("provider"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-2 text-sm font-semibold text-white",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tv, { className: "w-4 h-4 text-white/50" }), " Provider"]
					}), expanded.provider ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "w-4 h-4 text-white/40" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "w-4 h-4 text-white/40" })]
				}), expanded.provider && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
						active: !filters.provider,
						onClick: () => setFilter("provider")(""),
						children: "All"
					}), PROVIDERS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
						active: filters.provider === p.value,
						onClick: () => setFilter("provider")(p.value),
						children: p.label
					}, p.value))]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: sectionCls,
				style: sectionStyle,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: headerCls,
					onClick: () => toggle("year"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-2 text-sm font-semibold text-white",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "w-4 h-4 text-white/50 text-base leading-none",
							children: "📅"
						}), " Year"]
					}), expanded.year ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "w-4 h-4 text-white/40" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "w-4 h-4 text-white/40" })]
				}), expanded.year && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
						active: !filters.year,
						onClick: () => setFilter("year")(""),
						children: "All"
					}), YEARS.map((y) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
						active: filters.year === y,
						onClick: () => setFilter("year")(y),
						children: y
					}, y))]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: sectionCls,
				style: sectionStyle,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: headerCls,
					onClick: () => toggle("sort"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-2 text-sm font-semibold text-white",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "w-4 h-4 text-white/50 text-base leading-none",
							children: "↕"
						}), " Sort by"]
					}), expanded.sort ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "w-4 h-4 text-white/40" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "w-4 h-4 text-white/40" })]
				}), expanded.sort && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-2",
					children: SORT_OPTIONS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
						active: filters.sortBy === s.value,
						onClick: () => setFilter("sortBy")(s.value),
						children: s.label
					}, s.value))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: onReset,
				className: "w-full text-center text-sm py-3 transition-colors",
				style: { color: "rgba(255,255,255,0.40)" },
				onMouseEnter: (e) => e.currentTarget.style.color = "rgba(255,255,255,0.80)",
				onMouseLeave: (e) => e.currentTarget.style.color = "rgba(255,255,255,0.40)",
				children: "Reset Filters"
			})
		]
	});
}
var glassSurface = {
	background: "rgba(255,255,255,0.06)",
	border: "1px solid rgba(255,255,255,0.12)",
	backdropFilter: "blur(20px) saturate(160%)",
	WebkitBackdropFilter: "blur(20px) saturate(160%)"
};
function PeopleRow({ people }) {
	if (people.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mb-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[10px] font-semibold tracking-widest uppercase mb-3",
			style: { color: "rgba(255,255,255,0.38)" },
			children: "People"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex gap-4 overflow-x-auto pb-2",
			style: { scrollbarWidth: "none" },
			children: people.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: `/person/${p.id}`,
				className: "shrink-0 flex flex-col items-center gap-2 w-20",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-16 h-16 rounded-full overflow-hidden border-2 border-white/15",
						style: { background: "rgba(255,255,255,0.08)" },
						children: p.profile_path ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: tmdbImageUrl(p.profile_path, "w185") ?? "",
							alt: p.name,
							className: "w-full h-full object-cover"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "w-full h-full flex items-center justify-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "w-7 h-7 text-white/30" })
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] text-white/80 text-center leading-tight line-clamp-2",
						children: p.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10px] text-white/35",
						children: p.known_for_department ?? "Acting"
					})
				]
			}, p.id))
		})]
	});
}
function SearchResults({ query, tab }) {
	const [results, setResults] = (0, import_react.useState)([]);
	const [people, setPeople] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [loadingMore, setMore] = (0, import_react.useState)(false);
	const [page, setPage] = (0, import_react.useState)(1);
	const [totalPages, setTotalPg] = (0, import_react.useState)(1);
	const [totalResults, setTotal] = (0, import_react.useState)(0);
	const sentinelRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (!query.trim()) return;
		let cancelled = false;
		setLoading(true);
		setPage(1);
		setResults([]);
		setPeople([]);
		Promise.allSettled([searchMulti(query, "1"), tab === "all" ? searchPerson(query) : Promise.resolve({ results: [] })]).then(([multiRes, personRes]) => {
			if (cancelled) return;
			if (multiRes.status === "fulfilled") {
				const filtered = filterByTab(multiRes.value.results ?? [], tab);
				setResults(filtered);
				setTotal(multiRes.value.total_results ?? filtered.length);
				setTotalPg(multiRes.value.total_pages ?? 1);
			}
			if (personRes.status === "fulfilled") setPeople(personRes.value.results ?? []);
		}).finally(() => {
			if (!cancelled) setLoading(false);
		});
		return () => {
			cancelled = true;
		};
	}, [query, tab]);
	const loadMore = (0, import_react.useCallback)(() => {
		if (loadingMore || page >= totalPages) return;
		const nextPage = page + 1;
		setMore(true);
		searchMulti(query, String(nextPage)).then((data) => {
			const all = data.results ?? [];
			setResults((prev) => {
				const ids = new Set(prev.map((r) => r.id));
				return [...prev, ...filterByTab(all, tab).filter((r) => !ids.has(r.id))];
			});
			setPage(nextPage);
		}).finally(() => setMore(false));
	}, [
		loadingMore,
		page,
		totalPages,
		query,
		tab
	]);
	(0, import_react.useEffect)(() => {
		const el = sentinelRef.current;
		if (!el) return;
		const obs = new IntersectionObserver((entries) => {
			if (entries[0].isIntersecting) loadMore();
		}, { rootMargin: "200px" });
		obs.observe(el);
		return () => obs.disconnect();
	}, [loadMore]);
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-2 md:grid-cols-5 gap-3",
		children: Array.from({ length: 18 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MovieCardSkeleton, {}, i))
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PeopleRow, { people }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-[10px] font-semibold tracking-widest uppercase mb-4",
			style: { color: "rgba(255,255,255,0.38)" },
			children: [
				totalResults.toLocaleString(),
				" Results for \"",
				query,
				"\""
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-2 md:grid-cols-5 gap-3",
			children: [results.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MovieCard, {
				movie: item,
				mediaType: item.media_type === "tv" ? "tv" : "movie"
			}, item.id)), results.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "col-span-full text-white/40 text-sm py-10 text-center",
				children: [
					"No results found for \"",
					query,
					"\"."
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: sentinelRef,
			className: "h-8 flex items-center justify-center mt-4",
			children: loadingMore && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "w-5 h-5 animate-spin text-white/40" })
		})
	] });
}
function FilteredResults({ filters, contentType, keywords }) {
	const [items, setItems] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [loadMore, setMore] = (0, import_react.useState)(false);
	const [page, setPage] = (0, import_react.useState)(0);
	const [totalPg, setTotalPg] = (0, import_react.useState)(1);
	const sentinelRef = (0, import_react.useRef)(null);
	const filtersKey = JSON.stringify({
		filters,
		contentType,
		keywords
	});
	const prevKey = (0, import_react.useRef)("");
	const mediaType = contentType === "movies" ? "movie" : contentType === "anime" ? "tv" : "tv";
	const resolvedSort = filters.sortBy === "hottest" ? "popularity.desc" : filters.sortBy || "popularity.desc";
	const yearForApi = (y) => {
		if (y === "2010s") return "2010";
		if (y === "2000s") return "2000";
		if (y === "1990s") return "1990";
		if (y === "1980s") return "1980";
		return y;
	};
	const fetchPage = (0, import_react.useCallback)(async (pg, append) => {
		if (pg === 1) setLoading(true);
		else setMore(true);
		try {
			const data = await discoverFiltered({
				mediaType,
				genre: filters.genre,
				year: yearForApi(filters.year),
				sortBy: resolvedSort,
				provider: filters.provider,
				region: filters.country,
				page: String(pg),
				anime: contentType === "anime",
				keywords
			});
			const fresh = data.results ?? [];
			setItems((prev) => {
				if (!append) return fresh;
				const ids = new Set(prev.map((r) => r.id));
				return [...prev, ...fresh.filter((r) => !ids.has(r.id))];
			});
			setTotalPg(data.total_pages ?? 1);
			setPage(pg);
		} finally {
			setLoading(false);
			setMore(false);
		}
	}, [filtersKey]);
	(0, import_react.useEffect)(() => {
		if (prevKey.current === filtersKey) return;
		prevKey.current = filtersKey;
		setItems([]);
		setPage(0);
		setTotalPg(1);
		(async () => {
			setLoading(true);
			try {
				const opts = {
					mediaType,
					genre: filters.genre,
					year: yearForApi(filters.year),
					sortBy: resolvedSort,
					provider: filters.provider,
					region: filters.country,
					anime: contentType === "anime",
					keywords
				};
				const [d1, d2] = await Promise.all([discoverFiltered({
					...opts,
					page: "1"
				}), discoverFiltered({
					...opts,
					page: "2"
				})]);
				const combined = [...d1.results ?? [], ...d2.results ?? []];
				const ids = /* @__PURE__ */ new Set();
				setItems(combined.filter((r) => {
					if (ids.has(r.id)) return false;
					ids.add(r.id);
					return true;
				}));
				setTotalPg(d1.total_pages ?? 1);
				setPage(2);
			} finally {
				setLoading(false);
			}
		})();
	}, [filtersKey]);
	const handleLoadMore = (0, import_react.useCallback)(() => {
		if (loadMore || loading || page === 0 || page >= totalPg) return;
		fetchPage(page + 1, true);
	}, [
		loadMore,
		loading,
		page,
		totalPg,
		fetchPage
	]);
	(0, import_react.useEffect)(() => {
		const el = sentinelRef.current;
		if (!el) return;
		const obs = new IntersectionObserver((entries) => {
			if (entries[0].isIntersecting) handleLoadMore();
		}, { rootMargin: "300px" });
		obs.observe(el);
		return () => obs.disconnect();
	}, [handleLoadMore]);
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-2 md:grid-cols-5 gap-3",
		children: Array.from({ length: 20 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MovieCardSkeleton, {}, i))
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-[10px] font-semibold tracking-widest uppercase mb-4",
			style: { color: "rgba(255,255,255,0.38)" },
			children: [items.length, " Loaded"]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-2 md:grid-cols-5 gap-3",
			children: [items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MovieCard, {
				movie: item,
				mediaType
			}, item.id)), items.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "col-span-full text-white/40 text-sm py-10 text-center",
				children: "No results found for selected filters."
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: sentinelRef,
			className: "h-8 flex items-center justify-center mt-4",
			children: loadMore && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "w-5 h-5 animate-spin text-white/40" })
		})
	] });
}
function filterByTab(items, tab) {
	if (tab === "movies") return items.filter((r) => r.media_type === "movie");
	if (tab === "series") return items.filter((r) => r.media_type === "tv");
	if (tab === "anime") return items.filter((r) => r.media_type === "tv");
	return items.filter((r) => r.media_type !== "person");
}
function SearchSuggestions({ suggestions, onSelect, visible }) {
	if (!visible || suggestions.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-50",
		style: {
			background: "rgba(8,16,24,0.98)",
			border: "1px solid rgba(255,255,255,0.10)",
			backdropFilter: "blur(24px)",
			boxShadow: "0 8px 32px rgba(0,0,0,0.6)"
		},
		children: suggestions.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onMouseDown: (e) => {
				e.preventDefault();
				onSelect(s);
			},
			className: "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-white/8",
			style: { borderBottom: i < suggestions.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" },
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "shrink-0 w-4 flex items-center justify-center",
				children: s.isKeyword || s.mediaType === "keyword" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
					className: "w-3.5 h-3.5",
					style: { color: "rgba(255,255,255,0.35)" }
				}) : s.mediaType === "person" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, {
					className: "w-3.5 h-3.5",
					style: { color: "rgba(255,255,255,0.35)" }
				}) : s.mediaType === "tv" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tv, {
					className: "w-3.5 h-3.5",
					style: { color: "rgba(255,255,255,0.35)" }
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Film, {
					className: "w-3.5 h-3.5",
					style: { color: "rgba(255,255,255,0.35)" }
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "flex-1 min-w-0 text-sm truncate",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-semibold text-white",
					children: s.label
				}), s.category && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					style: { color: "rgba(255,255,255,0.40)" },
					children: [" ", s.category]
				})]
			})]
		}, `${s.mediaType}-${s.id}-${i}`))
	});
}
function AllRows() {
	const t = (0, import_react.useCallback)(() => getTrending("all"), []);
	const th = (0, import_react.useCallback)(() => discoverFiltered({
		mediaType: "movie",
		sortBy: "popularity.desc"
	}), []);
	const tr = (0, import_react.useCallback)(() => getTopRated("movie"), []);
	const tv = (0, import_react.useCallback)(() => getPopularTV(), []);
	const up = (0, import_react.useCallback)(() => getUpcomingMovies(), []);
	const { movies: trending, loading: l1 } = useTMDBList(t, []);
	const { movies: theaters, loading: l2 } = useTMDBList(th, []);
	const { movies: topRated, loading: l3 } = useTMDBList(tr, []);
	const { movies: popular, loading: l4 } = useTMDBList(tv, []);
	const { movies: upcoming, loading: l5 } = useTMDBList(up, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CarouselRow, {
				title: "Trending Now",
				movies: trending,
				loading: l1,
				mediaType: "movie"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CarouselRow, {
				title: "Now In Theaters",
				movies: theaters,
				loading: l2,
				mediaType: "movie"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CarouselRow, {
				title: "Top Rated Movies",
				movies: topRated,
				loading: l3,
				mediaType: "movie"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CarouselRow, {
				title: "Popular TV Shows",
				movies: popular,
				loading: l4,
				mediaType: "tv"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CarouselRow, {
				title: "Upcoming Releases",
				movies: upcoming,
				loading: l5,
				mediaType: "movie"
			})
		]
	});
}
function MoviesRows() {
	const t = (0, import_react.useCallback)(() => getTrending("movie"), []);
	const r = (0, import_react.useCallback)(() => getTopRated("movie"), []);
	const u = (0, import_react.useCallback)(() => getUpcomingMovies(), []);
	const { movies: trending, loading: l1 } = useTMDBList(t, []);
	const { movies: topRated, loading: l2 } = useTMDBList(r, []);
	const { movies: upcoming, loading: l3 } = useTMDBList(u, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CarouselRow, {
				title: "Trending Movies",
				movies: trending,
				loading: l1,
				mediaType: "movie"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CarouselRow, {
				title: "Top Rated Movies",
				movies: topRated,
				loading: l2,
				mediaType: "movie"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CarouselRow, {
				title: "Upcoming Releases",
				movies: upcoming,
				loading: l3,
				mediaType: "movie"
			})
		]
	});
}
function SeriesRows() {
	const t = (0, import_react.useCallback)(() => getTrending("tv"), []);
	const p = (0, import_react.useCallback)(() => getPopularTV(), []);
	const r = (0, import_react.useCallback)(() => getTopRated("tv"), []);
	const { movies: trending, loading: l1 } = useTMDBList(t, []);
	const { movies: popular, loading: l2 } = useTMDBList(p, []);
	const { movies: topRated, loading: l3 } = useTMDBList(r, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CarouselRow, {
				title: "Trending Series",
				movies: trending,
				loading: l1,
				mediaType: "tv"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CarouselRow, {
				title: "Popular TV Shows",
				movies: popular,
				loading: l2,
				mediaType: "tv"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CarouselRow, {
				title: "Top Rated Shows",
				movies: topRated,
				loading: l3,
				mediaType: "tv"
			})
		]
	});
}
function AnimeRows() {
	const p = (0, import_react.useCallback)(() => getAnime(), []);
	const r = (0, import_react.useCallback)(() => getAnime("1", {
		sort_by: "vote_average.desc",
		"vote_count.gte": "200"
	}), []);
	const { movies: popular, loading: l1 } = useTMDBList(p, []);
	const { movies: topRated, loading: l2 } = useTMDBList(r, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CarouselRow, {
			title: "Popular Anime",
			movies: popular,
			loading: l1,
			mediaType: "tv"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CarouselRow, {
			title: "Top Rated Anime",
			movies: topRated,
			loading: l2,
			mediaType: "tv"
		})]
	});
}
function TabButton({ active, onClick, icon, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		onClick,
		className: "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 shrink-0",
		style: active ? {
			background: "rgba(255,255,255,0.95)",
			color: "#000"
		} : {
			background: "transparent",
			color: "rgba(255,255,255,0.55)",
			border: "1px solid rgba(255,255,255,0.15)"
		},
		children: [icon, label]
	});
}
function DiscoverPage() {
	const navigate = useNavigate();
	const [tab, setTab] = (0, import_react.useState)("all");
	const [searchInput, setSearchInput] = (0, import_react.useState)("");
	const [activeQuery, setActiveQuery] = (0, import_react.useState)("");
	const [filterOpen, setFilterOpen] = (0, import_react.useState)(false);
	const [filters, setFilters] = (0, import_react.useState)(EMPTY_FILTERS);
	const [movieGenres, setMovieGenres] = (0, import_react.useState)([]);
	const [tvGenres, setTvGenres] = (0, import_react.useState)([]);
	const [keywordIds, setKeywordIds] = (0, import_react.useState)("");
	const [keywordLabel, setKeywordLabel] = (0, import_react.useState)("");
	const [suggestions, setSuggestions] = (0, import_react.useState)([]);
	const [sugLoading, setSugLoading] = (0, import_react.useState)(false);
	const [showSug, setShowSug] = (0, import_react.useState)(false);
	const inputRef = (0, import_react.useRef)(null);
	const searchWrapRef = (0, import_react.useRef)(null);
	const debounceRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		getMovieGenres().then((d) => setMovieGenres(d.genres)).catch(() => {});
		getTVGenres().then((d) => setTvGenres(d.genres)).catch(() => {});
	}, []);
	(0, import_react.useEffect)(() => {
		const handler = (e) => {
			if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) setShowSug(false);
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);
	(0, import_react.useEffect)(() => {
		if (debounceRef.current) clearTimeout(debounceRef.current);
		const q = searchInput.trim();
		if (!q) {
			setSuggestions([]);
			setShowSug(false);
			return;
		}
		debounceRef.current = setTimeout(() => {
			setSugLoading(true);
			Promise.allSettled([searchMulti(q, "1"), searchKeywords(q)]).then(([multiRes, kwRes]) => {
				const items = [];
				if (multiRes.status === "fulfilled") {
					const raw = (multiRes.value.results ?? []).slice(0, 5);
					for (const r of raw) {
						const mt = r.media_type === "tv" ? "tv" : r.media_type === "person" ? "person" : "movie";
						const cat = mt === "person" ? "in People" : mt === "tv" ? "in TV Shows" : "in Movies";
						items.push({
							id: r.id,
							label: r.title ?? r.name ?? "",
							category: cat,
							mediaType: mt
						});
					}
				}
				if (kwRes.status === "fulfilled") {
					const kws = (kwRes.value.results ?? []).slice(0, 5);
					for (const kw of kws) items.push({
						id: kw.id,
						label: kw.name,
						category: "",
						mediaType: "keyword",
						isKeyword: true
					});
				}
				setSuggestions(items);
				setShowSug(items.length > 0);
			}).catch(() => setSuggestions([])).finally(() => setSugLoading(false));
		}, 280);
		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
		};
	}, [searchInput]);
	(0, import_react.useEffect)(() => {
		const q = searchInput.trim();
		if (!q) {
			setActiveQuery("");
			return;
		}
		if (keywordIds && searchInput === keywordLabel) return;
		const t = setTimeout(() => setActiveQuery(q), 600);
		return () => clearTimeout(t);
	}, [
		searchInput,
		keywordIds,
		keywordLabel
	]);
	const setFilter = (k) => (v) => setFilters((prev) => ({
		...prev,
		[k]: v
	}));
	const hasFilters = Object.entries(filters).some(([k, v]) => k === "sortBy" ? v !== "hottest" : Boolean(v));
	const activeFilterCount = Object.entries(filters).filter(([k, v]) => k === "sortBy" ? v !== "hottest" : Boolean(v)).length;
	const clearSearch = () => {
		setSearchInput("");
		setActiveQuery("");
		setKeywordIds("");
		setKeywordLabel("");
		setSuggestions([]);
		setShowSug(false);
		inputRef.current?.focus();
	};
	const handleSuggestionSelect = (s) => {
		setShowSug(false);
		if (s.mediaType === "person") {
			navigate(`/person/${s.id}`);
			return;
		}
		if (s.isKeyword || s.mediaType === "keyword") {
			setSearchInput(s.label);
			setKeywordLabel(s.label);
			setKeywordIds(String(s.id));
			setActiveQuery("");
			setFilterOpen(false);
			return;
		}
		setKeywordIds("");
		setKeywordLabel("");
		setSearchInput(s.label);
		setActiveQuery(s.label);
		setFilterOpen(false);
	};
	const isKeywordMode = Boolean(keywordIds);
	const showSearch = Boolean(activeQuery) && !isKeywordMode;
	const showFiltered = !showSearch && (hasFilters || isKeywordMode);
	const showDefault = !showSearch && !showFiltered;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "section-title-xl relative flex flex-col min-h-screen bg-[#050a0e] overflow-x-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageMeta, { seo: generateStaticMetadata({
				title: "Discover",
				description: "Explore movies and TV shows by genre, year, rating, and language. Find your next favourite title on WatchBox.",
				path: "/discover"
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "fixed inset-0 z-0 pointer-events-none",
				"aria-hidden": "true",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Silk, {
						color: "#0e7490",
						speed: 3.5,
						scale: 1.4,
						noiseIntensity: 1.2,
						rotation: .3,
						lightMode: false
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-0",
						style: { background: "linear-gradient(160deg, rgba(0,18,26,0.84) 0%, rgba(0,12,20,0.90) 40%, rgba(0,8,16,0.94) 100%)" }
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute top-0 left-0 w-[600px] h-[400px]",
						style: { background: "radial-gradient(ellipse at 0% 0%, rgba(6,182,212,0.12) 0%, transparent 70%)" }
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navbar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "relative z-10 flex-1 pt-20 pb-20 md:pb-16 max-w-screen-2xl mx-auto w-full px-4 md:px-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						ref: searchWrapRef,
						className: "relative mt-6 mb-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3 px-4 py-2.5 rounded-xl",
							style: glassSurface,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
									className: "w-4 h-4 shrink-0",
									style: { color: "rgba(255,255,255,0.40)" }
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									ref: inputRef,
									type: "text",
									placeholder: "Search movies, TV shows, anime, people, or keywords…",
									value: searchInput,
									onChange: (e) => {
										setSearchInput(e.target.value);
										setShowSug(true);
										if (keywordIds && e.target.value !== keywordLabel) {
											setKeywordIds("");
											setKeywordLabel("");
										}
									},
									onFocus: () => {
										if (suggestions.length > 0) setShowSug(true);
									},
									onKeyDown: (e) => {
										if (e.key === "Escape") {
											setShowSug(false);
											inputRef.current?.blur();
										}
										if (e.key === "Enter") {
											setShowSug(false);
											if (!keywordIds) setActiveQuery(searchInput.trim());
										}
									},
									className: "flex-1 min-w-0 bg-transparent text-sm outline-none text-white placeholder:text-white/35"
								}),
								isKeywordMode && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium",
									style: {
										background: "rgba(6,182,212,0.2)",
										color: "rgba(103,232,249,0.9)"
									},
									children: "keyword"
								}),
								sugLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "w-3.5 h-3.5 animate-spin shrink-0 text-white/30" }),
								searchInput && !sugLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: clearSearch,
									className: "shrink-0 text-white/40 hover:text-white/80 transition-colors",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "w-3.5 h-3.5" })
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchSuggestions, {
							suggestions,
							onSelect: handleSuggestionSelect,
							visible: showSug
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 mb-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1.5 overflow-x-auto flex-1 min-w-0 pb-1",
							style: { scrollbarWidth: "none" },
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabButton, {
									active: tab === "all",
									onClick: () => setTab("all"),
									icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "w-3.5 h-3.5" }),
									label: "All"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabButton, {
									active: tab === "movies",
									onClick: () => setTab("movies"),
									icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Film, { className: "w-3.5 h-3.5" }),
									label: "Movies"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabButton, {
									active: tab === "series",
									onClick: () => setTab("series"),
									icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tv, { className: "w-3.5 h-3.5" }),
									label: "Series"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabButton, {
									active: tab === "anime",
									onClick: () => setTab("anime"),
									icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "w-3.5 h-3.5" }),
									label: "Anime"
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setFilterOpen((o) => !o),
							className: "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 shrink-0",
							style: filterOpen || hasFilters ? {
								background: "rgba(255,255,255,0.95)",
								color: "#000"
							} : {
								...glassSurface,
								color: "rgba(255,255,255,0.65)"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersHorizontal, { className: "w-3.5 h-3.5" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "hidden md:inline",
									children: "Filters"
								}),
								activeFilterCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold",
									style: {
										background: filterOpen ? "rgba(0,0,0,0.25)" : "rgba(6,182,212,0.8)",
										color: "#fff"
									},
									children: activeFilterCount
								}),
								filterOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "w-3 h-3" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "w-3 h-3" })
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterPanel, {
						open: filterOpen,
						filters,
						setFilter,
						onReset: () => setFilters(EMPTY_FILTERS),
						movieGenres,
						tvGenres,
						contentType: tab
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6",
						children: [
							showSearch && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchResults, {
								query: activeQuery,
								tab
							}),
							showFiltered && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilteredResults, {
								filters,
								contentType: tab === "all" ? "movies" : tab,
								keywords: keywordIds || void 0
							}),
							showDefault && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								tab === "all" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AllRows, {}),
								tab === "movies" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoviesRows, {}),
								tab === "series" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SeriesRows, {}),
								tab === "anime" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimeRows, {})
							] })
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative z-10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, {})
			})
		]
	});
}
export { DiscoverPage as default };
