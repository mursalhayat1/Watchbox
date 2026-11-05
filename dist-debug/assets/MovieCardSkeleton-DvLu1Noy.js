import { r as __toESM } from "./rolldown-runtime-SbdDWaPq.js";
import { J as require_react, L as require_jsx_runtime, z as Link } from "./dist-CiZ_rQl8.js";
import { a as Clapperboard } from "./Footer-DJ1ZEBZc.js";
import { t as Star } from "./star-CXxyzINu.js";
import { S as tmdbImageUrl, b as tmdbBackdropUrl } from "./tmdb-D_Jm8xAZ.js";
// src/components/movie/MovieCard.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function MovieCard({ movie, mediaType }) {
	const [imgError, setImgError] = (0, import_react.useState)(false);
	const type = mediaType ?? (movie.media_type === "tv" ? "tv" : "movie");
	const title = movie.title ?? movie.name ?? "Unknown";
	const year = (movie.release_date ?? movie.first_air_date ?? "").slice(0, 4);
	const imageUrl = !imgError ? movie.backdrop_path ? tmdbBackdropUrl(movie.backdrop_path) : movie.poster_path ? tmdbImageUrl(movie.poster_path, "w500") : null : null;
	const typeBadge = type === "tv" ? "TV" : "MOVIE";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: `/detail/${type}/${movie.id}`,
		className: "group relative block w-full",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative w-full overflow-hidden bg-white/5 transition-all duration-200",
			style: {
				aspectRatio: "16/9",
				borderRadius: "14px"
			},
			children: [
				imageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: imageUrl,
					alt: title,
					className: "w-full h-full object-cover transition-all duration-200 group-hover:brightness-110",
					onError: () => setImgError(true)
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "w-full h-full flex items-center justify-center bg-white/5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clapperboard, { className: "w-8 h-8 text-white/20" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 rounded-[14px] ring-1 ring-inset ring-transparent group-hover:ring-white/30 transition-all duration-200 pointer-events-none" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 rounded-[14px] bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" })
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-2.5 px-0.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-semibold text-white leading-tight line-clamp-1 mb-1.5",
				children: title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 text-[11px]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide",
						style: {
							background: "rgba(255,255,255,0.12)",
							color: "rgba(255,255,255,0.65)"
						},
						children: typeBadge
					}),
					year && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						style: { color: "rgba(255,255,255,0.45)" },
						children: year
					}),
					movie.vote_average > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-1 ml-auto shrink-0",
						style: { color: "rgba(255,255,255,0.75)" },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "w-3 h-3 fill-yellow-400 text-yellow-400" }), movie.vote_average.toFixed(1)]
					})
				]
			})]
		})]
	});
}
// src/components/movie/MovieCardSkeleton.tsx
function MovieCardSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "w-full",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "w-full animate-pulse bg-white/8 rounded-[14px]",
			style: { aspectRatio: "16/9" }
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-2.5 px-0.5 space-y-1.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-3.5 bg-white/8 rounded animate-pulse w-3/4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-3 bg-white/6 rounded animate-pulse w-1/2" })]
		})]
	});
}
export { MovieCard as n, MovieCardSkeleton as t };
