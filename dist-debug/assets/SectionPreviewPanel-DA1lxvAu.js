import { n as __exportAll, r as __toESM } from "./rolldown-runtime-SbdDWaPq.js";
import { G as useParams, J as require_react, L as require_jsx_runtime } from "./dist-CiZ_rQl8.js";
import { t as Star } from "./star-CXxyzINu.js";
import { t as Film } from "./film-uoMQFx7L.js";
import { t as Tv } from "./tv-CASs2yUo.js";
import { t as RefreshCw } from "./refresh-cw-CqBrT0bt.js";
import { t as Search } from "./search-B48WcWYH.js";
import { t as createLucideIcon } from "./createLucideIcon-CdXsxZqL.js";
import { a as CardTitle, i as CardHeader, n as CardContent, r as CardDescription, t as Card } from "./card-BitaWzvs.js";
import { n as Button, t as Badge } from "./badge-CsydfRnh.js";
import { m as Skeleton } from "./index-BqTDaTws.js";
import { t as AdminLayout } from "./AdminLayout-RSqDNN0w.js";
import { S as tmdbImageUrl, b as tmdbBackdropUrl } from "./tmdb-D_Jm8xAZ.js";
import { t as previewSection } from "./sectionResolver-8LLkkrOz.js";
import { d as getSection } from "./sections-WlYP6kNM.js";
/**
* @license lucide-react v0.576.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var TriangleAlert = createLucideIcon("triangle-alert", [
	["path", {
		d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",
		key: "wmoenq"
	}],
	["path", {
		d: "M12 9v4",
		key: "juzpu7"
	}],
	["path", {
		d: "M12 17h.01",
		key: "p32p05"
	}]
]);
// src/pages/admin/SectionPreviewPanel.tsx
var SectionPreviewPanel_exports = /* @__PURE__ */ __exportAll({
	SectionPreviewPanel: () => SectionPreviewPanel,
	default: () => SectionPreviewPage
});
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function PreviewCard({ movie }) {
	const [imgErr, setImgErr] = (0, import_react.useState)(false);
	const title = movie.title ?? movie.name ?? "Unknown";
	const year = (movie.release_date ?? movie.first_air_date ?? "").slice(0, 4);
	const img = !imgErr ? movie.backdrop_path ? tmdbBackdropUrl(movie.backdrop_path) : movie.poster_path ? tmdbImageUrl(movie.poster_path, "w342") : null : null;
	const type = movie.media_type === "tv" ? "TV" : "Movie";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl overflow-hidden border border-border bg-card group cursor-default",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative aspect-[16/9] bg-muted",
			children: [img ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: img,
				alt: title,
				className: "w-full h-full object-cover",
				onError: () => setImgErr(true)
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "w-full h-full flex items-center justify-center text-muted-foreground/30",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Film, { className: "w-8 h-8" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "p-2.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-semibold text-foreground truncate",
				children: title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-1.5 mt-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						className: "text-[9px] px-1 py-0 h-4",
						children: type
					}),
					year && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[10px] text-muted-foreground",
						children: year
					}),
					movie.vote_average > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-[10px] text-muted-foreground flex items-center gap-0.5 ml-auto",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "w-2.5 h-2.5 fill-yellow-400 text-yellow-400" }), movie.vote_average.toFixed(1)]
					})
				]
			})]
		})]
	});
}
function SectionPreviewPanel({ section }) {
	const [movies, setMovies] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [ran, setRan] = (0, import_react.useState)(false);
	const run = (0, import_react.useCallback)(async () => {
		setLoading(true);
		setError(null);
		try {
			const result = await previewSection(section);
			setMovies(result);
			setRan(true);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Preview failed");
		} finally {
			setLoading(false);
		}
	}, [section]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
			className: "text-base flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "w-4 h-4 text-primary" }), "Live Preview"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Shows what this section will display using your current settings." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			size: "sm",
			onClick: run,
			disabled: loading,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}` }), ran ? "Refresh" : "Run Preview"]
		})]
	}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [
		!ran && !loading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-center py-12 gap-3 text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "w-10 h-10 text-muted-foreground/30" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Click \"Run Preview\" to see matching results."
			})]
		}),
		loading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "w-4 h-4 animate-spin text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm text-muted-foreground",
					children: "Fetching results…"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 md:grid-cols-4 gap-3",
				children: Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "aspect-[16/9] w-full rounded-xl" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-3/4" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-1/2" })
					]
				}, i))
			})]
		}),
		error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "w-4 h-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm",
				children: error
			})]
		}),
		ran && !loading && !error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-4 p-3 rounded-lg bg-muted/40 border mb-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-1.5 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-bold text-foreground text-lg",
					children: movies.length
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted-foreground",
					children: "results"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3 text-xs text-muted-foreground",
				children: [movies.filter((m) => (m.media_type ?? "movie") === "movie").length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Film, { className: "w-3 h-3" }),
						movies.filter((m) => (m.media_type ?? "movie") === "movie").length,
						" movies"
					]
				}), movies.filter((m) => m.media_type === "tv").length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tv, { className: "w-3 h-3" }),
						movies.filter((m) => m.media_type === "tv").length,
						" TV"
					]
				})]
			})]
		}), movies.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-center py-12 gap-3 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "w-10 h-10 text-amber-500/60" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium text-foreground",
					children: "No results found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground max-w-xs",
					children: "Try loosening your filters, changing the sort method, or switching to a different content type."
				})
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3",
			children: movies.map((m, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewCard, { movie: m }, `${m.id}_${i}`))
		})] })
	] })] });
}
function SectionPreviewPage() {
	const { id } = useParams();
	const [section, setSection] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		if (!id) return;
		setLoading(true);
		getSection(id).then(setSection).catch(() => {}).finally(() => setLoading(false));
	}, [id]);
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminLayout, {
		breadcrumbs: [{
			label: "Sections",
			href: "/admin/sections"
		}, { label: "Preview" }],
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-96 w-full rounded-xl" })
	});
	if (!section) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminLayout, {
		breadcrumbs: [{
			label: "Sections",
			href: "/admin/sections"
		}, { label: "Preview" }],
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-muted-foreground",
			children: "Section not found."
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminLayout, {
		breadcrumbs: [
			{
				label: "Sections",
				href: "/admin/sections"
			},
			{ label: section.name },
			{ label: "Preview" }
		],
		title: `Preview: ${section.name}`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionPreviewPanel, { section })
	});
}
export { SectionPreviewPanel_exports as n, SectionPreviewPanel as t };
