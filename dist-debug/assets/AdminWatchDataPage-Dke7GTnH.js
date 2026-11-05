import { r as __toESM } from "./rolldown-runtime-SbdDWaPq.js";
import { J as require_react, L as require_jsx_runtime, z as Link } from "./dist-CiZ_rQl8.js";
import { t as Search } from "./search-B48WcWYH.js";
import { t as RefreshCw } from "./refresh-cw-CqBrT0bt.js";
import { n as CardContent, t as Card } from "./card-BitaWzvs.js";
import { t as Input } from "./input-DX_qP3JW.js";
import { n as Button, t as Badge } from "./badge-CsydfRnh.js";
import { h as toast, m as Skeleton } from "./index-BqTDaTws.js";
import { i as TabsTrigger, r as TabsList, t as Tabs } from "./tabs-D5Wvmc8_.js";
import { t as AdminLayout } from "./AdminLayout-RSqDNN0w.js";
import { f as getWatchData } from "./admin-D_OTUGmL.js";
import { S as tmdbImageUrl } from "./tmdb-D_Jm8xAZ.js";
// src/pages/admin/AdminWatchDataPage.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var PAGE_SIZE = 25;
var TAB_LABELS = {
	library_items: "Library",
	favorite_items: "Favorites",
	watchlist_items: "Watchlist"
};
var STATUS_COLORS = {
	"Watching": "bg-primary/20 text-primary border-primary/30",
	"Completed": "bg-chart-3/20 text-chart-3 border-chart-3/30",
	"Plan to Watch": "bg-muted text-muted-foreground",
	"On Hold": "bg-accent/20 text-accent border-accent/30",
	"Dropped": "bg-destructive/20 text-destructive border-destructive/30"
};
function AdminWatchDataPage() {
	const [tab, setTab] = (0, import_react.useState)("library_items");
	const [rows, setRows] = (0, import_react.useState)([]);
	const [total, setTotal] = (0, import_react.useState)(0);
	const [page, setPage] = (0, import_react.useState)(0);
	const [search, setSearch] = (0, import_react.useState)("");
	const [inputVal, setInputVal] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(true);
	const debounceRef = (0, import_react.useRef)(null);
	const load = (0, import_react.useCallback)(async () => {
		setLoading(true);
		try {
			const result = await getWatchData(tab, search || void 0, PAGE_SIZE, page * PAGE_SIZE);
			setRows(result.rows ?? []);
			setTotal(result.total);
		} catch {
			toast.error("Failed to load watch data");
		} finally {
			setLoading(false);
		}
	}, [
		tab,
		search,
		page
	]);
	(0, import_react.useEffect)(() => {
		load();
	}, [load]);
	const handleSearch = (v) => {
		setInputVal(v);
		if (debounceRef.current) clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(() => {
			setSearch(v);
			setPage(0);
		}, 350);
	};
	const totalPages = Math.ceil(total / PAGE_SIZE);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminLayout, {
		title: "Watch Data",
		breadcrumbs: [{ label: "Watch Data" }],
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col md:flex-row items-start md:items-center gap-3 mb-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
						value: tab,
						onValueChange: (v) => {
							setTab(v);
							setPage(0);
							setSearch("");
							setInputVal("");
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsList, {
							className: "h-8",
							children: Object.keys(TAB_LABELS).map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: k,
								className: "text-xs",
								children: TAB_LABELS[k]
							}, k))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative flex-1 min-w-0 w-full md:max-w-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							placeholder: "Filter by title or email…",
							value: inputVal,
							onChange: (e) => handleSearch(e.target.value),
							className: "pl-8 h-8 text-sm"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "sm",
						onClick: () => load(),
						className: "h-8 gap-1.5 text-xs shrink-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "w-3.5 h-3.5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground shrink-0 ml-auto",
						children: [total.toLocaleString(), " rows"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "p-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap",
									children: "Title"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap",
									children: "User"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap",
									children: "Type"
								}),
								tab === "library_items" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap",
									children: "Status"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-right px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap",
									children: "Rating"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap",
									children: "Added"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: loading ? Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
							className: "border-b border-border/50",
							children: Array.from({ length: tab === "library_items" ? 6 : 5 }).map((_, j) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-full" })
							}, j))
						}, i)) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							colSpan: tab === "library_items" ? 6 : 5,
							className: "px-4 py-12 text-center text-sm text-muted-foreground",
							children: "No data found"
						}) }) : rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border/50 hover:bg-muted/30 transition-colors",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 whitespace-nowrap",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: `/detail/${row.media_type}/${row.tmdb_id}`,
										className: "flex items-center gap-2.5 hover:opacity-80",
										target: "_blank",
										rel: "noopener noreferrer",
										children: [row.poster_path && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: tmdbImageUrl(row.poster_path, "w45") ?? "",
											alt: row.title,
											className: "w-7 h-10 rounded object-cover shrink-0"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs font-medium max-w-[160px] truncate",
											children: row.title
										})]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 whitespace-nowrap",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: `/admin/users/${row.user_id}`,
										className: "hover:text-primary transition-colors",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs truncate max-w-[120px]",
											children: row.user_name || row.user_email || row.user_id.slice(0, 8)
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[10px] text-muted-foreground truncate max-w-[120px]",
											children: row.user_email
										})]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 whitespace-nowrap",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "secondary",
										className: "text-[10px] capitalize",
										children: row.media_type
									})
								}),
								tab === "library_items" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 whitespace-nowrap",
									children: row.status && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										className: `text-[10px] border ${STATUS_COLORS[row.status] ?? "bg-muted text-muted-foreground"}`,
										children: row.status
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 text-right text-xs tabular-nums text-muted-foreground",
									children: row.vote_average?.toFixed(1) ?? "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 whitespace-nowrap text-xs text-muted-foreground",
									children: new Date(row.added_at).toLocaleDateString()
								})
							]
						}, row.id)) })]
					})
				})
			}) }),
			totalPages > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between mt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground",
					children: [
						"Page ",
						page + 1,
						" of ",
						totalPages
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => setPage((p) => p - 1),
						disabled: page === 0,
						className: "h-7 text-xs",
						children: "Previous"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => setPage((p) => p + 1),
						disabled: page >= totalPages - 1,
						className: "h-7 text-xs",
						children: "Next"
					})]
				})]
			})
		]
	});
}
export { AdminWatchDataPage as default };
