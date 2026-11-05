import { r as __toESM } from "./rolldown-runtime-SbdDWaPq.js";
import { J as require_react, L as require_jsx_runtime } from "./dist-CiZ_rQl8.js";
import { t as RefreshCw } from "./refresh-cw-CqBrT0bt.js";
import { n as CardContent, t as Card } from "./card-BitaWzvs.js";
import { n as Button, t as Badge } from "./badge-CsydfRnh.js";
import { h as toast, m as Skeleton } from "./index-BqTDaTws.js";
import { t as AdminLayout } from "./AdminLayout-RSqDNN0w.js";
import { i as getAuditLogs } from "./admin-D_OTUGmL.js";
// src/pages/admin/AdminLogsPage.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var PAGE_SIZE = 25;
var ACTION_COLORS = {
	user_suspended: "bg-destructive/20 text-destructive border-destructive/30",
	user_restored: "bg-chart-3/20 text-chart-3 border-chart-3/30",
	user_deleted: "bg-destructive/20 text-destructive border-destructive/30",
	user_role_changed: "bg-primary/20 text-primary border-primary/30"
};
function AdminLogsPage() {
	const [logs, setLogs] = (0, import_react.useState)([]);
	const [total, setTotal] = (0, import_react.useState)(0);
	const [page, setPage] = (0, import_react.useState)(0);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const load = (0, import_react.useCallback)(async () => {
		setLoading(true);
		try {
			const result = await getAuditLogs(PAGE_SIZE, page * PAGE_SIZE);
			setLogs(result.rows ?? []);
			setTotal(result.total);
		} catch {
			toast.error("Failed to load audit logs");
		} finally {
			setLoading(false);
		}
	}, [page]);
	(0, import_react.useEffect)(() => {
		load();
	}, [load]);
	const totalPages = Math.ceil(total / PAGE_SIZE);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminLayout, {
		title: "Audit Logs",
		breadcrumbs: [{ label: "Audit Logs" }],
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			size: "sm",
			onClick: load,
			disabled: loading,
			className: "gap-1.5 text-xs h-8",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `w-3.5 h-3.5 ${loading ? "animate-spin" : ""}` })
		}),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground mb-4",
				children: "All significant administrative actions are recorded here. Passwords, tokens, and API keys are never logged."
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
									children: "Timestamp"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap",
									children: "Admin"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap",
									children: "Action"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap",
									children: "Target"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap",
									children: "Status"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap",
									children: "Details"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: loading ? Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
							className: "border-b border-border/50",
							children: Array.from({ length: 6 }).map((_, j) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-full" })
							}, j))
						}, i)) : logs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							colSpan: 6,
							className: "px-4 py-12 text-center text-sm text-muted-foreground",
							children: "No audit logs yet"
						}) }) : logs.map((log) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border/50 hover:bg-muted/30 transition-colors",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 whitespace-nowrap text-xs text-muted-foreground",
									children: new Date(log.created_at).toLocaleString()
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 whitespace-nowrap text-xs",
									children: log.admin_email ?? log.admin_id.slice(0, 8)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 whitespace-nowrap",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										className: `text-[10px] border ${ACTION_COLORS[log.action] ?? "bg-muted text-muted-foreground border-border"}`,
										children: log.action.replace(/_/g, " ")
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-4 py-3 whitespace-nowrap text-xs text-muted-foreground",
									children: [log.target_type ? `${log.target_type}: ` : "", log.target_id?.slice(0, 16)]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 whitespace-nowrap",
									children: log.status === "success" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] text-chart-3",
										children: "✓ success"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-[10px] text-destructive",
										children: ["✗ ", log.status]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 text-[10px] text-muted-foreground max-w-[160px] truncate",
									children: log.details ? JSON.stringify(log.details).slice(0, 60) : "—"
								})
							]
						}, log.id)) })]
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
export { AdminLogsPage as default };
