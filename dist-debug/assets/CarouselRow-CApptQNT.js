import { r as __toESM } from "./rolldown-runtime-SbdDWaPq.js";
import { J as require_react, L as require_jsx_runtime, z as Link } from "./dist-CiZ_rQl8.js";
import { t as ChevronLeft } from "./chevron-left-asACpT8_.js";
import { t as ChevronRight } from "./chevron-right-B7MVhAaO.js";
import { t as ArrowRight } from "./arrow-right-B2aFG8us.js";
import { n as MovieCard, t as MovieCardSkeleton } from "./MovieCardSkeleton-DvLu1Noy.js";
// src/components/movie/CarouselRow.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var glassBtn = {
	backdropFilter: "blur(20px) saturate(180%)",
	WebkitBackdropFilter: "blur(20px) saturate(180%)",
	background: "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 100%)",
	border: "1px solid rgba(255,255,255,0.22)",
	boxShadow: "0 4px 24px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.28), inset 1px 0 0 rgba(255,255,255,0.12)",
	transition: "filter 200ms ease, transform 150ms ease"
};
function CarouselRow({ title, sectionLabel, movies, loading = false, error = null, viewAllLink, mediaType }) {
	const scrollRef = (0, import_react.useRef)(null);
	const [canScrollLeft, setCanScrollLeft] = (0, import_react.useState)(false);
	const [canScrollRight, setCanScrollRight] = (0, import_react.useState)(true);
	const updateScrollState = (0, import_react.useCallback)(() => {
		const el = scrollRef.current;
		if (!el) return;
		setCanScrollLeft(el.scrollLeft > 0);
		setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
	}, []);
	const scroll = (dir) => {
		const el = scrollRef.current;
		if (!el) return;
		el.scrollBy({
			left: dir === "left" ? -(el.clientWidth * .75) : el.clientWidth * .75,
			behavior: "smooth"
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "animate-fade-in",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between px-4 md:px-6 mb-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [sectionLabel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[10px] font-semibold tracking-widest uppercase mb-0.5",
				style: { color: "rgba(255,255,255,0.38)" },
				children: sectionLabel
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				"data-section-title": true,
				className: "text-base md:text-lg font-bold text-white",
				children: title
			})] }), viewAllLink && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: viewAllLink,
				className: "flex items-center gap-1 text-xs font-medium transition-colors shrink-0",
				style: { color: "rgba(255,255,255,0.45)" },
				onMouseEnter: (e) => e.currentTarget.style.color = "rgba(255,255,255,0.9)",
				onMouseLeave: (e) => e.currentTarget.style.color = "rgba(255,255,255,0.45)",
				children: ["View All ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "w-3 h-3" })]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative group/carousel",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => scroll("left"),
					disabled: !canScrollLeft,
					"aria-label": "Scroll left",
					className: "absolute left-0 top-0 bottom-2 z-10 w-14 flex items-center justify-center\n            opacity-0 group-hover/carousel:opacity-100 disabled:!opacity-0\n            transition-opacity duration-200 pointer-events-none group-hover/carousel:pointer-events-auto",
					style: { background: "linear-gradient(to right, rgba(8,22,25,0.80) 0%, transparent 100%)" },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-9 h-9 rounded-full flex items-center justify-center text-white",
						style: glassBtn,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "w-4 h-4" })
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					ref: scrollRef,
					onScroll: updateScrollState,
					className: "flex gap-3 overflow-x-auto hide-scrollbar px-4 md:px-6 pb-2",
					children: [
						error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm py-4 px-2",
							style: { color: "rgba(255,255,255,0.4)" },
							children: "Unable to load content. Please check your TMDB API key."
						}),
						loading ? Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "shrink-0 w-[160px] md:w-[260px]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MovieCardSkeleton, {})
						}, i)) : movies.map((movie) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "shrink-0 w-[160px] md:w-[260px]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MovieCard, {
								movie,
								mediaType
							})
						}, movie.id)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "shrink-0 w-4 md:w-6",
							"aria-hidden": "true"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => scroll("right"),
					disabled: !canScrollRight || loading || movies.length === 0,
					"aria-label": "Scroll right",
					className: "absolute right-0 top-0 bottom-2 z-10 w-14 flex items-center justify-center\n            opacity-0 group-hover/carousel:opacity-100 disabled:!opacity-0\n            transition-opacity duration-200 pointer-events-none group-hover/carousel:pointer-events-auto",
					style: { background: "linear-gradient(to left, rgba(8,22,25,0.80) 0%, transparent 100%)" },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-9 h-9 rounded-full flex items-center justify-center text-white",
						style: glassBtn,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "w-4 h-4" })
					})
				})
			]
		})]
	});
}
export { CarouselRow as t };
