import { r as __toESM } from "./rolldown-runtime-SbdDWaPq.js";
import { J as require_react, L as require_jsx_runtime, z as Link } from "./dist-CiZ_rQl8.js";
import { t as Play } from "./play-bEsgU6qq.js";
import { t as Plus } from "./plus-B3yFzkq8.js";
import { t as Info } from "./info-fczisarS.js";
import { t as Star } from "./star-CXxyzINu.js";
import { t as Calendar } from "./calendar-DSCeGRW1.js";
import { C as tmdbLogoUrl, a as getMovieImages, b as tmdbBackdropUrl, f as getTVImages } from "./tmdb-D_Jm8xAZ.js";
import { r as GlassIconButton, t as GlassButton } from "./liquid-glass-B_BlSmm5.js";
// src/components/movie/HeroBanner.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function HeroBanner({ movies, loading = false }) {
	const [currentIndex, setCurrentIndex] = (0, import_react.useState)(0);
	const [prevIndex, setPrevIndex] = (0, import_react.useState)(null);
	const [transitioning, setTransitioning] = (0, import_react.useState)(false);
	const [infoVisible, setInfoVisible] = (0, import_react.useState)(true);
	const logoCache = (0, import_react.useRef)({});
	const [logoUrl, setLogoUrl] = (0, import_react.useState)(null);
	const featured = movies[currentIndex];
	const advanceTo = (0, import_react.useCallback)((nextIdx) => {
		if (nextIdx === currentIndex) return;
		setInfoVisible(false);
		setTimeout(() => {
			setPrevIndex(currentIndex);
			setTransitioning(true);
			setCurrentIndex(nextIdx);
		}, 180);
	}, [currentIndex]);
	(0, import_react.useEffect)(() => {
		if (movies.length <= 1) return;
		const interval = setInterval(() => {
			const next = (currentIndex + 1) % Math.min(8, movies.length);
			advanceTo(next);
		}, 8e3);
		return () => clearInterval(interval);
	}, [
		movies.length,
		currentIndex,
		advanceTo
	]);
	(0, import_react.useEffect)(() => {
		if (!transitioning) return;
		const t = setTimeout(() => {
			setTransitioning(false);
			setPrevIndex(null);
			setInfoVisible(true);
		}, 900);
		return () => clearTimeout(t);
	}, [transitioning, currentIndex]);
	(0, import_react.useEffect)(() => {
		setInfoVisible(true);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!featured) {
			setLogoUrl(null);
			return;
		}
		const id = featured.id;
		if (id in logoCache.current) {
			setLogoUrl(logoCache.current[id]);
			return;
		}
		((featured.media_type === "tv" ? "tv" : "movie") === "tv" ? getTVImages : getMovieImages)(id).then(({ logos }) => {
			const sorted = [...logos].sort((a, b) => b.vote_average - a.vote_average);
			const best = sorted.find((l) => l.iso_639_1 === "en") ?? sorted[0] ?? null;
			const url = best ? tmdbLogoUrl(best.file_path) : null;
			logoCache.current[id] = url;
			setLogoUrl(url);
		}).catch(() => {
			logoCache.current[id] = null;
			setLogoUrl(null);
		});
	}, [featured]);
	const backdropUrl = featured ? tmdbBackdropUrl(featured.backdrop_path) : null;
	const prevBackdropUrl = prevIndex !== null && movies[prevIndex] ? tmdbBackdropUrl(movies[prevIndex].backdrop_path) : null;
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "relative w-full bg-muted animate-pulse",
		style: { height: "clamp(360px, 70vh, 980px)" },
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "absolute bottom-0 left-0 right-0 p-6 md:p-14 space-y-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-10 bg-white/10 rounded w-56 mb-2" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-4 bg-white/10 rounded w-32" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-4 bg-white/10 rounded w-full max-w-sm" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-4 bg-white/10 rounded w-3/4 max-w-xs" })
			]
		})
	});
	if (!featured) return null;
	const title = featured.title ?? featured.name ?? "Unknown";
	const type = featured.media_type === "tv" ? "tv" : "movie";
	const year = (featured.release_date ?? featured.first_air_date ?? "").slice(0, 4);
	const genreLabel = featured.genre_ids?.length ? {
		28: "Action",
		12: "Adventure",
		16: "Animation",
		35: "Comedy",
		80: "Crime",
		99: "Documentary",
		18: "Drama",
		10751: "Family",
		14: "Fantasy",
		36: "History",
		27: "Horror",
		10402: "Music",
		9648: "Mystery",
		10749: "Romance",
		878: "Sci-Fi",
		53: "Thriller",
		10752: "War",
		37: "Western",
		10759: "Action & Adventure",
		10762: "Kids",
		10763: "News",
		10764: "Reality",
		10765: "Sci-Fi & Fantasy",
		10766: "Soap",
		10767: "Talk",
		10768: "War & Politics"
	}[featured.genre_ids[0]] ?? "Film" : type === "tv" ? "Series" : "Movie";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative w-full overflow-hidden",
		style: { height: "clamp(360px, 70vh, 980px)" },
		children: [
			prevBackdropUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: prevBackdropUrl,
				alt: "",
				"aria-hidden": "true",
				className: "absolute inset-0 w-full h-full object-cover",
				style: {
					objectPosition: "center 20%",
					zIndex: 0,
					opacity: transitioning ? 1 : 0,
					transition: "opacity 900ms cubic-bezier(0.4,0,0.2,1)"
				}
			}, `prev-${prevIndex}`),
			backdropUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: backdropUrl,
				alt: title,
				className: "absolute inset-0 w-full h-full object-cover",
				style: {
					objectPosition: "center 20%",
					zIndex: 1,
					opacity: transitioning ? 0 : 1,
					transition: "opacity 900ms cubic-bezier(0.4,0,0.2,1)"
				}
			}, `curr-${currentIndex}`),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-x-0 bottom-0 pointer-events-none",
				style: {
					height: "65%",
					zIndex: 2,
					background: `linear-gradient(to top,
            rgba(0, 8, 14, 1.00)    0%,
            rgba(0, 10, 18, 0.95)   6%,
            rgba(0, 12, 20, 0.85)  16%,
            rgba(0, 14, 22, 0.55)  35%,
            rgba(0, 14, 22, 0.18)  60%,
            transparent            100%)`
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-x-0 top-0 pointer-events-none",
				style: {
					height: "20%",
					zIndex: 2,
					background: "linear-gradient(to bottom, rgba(0,0,0,0.50) 0%, transparent 100%)"
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-y-0 left-0 pointer-events-none",
				style: {
					width: "70%",
					zIndex: 2,
					background: "linear-gradient(to right, rgba(0,0,0,0.60) 0%, rgba(0,0,0,0.18) 50%, transparent 100%)"
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-x-0 bottom-0",
				style: {
					zIndex: 20,
					opacity: infoVisible ? 1 : 0,
					transform: infoVisible ? "translateY(0)" : "translateY(8px)",
					transition: infoVisible ? "opacity 500ms cubic-bezier(0.4,0,0.2,1), transform 500ms cubic-bezier(0.4,0,0.2,1)" : "opacity 180ms ease-in, transform 180ms ease-in"
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-w-screen-2xl w-full mx-auto px-4 md:px-14 pb-8 md:pb-16",
					children: [
						logoUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: logoUrl,
							alt: title,
							className: "mb-3 md:mb-4 drop-shadow-2xl",
							style: {
								maxWidth: "220px",
								maxHeight: "90px",
								width: "auto",
								height: "auto",
								objectFit: "contain",
								objectPosition: "left center"
							}
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-2xl md:text-6xl font-bold text-white mb-2 md:mb-3 leading-tight text-balance drop-shadow-lg max-w-2xl",
							children: title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2 mb-2 md:mb-3 text-xs md:text-sm",
							children: [
								featured.vote_average > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-1 font-semibold text-white",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "w-3 h-3 md:w-3.5 md:h-3.5 fill-yellow-400 text-yellow-400" }),
										featured.vote_average.toFixed(1),
										"/10"
									]
								}),
								year && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-white/40",
									children: "·"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-1 text-white/80",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "w-3 h-3 text-white/50" }), year]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-white/40",
									children: "·"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-white/80",
									children: genreLabel
								})
							]
						}),
						featured.overview && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm md:text-base text-white/80 max-w-lg line-clamp-3 mb-5 md:mb-7 leading-relaxed",
							children: featured.overview
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 md:gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GlassButton, {
									asChild: true,
									size: "lg",
									active: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: `/detail/${type}/${featured.id}`,
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "w-4 h-4 fill-black" }), " Play"]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GlassIconButton, {
									size: 40,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "w-5 h-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GlassIconButton, {
									size: 40,
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: `/detail/${type}/${featured.id}`,
										"aria-label": "More info",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "w-5 h-5" })
									})
								})
							]
						})
					]
				})
			}),
			movies.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute bottom-10 right-8 flex items-center gap-1.5",
				style: { zIndex: 30 },
				children: Array.from({ length: Math.min(8, movies.length) }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => advanceTo(i),
					"aria-label": `Slide ${i + 1}`,
					className: `rounded-full transition-all duration-300 ${i === currentIndex ? "bg-white w-5 h-1.5" : "bg-white/35 w-1.5 h-1.5 hover:bg-white/65"}`
				}, i))
			})
		]
	});
}
export { HeroBanner as t };
