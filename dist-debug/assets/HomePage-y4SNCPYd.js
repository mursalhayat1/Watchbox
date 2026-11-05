import { r as __toESM } from "./rolldown-runtime-SbdDWaPq.js";
import { A as useAuth, J as require_react, L as require_jsx_runtime, z as Link } from "./dist-CiZ_rQl8.js";
import { t as Heart } from "./heart-o7-jw9A6.js";
import { n as Navbar, t as Footer } from "./Footer-DJ1ZEBZc.js";
import { t as HeroBanner } from "./HeroBanner-B34JzMMQ.js";
import { t as CarouselRow } from "./CarouselRow-CApptQNT.js";
import { t as Silk } from "./Silk-D_eXH-HI.js";
import { r as useTMDBList } from "./useTMDB-iI3pS55R.js";
import { S as tmdbImageUrl, h as getTrending } from "./tmdb-D_Jm8xAZ.js";
import { r as getLibrary } from "./library-7WjW2so0.js";
import { t as getFavorites } from "./favorites-C9ShtsJz.js";
import { t as getFavoriteActors } from "./actorFavorites-Dcj_wPng.js";
import { l as effectiveStatus, u as getActiveSections } from "./sections-WlYP6kNM.js";
import { n as resolveSection } from "./sectionResolver-8LLkkrOz.js";
import { n as generateHomepageMetadata, t as PageMeta } from "./index-BqTDaTws.js";
import { n as excludeLibrary, t as buildLibrarySet } from "./useLibrarySet-IFxAwqXL.js";
// src/pages/HomePage.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function LibraryStatsBar({ items }) {
	if (items.length === 0) return null;
	const watching = items.filter((i) => i.status === "Watching").length;
	const completed = items.filter((i) => i.status === "Completed").length;
	const dropped = items.filter((i) => i.status === "Dropped").length;
	const plan = items.filter((i) => i.status === "Plan to Watch").length;
	const onHold = items.filter((i) => i.status === "On Hold").length;
	const stats = [
		{
			label: "Watching",
			value: watching
		},
		{
			label: "Completed",
			value: completed
		},
		{
			label: "Dropped",
			value: dropped
		},
		{
			label: "Plan",
			value: plan
		},
		{
			label: "On Hold",
			value: onHold
		},
		{
			label: "Total",
			value: items.length
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "px-4 md:px-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-3 md:grid-cols-6 gap-3",
			children: stats.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-center justify-center py-4 px-3 rounded-2xl",
				style: {
					background: "rgba(255,255,255,0.05)",
					border: "1px solid rgba(255,255,255,0.08)"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xl md:text-2xl font-bold text-white leading-none",
					children: s.value
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[10px] uppercase tracking-widest text-white/40 mt-1",
					children: s.label
				})]
			}, s.label))
		})
	});
}
function FavoriteActorsRow({ actors }) {
	if (actors.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between px-4 md:px-6 mb-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[10px] font-semibold tracking-widest uppercase text-white/38 mb-0.5",
			children: "My Library"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
			"data-section-title": true,
			className: "text-base md:text-lg font-bold text-white flex items-center gap-2",
			children: ["Favorite Actors", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "w-4 h-4 text-red-400 fill-red-400" })]
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/library",
			className: "text-xs text-white/40 hover:text-white/80 transition-colors flex items-center gap-1",
			children: "View all"
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex gap-5 px-4 md:px-6 overflow-x-auto hide-scrollbar pb-2",
		children: actors.map((actor) => {
			const img = actor.profile_path ? tmdbImageUrl(actor.profile_path, "w185") : null;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: `/person/${actor.person_id}`,
				className: "shrink-0 flex flex-col items-center gap-2 group",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-white/15 group-hover:border-white/40 transition-colors",
						style: { background: "rgba(255,255,255,0.08)" },
						children: img ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: img,
							alt: actor.name,
							className: "w-full h-full object-cover object-top"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "w-full h-full flex items-center justify-center text-white/30 text-xl",
							children: "👤"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-white/70 group-hover:text-white transition-colors text-center max-w-[72px] truncate",
						children: actor.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10px] text-white/35 -mt-1",
						children: actor.known_for_department
					})
				]
			}, actor.person_id);
		})
	})] });
}
function libraryToMovie(item) {
	return {
		id: item.tmdb_id,
		title: "title" in item ? item.title : "",
		name: "title" in item ? item.title : "",
		poster_path: item.poster_path,
		backdrop_path: "backdrop_path" in item ? item.backdrop_path : null,
		vote_average: item.vote_average,
		vote_count: 0,
		release_date: item.release_date ?? void 0,
		first_air_date: item.release_date ?? void 0,
		media_type: item.media_type,
		overview: "",
		genre_ids: []
	};
}
function DynamicSectionRow({ section, libSet }) {
	const [movies, setMovies] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)(null);
	const mountedRef = (0, import_react.useRef)(true);
	(0, import_react.useEffect)(() => {
		mountedRef.current = true;
		setLoading(true);
		setError(null);
		resolveSection(section).then((result) => {
			if (!mountedRef.current) return;
			const mediaHint = section.content_type === "movie" ? "movie" : section.content_type === "tv" ? "tv" : "auto";
			const filtered = excludeLibrary(result, libSet, mediaHint);
			setMovies(filtered);
		}).catch((e) => {
			if (!mountedRef.current) return;
			setError(e instanceof Error ? e.message : "Failed to load section");
		}).finally(() => {
			if (mountedRef.current) setLoading(false);
		});
		return () => {
			mountedRef.current = false;
		};
	}, [section.id, section.updated_at]);
	if (!loading && !error && movies.length === 0) return null;
	const mediaType = section.content_type === "movie" ? "movie" : section.content_type === "tv" ? "tv" : void 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CarouselRow, {
		title: section.name,
		sectionLabel: section.section_label ?? void 0,
		movies,
		loading,
		error,
		viewAllLink: section.view_all_link ?? void 0,
		mediaType
	});
}
function HomePage() {
	const { user } = useAuth();
	const [libraryItems, setLibraryItems] = (0, import_react.useState)([]);
	const [favoriteItems, setFavoriteItems] = (0, import_react.useState)([]);
	const [favoriteActors, setFavoriteActors] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		if (!user) return;
		getLibrary().then(setLibraryItems).catch(() => {});
		getFavorites().then(setFavoriteItems).catch(() => {});
		getFavoriteActors().then(setFavoriteActors).catch(() => {});
	}, [user]);
	const { movies: trendingAll, loading: heroLoading } = useTMDBList(() => getTrending("all"));
	const [sections, setSections] = (0, import_react.useState)([]);
	const [sectionsLoading, setSectionsLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		setSectionsLoading(true);
		getActiveSections().then((all) => {
			const active = all.filter((s) => effectiveStatus(s) === "published");
			setSections(active);
		}).catch(() => setSections([])).finally(() => setSectionsLoading(false));
	}, []);
	const watchingItems = libraryItems.filter((i) => i.status === "Watching").map(libraryToMovie);
	const planItems = libraryItems.filter((i) => i.status === "Plan to Watch").map(libraryToMovie);
	const favoriteMovies = favoriteItems.map(libraryToMovie);
	const libSet = (0, import_react.useMemo)(() => buildLibrarySet(libraryItems), [libraryItems]);
	const heroMovies = (0, import_react.useMemo)(() => excludeLibrary(trendingAll, libSet, "auto").slice(0, 8), [trendingAll, libSet]);
	const seo = generateHomepageMetadata();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "section-title-xl relative min-h-screen bg-[#050a0e] flex flex-col overflow-x-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageMeta, { seo }),
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
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeroBanner, {
					movies: heroMovies,
					loading: heroLoading
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-10 py-8 pb-24 md:pb-8 max-w-screen-2xl w-full mx-auto relative z-20",
				children: [
					user && libraryItems.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LibraryStatsBar, { items: libraryItems }),
					user && watchingItems.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CarouselRow, {
						title: "Currently Watching",
						sectionLabel: "My Library",
						movies: watchingItems,
						viewAllLink: "/library"
					}),
					user && planItems.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CarouselRow, {
						title: "Plan to Watch",
						sectionLabel: "My Library",
						movies: planItems,
						viewAllLink: "/library"
					}),
					user && favoriteMovies.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CarouselRow, {
						title: "Favorites",
						sectionLabel: "My Library",
						movies: favoriteMovies,
						viewAllLink: "/library"
					}),
					user && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FavoriteActorsRow, { actors: favoriteActors }),
					sectionsLoading ? Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CarouselRow, {
						title: "",
						movies: [],
						loading: true
					}, `skel_${i}`)) : sections.map((section) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DynamicSectionRow, {
						section,
						libSet
					}, section.id))
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative z-10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, {})
			})
		]
	});
}
export { HomePage as default };
