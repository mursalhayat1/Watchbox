import { r as __toESM } from "./rolldown-runtime-SbdDWaPq.js";
import { J as require_react, L as require_jsx_runtime, z as Link } from "./dist-CiZ_rQl8.js";
import { t as createLucideIcon } from "./createLucideIcon-CdXsxZqL.js";
import { t as List } from "./list-Dquv8Qku.js";
import { t as Film } from "./film-uoMQFx7L.js";
import { t as Tv } from "./tv-CASs2yUo.js";
import { t as Star } from "./star-CXxyzINu.js";
import { t as Trash2 } from "./trash-2-D9xIdnDQ.js";
import { t as ChevronDown } from "./chevron-down-dH9xOy80.js";
import { n as Navbar, t as Footer } from "./Footer-DJ1ZEBZc.js";
import { t as Silk } from "./Silk-D_eXH-HI.js";
import { t as HeroBanner } from "./HeroBanner-B34JzMMQ.js";
import { t as useLibrary } from "./useLibrary-D9G-VYzy.js";
import { t as LIBRARY_STATUSES } from "./library-7WjW2so0.js";
import { S as tmdbImageUrl } from "./tmdb-D_Jm8xAZ.js";
import { s as noindexMetadata, t as PageMeta } from "./index-BqTDaTws.js";
/**
* @license lucide-react v0.576.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var LayoutGrid = createLucideIcon("layout-grid", [
	["rect", {
		width: "7",
		height: "7",
		x: "3",
		y: "3",
		rx: "1",
		key: "1g98yp"
	}],
	["rect", {
		width: "7",
		height: "7",
		x: "14",
		y: "3",
		rx: "1",
		key: "6d4xhi"
	}],
	["rect", {
		width: "7",
		height: "7",
		x: "14",
		y: "14",
		rx: "1",
		key: "nxv5o0"
	}],
	["rect", {
		width: "7",
		height: "7",
		x: "3",
		y: "14",
		rx: "1",
		key: "1bb6yr"
	}]
]);
// src/pages/LibraryPage.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var STATUS_COLORS = {
	"Watching": "rgba(34,197,94,0.9)",
	"Completed": "rgba(99,102,241,0.9)",
	"Plan to Watch": "rgba(59,130,246,0.9)",
	"On Hold": "rgba(234,179,8,0.9)",
	"Dropped": "rgba(239,68,68,0.9)"
};
function libraryItemToMovie(item) {
	return {
		id: item.tmdb_id,
		title: item.title,
		name: item.title,
		poster_path: item.poster_path,
		backdrop_path: item.backdrop_path,
		vote_average: item.vote_average,
		vote_count: 0,
		release_date: item.release_date ?? void 0,
		first_air_date: item.release_date ?? void 0,
		media_type: item.media_type,
		overview: "",
		genre_ids: []
	};
}
function StatusBadge({ item, onChange }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			onClick: (e) => {
				e.preventDefault();
				e.stopPropagation();
				setOpen((v) => !v);
			},
			className: "flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full",
			style: {
				background: STATUS_COLORS[item.status],
				color: "#fff"
			},
			children: [
				item.status,
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "w-3 h-3" })
			]
		}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute left-0 top-6 z-30 rounded-xl overflow-hidden py-1 min-w-[150px]",
			style: {
				background: "rgba(15,25,30,0.97)",
				border: "1px solid rgba(255,255,255,0.12)",
				backdropFilter: "blur(12px)"
			},
			children: LIBRARY_STATUSES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: (e) => {
					e.preventDefault();
					e.stopPropagation();
					onChange(item.id, s);
					setOpen(false);
				},
				className: "w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-white/10 transition-colors",
				style: { color: item.status === s ? "#fff" : "rgba(255,255,255,0.6)" },
				children: s
			}, s))
		})]
	});
}
function GridCard({ item, onRemove, onStatusChange }) {
	const poster = tmdbImageUrl(item.poster_path, "w342");
	const type = item.media_type === "tv" ? "tv" : "movie";
	const year = (item.release_date ?? "").slice(0, 4);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "group relative flex flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: `/detail/${type}/${item.tmdb_id}`,
			className: "block",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative w-full rounded-xl overflow-hidden border border-white/8",
				style: {
					aspectRatio: "2/3",
					background: "rgba(255,255,255,0.05)"
				},
				children: [
					poster ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: poster,
						alt: item.title,
						className: "w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-full h-full flex items-center justify-center",
						children: type === "tv" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tv, { className: "w-8 h-8 text-white/20" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Film, { className: "w-8 h-8 text-white/20" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-200" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: (e) => {
							e.preventDefault();
							e.stopPropagation();
							onRemove(item.id);
						},
						className: "absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center\n              opacity-0 group-hover:opacity-100 transition-opacity duration-150",
						style: {
							background: "rgba(0,0,0,0.65)",
							backdropFilter: "blur(4px)"
						},
						title: "Remove from library",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "w-3.5 h-3.5 text-white/80" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute bottom-2 left-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
							item,
							onChange: onStatusChange
						})
					})
				]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-1.5 px-0.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-semibold text-white/90 truncate leading-snug",
				children: item.title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-1.5 mt-0.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[10px] font-bold uppercase tracking-wide text-white/35",
						children: type === "tv" ? "TV" : "Movie"
					}),
					year && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[10px] text-white/35",
						children: year
					}),
					item.vote_average > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-0.5 text-[10px] text-yellow-400/80 ml-auto shrink-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "w-2.5 h-2.5 fill-yellow-400/80" }), Number(item.vote_average).toFixed(1)]
					})
				]
			})]
		})]
	});
}
function ListRow({ item, onRemove, onStatusChange }) {
	const poster = tmdbImageUrl(item.poster_path, "w154");
	const type = item.media_type === "tv" ? "tv" : "movie";
	const year = (item.release_date ?? "").slice(0, 4);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "group flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: `/detail/${type}/${item.tmdb_id}`,
				className: "shrink-0 w-10 h-14 rounded-lg overflow-hidden border border-white/8",
				style: { background: "rgba(255,255,255,0.05)" },
				children: poster ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: poster,
					alt: item.title,
					className: "w-full h-full object-cover"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "w-full h-full flex items-center justify-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Film, { className: "w-4 h-4 text-white/20" })
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: `/detail/${type}/${item.tmdb_id}`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-semibold text-white/90 truncate hover:text-white transition-colors",
						children: item.title
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 mt-0.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] font-bold uppercase text-white/35",
							children: type === "tv" ? "TV" : "Movie"
						}),
						year && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] text-white/35",
							children: year
						}),
						item.vote_average > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-0.5 text-[10px] text-yellow-400/75",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "w-2.5 h-2.5 fill-yellow-400/75" }), Number(item.vote_average).toFixed(1)]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
				item,
				onChange: onStatusChange
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => onRemove(item.id),
				className: "shrink-0 w-7 h-7 rounded-full flex items-center justify-center\n          md:opacity-0 md:group-hover:opacity-100 transition-opacity ml-1",
				style: { background: "rgba(255,255,255,0.07)" },
				title: "Remove",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "w-3.5 h-3.5 text-white/60" })
			})
		]
	});
}
function EmptyState({ filtered }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center justify-center py-24 gap-4 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "w-16 h-16 rounded-2xl flex items-center justify-center",
				style: {
					background: "rgba(255,255,255,0.06)",
					border: "1px solid rgba(255,255,255,0.10)"
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Film, { className: "w-8 h-8 text-white/25" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-white/55 text-base font-medium",
				children: filtered ? "No titles match this filter." : "Your library is empty."
			}),
			!filtered && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				className: "text-sm text-white/40 hover:text-white/80 transition-colors underline underline-offset-2",
				children: "Browse movies & shows →"
			})
		]
	});
}
function LibraryPage() {
	const { items, loading, error, changeStatus, remove } = useLibrary();
	const [viewMode, setViewMode] = (0, import_react.useState)("grid");
	const [mediaFilter, setMediaFilter] = (0, import_react.useState)("all");
	const [statusFilter, setStatusFilter] = (0, import_react.useState)("All");
	const [sortBy, setSortBy] = (0, import_react.useState)("last_updated");
	const movieCount = (0, import_react.useMemo)(() => items.filter((i) => i.media_type === "movie").length, [items]);
	const tvCount = (0, import_react.useMemo)(() => items.filter((i) => i.media_type === "tv").length, [items]);
	const statusCounts = (0, import_react.useMemo)(() => {
		const map = {};
		for (const s of LIBRARY_STATUSES) map[s] = items.filter((i) => i.status === s).length;
		return map;
	}, [items]);
	const filtered = (0, import_react.useMemo)(() => {
		let list = [...items];
		if (mediaFilter !== "all") list = list.filter((i) => i.media_type === mediaFilter);
		if (statusFilter !== "All") list = list.filter((i) => i.status === statusFilter);
		if (sortBy === "title") list.sort((a, b) => a.title.localeCompare(b.title));
		if (sortBy === "rating") list.sort((a, b) => Number(b.vote_average) - Number(a.vote_average));
		return list;
	}, [
		items,
		mediaFilter,
		statusFilter,
		sortBy
	]);
	const heroMovies = (0, import_react.useMemo)(() => {
		const watching = items.filter((i) => i.status === "Watching").map(libraryItemToMovie);
		const plan = items.filter((i) => i.status === "Plan to Watch").map(libraryItemToMovie);
		return [...watching, ...plan];
	}, [items]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative min-h-screen bg-[#050a0e] flex flex-col overflow-x-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageMeta, { seo: noindexMetadata("My Library", "/library") }),
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
						className: "absolute top-0 left-0 w-[500px] h-[350px] pointer-events-none",
						style: { background: "radial-gradient(ellipse at 0% 0%, rgba(14,116,144,0.18) 0%, transparent 70%)" }
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 flex flex-col min-h-screen",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navbar, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
						className: "flex-1 pt-16 pb-20 md:pb-0",
						children: [!loading && heroMovies.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeroBanner, {
							movies: heroMovies,
							loading: false
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-4 md:px-8 py-6 w-full max-w-screen-xl mx-auto",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "text-xl font-bold text-white",
										children: "My Library"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-3 shrink-0 flex-wrap",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "relative",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
												value: sortBy,
												onChange: (e) => setSortBy(e.target.value),
												className: "appearance-none text-xs font-semibold pl-3 pr-7 py-1.5 rounded-full cursor-pointer outline-none",
												style: {
													background: "rgba(255,255,255,0.08)",
													border: "1px solid rgba(255,255,255,0.14)",
													color: "rgba(255,255,255,0.75)"
												},
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "last_updated",
														children: "Last Updated"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "title",
														children: "Title A–Z"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "rating",
														children: "Rating"
													})
												]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/50 pointer-events-none" })]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-0.5 rounded-full p-1",
											style: {
												background: "rgba(255,255,255,0.06)",
												border: "1px solid rgba(255,255,255,0.10)"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												onClick: () => setViewMode("grid"),
												className: "w-7 h-7 rounded-full flex items-center justify-center transition-all",
												style: viewMode === "grid" ? {
													background: "rgba(255,255,255,0.18)",
													color: "#fff"
												} : { color: "rgba(255,255,255,0.4)" },
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutGrid, { className: "w-3.5 h-3.5" })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												onClick: () => setViewMode("list"),
												className: "w-7 h-7 rounded-full flex items-center justify-center transition-all",
												style: viewMode === "list" ? {
													background: "rgba(255,255,255,0.18)",
													color: "#fff"
												} : { color: "rgba(255,255,255,0.4)" },
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, { className: "w-3.5 h-3.5" })
											})]
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between mb-4 gap-4 overflow-x-auto",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex items-center gap-2 shrink-0",
										children: [
											"all",
											"movie",
											"tv"
										].map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											onClick: () => setMediaFilter(f),
											className: "text-xs font-semibold px-3 py-1 rounded-full transition-all whitespace-nowrap",
											style: mediaFilter === f ? {
												background: "rgba(255,255,255,0.18)",
												color: "#fff"
											} : { color: "rgba(255,255,255,0.50)" },
											children: [f === "all" ? "All" : f === "movie" ? "Movies" : "TV Shows", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "ml-1 text-[10px] opacity-60",
												children: f === "all" ? "" : f === "movie" ? `(${movieCount})` : `(${tvCount})`
											})]
										}, f))
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-xs text-white/35 shrink-0",
										children: [filtered.length, " TITLES"]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 overflow-x-auto pb-2 mb-6",
									style: { scrollbarWidth: "none" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => setStatusFilter("All"),
										className: "text-xs font-semibold px-3 py-1 rounded-full transition-all shrink-0 whitespace-nowrap",
										style: statusFilter === "All" ? {
											background: "rgba(255,255,255,0.18)",
											color: "#fff"
										} : { color: "rgba(255,255,255,0.45)" },
										children: "All"
									}), LIBRARY_STATUSES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => setStatusFilter(s),
										className: "text-xs font-semibold px-3 py-1 rounded-full transition-all shrink-0 whitespace-nowrap",
										style: statusFilter === s ? {
											background: STATUS_COLORS[s],
											color: "#fff"
										} : { color: "rgba(255,255,255,0.45)" },
										children: [s, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "ml-1 opacity-70 text-[10px]",
											children: [
												"(",
												statusCounts[s] ?? 0,
												")"
											]
										})]
									}, s))]
								}),
								loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid gap-3",
									style: { gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))" },
									children: Array.from({ length: 12 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "w-full rounded-xl bg-white/6 animate-pulse",
										style: { aspectRatio: "2/3" }
									}, i))
								}),
								!loading && error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-center text-white/45 py-12 text-sm",
									children: error
								}),
								!loading && !error && filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { filtered: statusFilter !== "All" || mediaFilter !== "all" }),
								!loading && !error && filtered.length > 0 && viewMode === "grid" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid gap-3 md:gap-4",
									style: { gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))" },
									children: filtered.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GridCard, {
										item,
										onRemove: remove,
										onStatusChange: changeStatus
									}, item.id))
								}),
								!loading && !error && filtered.length > 0 && viewMode === "list" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex flex-col divide-y",
									style: {
										borderTop: "1px solid rgba(255,255,255,0.07)",
										borderColor: "rgba(255,255,255,0.07)"
									},
									children: filtered.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListRow, {
										item,
										onRemove: remove,
										onStatusChange: changeStatus
									}, item.id))
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, {})
				]
			})
		]
	});
}
export { LibraryPage as default };
