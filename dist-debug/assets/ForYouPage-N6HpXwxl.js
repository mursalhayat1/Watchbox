import { r as __toESM } from "./rolldown-runtime-SbdDWaPq.js";
import { A as useAuth, J as require_react, L as require_jsx_runtime, z as Link } from "./dist-CiZ_rQl8.js";
import { t as ArrowRight } from "./arrow-right-B2aFG8us.js";
import { t as ChevronLeft } from "./chevron-left-asACpT8_.js";
import { t as ChevronRight } from "./chevron-right-B7MVhAaO.js";
import { t as Heart } from "./heart-o7-jw9A6.js";
import { n as Navbar, t as Footer } from "./Footer-DJ1ZEBZc.js";
import { t as HeroBanner } from "./HeroBanner-B34JzMMQ.js";
import { t as CarouselRow } from "./CarouselRow-CApptQNT.js";
import { n as MovieCard } from "./MovieCardSkeleton-DvLu1Noy.js";
import { t as Silk } from "./Silk-D_eXH-HI.js";
import { r as useTMDBList } from "./useTMDB-iI3pS55R.js";
import { c as getSimilarMovies, l as getSimilarTV, r as getMovieDetails, u as getTVDetails } from "./tmdb-D_Jm8xAZ.js";
import { t as getFavorites } from "./favorites-C9ShtsJz.js";
import { s as noindexMetadata, t as PageMeta } from "./index-BqTDaTws.js";
import { n as excludeLibrary, r as useLibrarySet } from "./useLibrarySet-IFxAwqXL.js";
// src/pages/ForYouPage.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function favToMovie(f) {
	return {
		id: f.tmdb_id,
		title: f.title,
		name: f.title,
		poster_path: f.poster_path,
		backdrop_path: f.backdrop_path,
		vote_average: f.vote_average,
		vote_count: 0,
		release_date: f.release_date ?? void 0,
		first_air_date: f.release_date ?? void 0,
		media_type: f.media_type,
		overview: "",
		genre_ids: []
	};
}
var glassBtn = {
	backdropFilter: "blur(20px) saturate(180%)",
	WebkitBackdropFilter: "blur(20px) saturate(180%)",
	background: "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 100%)",
	border: "1px solid rgba(255,255,255,0.22)",
	boxShadow: "0 4px 24px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.28)",
	transition: "filter 200ms ease, transform 150ms ease"
};
function FavoritesScrollRow({ movies, onCardClick }) {
	const scrollRef = (0, import_react.useRef)(null);
	const [canLeft, setCanLeft] = (0, import_react.useState)(false);
	const [canRight, setCanRight] = (0, import_react.useState)(true);
	const updateState = (0, import_react.useCallback)(() => {
		const el = scrollRef.current;
		if (!el) return;
		setCanLeft(el.scrollLeft > 0);
		setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
	}, []);
	const scroll = (dir) => {
		const el = scrollRef.current;
		if (!el) return;
		el.scrollBy({
			left: dir === "left" ? -(el.clientWidth * .75) : el.clientWidth * .75,
			behavior: "smooth"
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between px-4 md:px-6 mb-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[10px] font-semibold tracking-widest uppercase mb-0.5",
			style: { color: "rgba(255,255,255,0.38)" },
			children: "My Library"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
			className: "text-base md:text-lg font-bold text-white flex items-center gap-2",
			children: ["My Favorites", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "w-4 h-4 text-red-400 fill-red-400" })]
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/library",
			className: "flex items-center gap-1 text-xs font-medium shrink-0 transition-colors",
			style: { color: "rgba(255,255,255,0.45)" },
			onMouseEnter: (e) => e.currentTarget.style.color = "rgba(255,255,255,0.9)",
			onMouseLeave: (e) => e.currentTarget.style.color = "rgba(255,255,255,0.45)",
			children: ["View All ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "w-3 h-3" })]
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative group/fav",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => scroll("left"),
				disabled: !canLeft,
				"aria-label": "Scroll left",
				className: "absolute left-0 top-0 bottom-2 z-10 w-14 flex items-center justify-center\n            opacity-0 group-hover/fav:opacity-100 disabled:!opacity-0\n            transition-opacity duration-200 pointer-events-none group-hover/fav:pointer-events-auto",
				style: { background: "linear-gradient(to right, rgba(8,22,25,0.80) 0%, transparent 100%)" },
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "w-9 h-9 rounded-full flex items-center justify-center text-white",
					style: glassBtn,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "w-4 h-4" })
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				ref: scrollRef,
				onScroll: updateState,
				className: "flex gap-3 overflow-x-auto hide-scrollbar px-4 md:px-6 pb-2",
				children: [movies.map((movie) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "group/card shrink-0 w-[220px] md:w-[260px] cursor-pointer",
					onClick: (e) => {
						e.preventDefault();
						e.stopPropagation();
						onCardClick(movie.id);
					},
					title: `See recommendations for "${movie.title ?? movie.name}"`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MovieCard, {
						movie,
						mediaType: movie.media_type === "tv" ? "tv" : "movie"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10px] text-center mt-1 opacity-0 group-hover/card:opacity-100 transition-opacity duration-200",
						style: { color: "rgba(6,182,212,0.85)" },
						children: "↓ See recommendations"
					})]
				}, movie.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "shrink-0 w-4 md:w-6",
					"aria-hidden": "true"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => scroll("right"),
				disabled: !canRight || movies.length === 0,
				"aria-label": "Scroll right",
				className: "absolute right-0 top-0 bottom-2 z-10 w-14 flex items-center justify-center\n            opacity-0 group-hover/fav:opacity-100 disabled:!opacity-0\n            transition-opacity duration-200 pointer-events-none group-hover/fav:pointer-events-auto",
				style: { background: "linear-gradient(to left, rgba(8,22,25,0.80) 0%, transparent 100%)" },
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "w-9 h-9 rounded-full flex items-center justify-center text-white",
					style: glassBtn,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "w-4 h-4" })
				})
			})
		]
	})] });
}
function BecauseYouLovedRow({ source, sectionId, libSet }) {
	const fetchFn = (0, import_react.useCallback)(() => source.media_type === "tv" ? getSimilarTV(source.tmdb_id) : getSimilarMovies(source.tmdb_id), [source.tmdb_id, source.media_type]);
	const { movies: rawMovies, loading } = useTMDBList(fetchFn, [source.tmdb_id]);
	const movies = (0, import_react.useMemo)(() => excludeLibrary(rawMovies, libSet, source.media_type), [
		rawMovies,
		libSet,
		source.media_type
	]);
	if (!loading && movies.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		id: sectionId,
		className: "scroll-mt-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CarouselRow, {
			title: `"${source.title}"`,
			sectionLabel: "Because You Loved",
			movies,
			loading,
			mediaType: source.media_type
		})
	});
}
function ForYouPage() {
	const { user } = useAuth();
	const [favorites, setFavorites] = (0, import_react.useState)([]);
	const [hydrated, setHydrated] = (0, import_react.useState)([]);
	const libSet = useLibrarySet();
	(0, import_react.useEffect)(() => {
		if (!user) return;
		getFavorites().then((favs) => {
			setFavorites(favs);
			setHydrated(favs);
		}).catch(() => {});
	}, [user]);
	(0, import_react.useEffect)(() => {
		if (favorites.length === 0) return;
		const missing = favorites.filter((f) => !f.backdrop_path);
		if (missing.length === 0) return;
		Promise.allSettled(missing.map((f) => (f.media_type === "tv" ? getTVDetails(f.tmdb_id) : getMovieDetails(f.tmdb_id)).then((detail) => ({
			tmdb_id: f.tmdb_id,
			backdrop_path: detail.backdrop_path ?? null
		})))).then((results) => {
			const backdrops = {};
			for (const r of results) if (r.status === "fulfilled") backdrops[r.value.tmdb_id] = r.value.backdrop_path;
			setHydrated((prev) => prev.map((f) => f.backdrop_path == null && backdrops[f.tmdb_id] !== void 0 ? {
				...f,
				backdrop_path: backdrops[f.tmdb_id]
			} : f));
		});
	}, [favorites]);
	const heroMovies = hydrated.map(favToMovie);
	const recSources = hydrated;
	const scrollToRec = (0, import_react.useCallback)((tmdbId) => {
		const el = document.getElementById(`rec-${tmdbId}`);
		if (el) el.scrollIntoView({
			behavior: "smooth",
			block: "start"
		});
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative min-h-screen bg-[#050a0e] flex flex-col overflow-x-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageMeta, { seo: noindexMetadata("For You", "/for-you") }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "fixed inset-0 z-0 pointer-events-none",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Silk, {
						color: "#0e7490",
						speed: 3,
						scale: 1.3,
						noiseIntensity: 1.1,
						rotation: .25
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-0",
						style: { background: "linear-gradient(160deg, rgba(0,18,26,0.82) 0%, rgba(0,12,20,0.88) 40%, rgba(0,8,16,0.92) 100%)" }
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute top-0 left-0 w-[600px] h-[400px] pointer-events-none",
						style: { background: "radial-gradient(ellipse at 0% 0%, rgba(6,182,212,0.10) 0%, transparent 70%)" }
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navbar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative z-10",
				children: heroMovies.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeroBanner, {
					movies: heroMovies,
					loading: false
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center justify-center py-28 px-6 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "w-16 h-16 rounded-2xl flex items-center justify-center mb-5",
							style: {
								background: "rgba(239,68,68,0.12)",
								border: "1px solid rgba(239,68,68,0.25)"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "w-8 h-8 text-red-400" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-xl font-bold text-white mb-2",
							children: "No favorites yet"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-white/45 max-w-xs",
							children: "Heart any movie or show on its detail page and it'll appear here as your personal hero banner."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/",
							className: "mt-6 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-colors",
							style: {
								background: "rgba(255,255,255,0.1)",
								border: "1px solid rgba(255,255,255,0.15)"
							},
							children: "Browse Content"
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-10 py-8 max-w-screen-2xl w-full mx-auto relative z-20",
				children: [
					heroMovies.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FavoritesScrollRow, {
						movies: heroMovies,
						onCardClick: scrollToRec
					}),
					recSources.map((src) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BecauseYouLovedRow, {
						source: src,
						sectionId: `rec-${src.tmdb_id}`,
						libSet
					}, src.tmdb_id)),
					hydrated.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-6 text-sm text-white/35",
						children: "Add favorites from any detail page — recommendations will appear here automatically."
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
export { ForYouPage as default };
