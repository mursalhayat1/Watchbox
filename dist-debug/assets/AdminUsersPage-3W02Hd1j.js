import { r as __toESM } from "./rolldown-runtime-SbdDWaPq.js";
import { J as require_react, L as require_jsx_runtime, z as Link } from "./dist-CiZ_rQl8.js";
import { t as Search } from "./search-B48WcWYH.js";
import { t as ChevronUp } from "./chevron-up-D5izdcCq.js";
import { t as ChevronDown } from "./chevron-down-dH9xOy80.js";
import { t as RefreshCw } from "./refresh-cw-CqBrT0bt.js";
import { t as ShieldBan } from "./shield-ban-D-RB2_S3.js";
import { t as ShieldCheck } from "./shield-check-BQcpmVdA.js";
import { n as CardContent, t as Card } from "./card-BitaWzvs.js";
import { t as Input } from "./input-DX_qP3JW.js";
import { n as Button, t as Badge } from "./badge-CsydfRnh.js";
import { S as AvatarImage, b as Avatar, t as AdminLayout, x as AvatarFallback } from "./AdminLayout-RSqDNN0w.js";
import { h as toast, m as Skeleton } from "./index-BqTDaTws.js";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-B8vDdK30.js";
import { p as listUsers } from "./admin-D_OTUGmL.js";
// src/pages/admin/AdminUsersPage.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var PAGE_SIZE = 25;
function SortBtn({ field, current, dir, onClick }) {
	const active = current === field;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		onClick: () => onClick(field),
		className: "inline-flex flex-col ml-1 opacity-50 hover:opacity-100",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: `w-2.5 h-2.5 ${active && dir === "asc" ? "text-primary opacity-100" : ""}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: `w-2.5 h-2.5 ${active && dir === "desc" ? "text-primary opacity-100" : ""}` })]
	});
}
function AdminUsersPage() {
	const [users, setUsers] = (0, import_react.useState)([]);
	const [total, setTotal] = (0, import_react.useState)(0);
	const [page, setPage] = (0, import_react.useState)(0);
	const [search, setSearch] = (0, import_react.useState)("");
	const [inputVal, setInputVal] = (0, import_react.useState)("");
	const [sortBy, setSortBy] = (0, import_react.useState)("created_at");
	const [sortDir, setSortDir] = (0, import_react.useState)("desc");
	const [filter, setFilter] = (0, import_react.useState)("all");
	const [loading, setLoading] = (0, import_react.useState)(true);
	const debounceRef = (0, import_react.useRef)(null);
	const load = (0, import_react.useCallback)(async () => {
		setLoading(true);
		try {
			const result = await listUsers(search || void 0, PAGE_SIZE, page * PAGE_SIZE, sortBy, sortDir);
			let rows = result.rows;
			if (filter === "admin") rows = rows.filter((u) => u.role === "admin");
			if (filter === "suspended") rows = rows.filter((u) => u.is_suspended);
			setUsers(rows);
			setTotal(result.total);
		} catch {
			toast.error("Failed to load users");
		} finally {
			setLoading(false);
		}
	}, [
		search,
		page,
		sortBy,
		sortDir,
		filter
	]);
	(0, import_react.useEffect)(() => {
		load();
	}, [load]);
	const handleSearchInput = (v) => {
		setInputVal(v);
		if (debounceRef.current) clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(() => {
			setSearch(v);
			setPage(0);
		}, 350);
	};
	const handleSort = (field) => {
		if (sortBy === field) setSortDir((d) => d === "asc" ? "desc" : "asc");
		else {
			setSortBy(field);
			setSortDir("desc");
		}
		setPage(0);
	};
	const totalPages = Math.ceil(total / PAGE_SIZE);
	const displayName = (u) => u.full_name || u.display_name || u.username || u.email || u.id.slice(0, 8);
	const initial = (u) => displayName(u).charAt(0).toUpperCase();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminLayout, {
		title: "Users",
		breadcrumbs: [{ label: "Users" }],
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col md:flex-row items-start md:items-center gap-3 mb-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative flex-1 min-w-0 w-full md:max-w-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							placeholder: "Search by name or email…",
							value: inputVal,
							onChange: (e) => handleSearchInput(e.target.value),
							className: "pl-8 h-8 text-sm"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: filter,
						onValueChange: (v) => {
							setFilter(v);
							setPage(0);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "h-8 w-32 text-xs",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "all",
								children: "All users"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "admin",
								children: "Admins only"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "suspended",
								children: "Suspended"
							})
						] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						size: "sm",
						onClick: () => load(),
						className: "h-8 gap-1.5 text-xs shrink-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "w-3.5 h-3.5" }), " Refresh"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground shrink-0 ml-auto",
						children: [total.toLocaleString(), " total"]
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
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("th", {
									className: "text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap",
									children: ["User", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortBtn, {
										field: "email",
										current: sortBy,
										dir: sortDir,
										onClick: handleSort
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap",
									children: "Role"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-right px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap",
									children: "Library"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-right px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap",
									children: "Favorites"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-right px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap",
									children: "Watchlist"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("th", {
									className: "text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap",
									children: ["Joined", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortBtn, {
										field: "created_at",
										current: sortBy,
										dir: sortDir,
										onClick: handleSort
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap",
									children: "Status"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: loading ? Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
							className: "border-b border-border/50",
							children: Array.from({ length: 7 }).map((_, j) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-full" })
							}, j))
						}, i)) : users.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							colSpan: 7,
							className: "px-4 py-12 text-center text-sm text-muted-foreground",
							children: "No users found"
						}) }) : users.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border/50 hover:bg-muted/30 transition-colors",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 whitespace-nowrap",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: `/admin/users/${u.id}`,
										className: "flex items-center gap-2.5 hover:opacity-80 transition-opacity",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
											className: "w-7 h-7 shrink-0",
											children: [(u.avatar_url || u.provider_avatar_url) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, { src: u.avatar_url || u.provider_avatar_url || "" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
												className: "text-[10px] bg-primary/20 text-primary font-semibold",
												children: initial(u)
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "min-w-0",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs font-medium truncate max-w-[140px]",
												children: displayName(u)
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[10px] text-muted-foreground truncate max-w-[140px]",
												children: u.email
											})]
										})]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 whitespace-nowrap",
									children: u.role === "admin" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										className: "text-[10px] px-1.5 py-0 bg-primary/20 text-primary border-primary/30",
										children: "Admin"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] text-muted-foreground",
										children: "User"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 text-right text-xs tabular-nums",
									children: u.library_count
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 text-right text-xs tabular-nums",
									children: u.favorites_count
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 text-right text-xs tabular-nums",
									children: u.watchlist_count
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 whitespace-nowrap text-xs text-muted-foreground",
									children: new Date(u.created_at).toLocaleDateString()
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 whitespace-nowrap",
									children: u.is_suspended ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center gap-1 text-[10px] text-destructive",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldBan, { className: "w-3 h-3" }), " Suspended"]
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center gap-1 text-[10px] text-chart-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "w-3 h-3" }), " Active"]
									})
								})
							]
						}, u.id)) })]
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
export { AdminUsersPage as default };
