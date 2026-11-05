import { r as __toESM } from "./rolldown-runtime-SbdDWaPq.js";
import { J as require_react, L as require_jsx_runtime, N as supabase } from "./dist-CiZ_rQl8.js";
import { t as RefreshCw } from "./refresh-cw-CqBrT0bt.js";
import { t as CircleCheck } from "./circle-check-6SwjKigc.js";
import { t as CircleX } from "./circle-x-BdJpCuXm.js";
import { t as Clock } from "./clock-BhDxvkyx.js";
import { t as LoaderCircle } from "./loader-circle-CB8huMWq.js";
import { a as CardTitle, i as CardHeader, n as CardContent, r as CardDescription, t as Card } from "./card-BitaWzvs.js";
import { n as Button, t as Badge } from "./badge-CsydfRnh.js";
import { m as Skeleton } from "./index-BqTDaTws.js";
import { t as AdminLayout } from "./AdminLayout-RSqDNN0w.js";
import { t as publicRuntimeConfig } from "./runtime-config-BtSr0Ory.js";
// src/pages/admin/AdminSystemPage.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var TMDB_API_KEY = publicRuntimeConfig.tmdbApiKey ?? "";
async function checkService(name, checkFn) {
	const start = Date.now();
	try {
		await checkFn();
		return {
			name,
			status: "ok",
			latency: Date.now() - start,
			lastChecked: /* @__PURE__ */ new Date()
		};
	} catch (e) {
		return {
			name,
			status: "error",
			latency: Date.now() - start,
			lastChecked: /* @__PURE__ */ new Date(),
			detail: e instanceof Error ? e.message : "Unknown error"
		};
	}
}
function AdminSystemPage() {
	const [services, setServices] = (0, import_react.useState)([
		{
			name: "Supabase Database",
			status: "checking",
			latency: null,
			lastChecked: null
		},
		{
			name: "Supabase Auth",
			status: "checking",
			latency: null,
			lastChecked: null
		},
		{
			name: "TMDB API",
			status: "checking",
			latency: null,
			lastChecked: null
		}
	]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const runChecks = (0, import_react.useCallback)(async () => {
		setLoading(true);
		setServices((prev) => prev.map((s) => ({
			...s,
			status: "checking"
		})));
		const results = await Promise.all([
			checkService("Supabase Database", async () => {
				const { error } = await supabase.from("profiles").select("id").limit(1);
				if (error) throw error;
			}),
			checkService("Supabase Auth", async () => {
				const { error } = await supabase.auth.getSession();
				if (error) throw error;
			}),
			checkService("TMDB API", async () => {
				if (!TMDB_API_KEY) throw new Error("TMDB API key not configured");
				const res = await fetch(`https://api.themoviedb.org/3/configuration?api_key=${encodeURIComponent(TMDB_API_KEY)}`);
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
			})
		]);
		setServices(results);
		setLoading(false);
	}, []);
	(0, import_react.useEffect)(() => {
		runChecks();
	}, [runChecks]);
	const allOk = services.every((s) => s.status === "ok");
	const anyError = services.some((s) => s.status === "error");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminLayout, {
		title: "System Health",
		breadcrumbs: [{ label: "System" }],
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "ghost",
			size: "sm",
			onClick: runChecks,
			disabled: loading,
			className: "gap-1.5 text-xs h-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `w-3.5 h-3.5 ${loading ? "animate-spin" : ""}` }), "Re-check"]
		}),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-6",
				children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-12 w-full rounded-xl" }) : allOk ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3 px-4 py-3 rounded-xl bg-chart-3/10 border border-chart-3/30",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "w-5 h-5 text-chart-3 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium text-chart-3",
						children: "All systems operational"
					})]
				}) : anyError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/30",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "w-5 h-5 text-destructive shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium text-destructive",
						children: "One or more services are degraded"
					})]
				}) : null
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-8",
				children: services.map((svc) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-3 mb-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold",
							children: svc.name
						}), svc.status === "checking" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "w-4 h-4 text-muted-foreground animate-spin shrink-0" }) : svc.status === "ok" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "w-4 h-4 text-chart-3 shrink-0" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "w-4 h-4 text-destructive shrink-0" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: "Status"
								}), svc.status === "checking" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "secondary",
									className: "text-[10px]",
									children: "Checking…"
								}) : svc.status === "ok" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									className: "text-[10px] bg-chart-3/20 text-chart-3 border-chart-3/30",
									children: "Operational"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "destructive",
									className: "text-[10px]",
									children: "Error"
								})]
							}),
							svc.latency !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: "Latency"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "w-3 h-3 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: `text-xs tabular-nums ${svc.latency > 1e3 ? "text-accent" : "text-foreground"}`,
										children: [svc.latency, "ms"]
									})]
								})]
							}),
							svc.lastChecked && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: "Checked"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: svc.lastChecked.toLocaleTimeString()
								})]
							}),
							svc.detail && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] text-destructive mt-1 break-words",
								children: svc.detail
							})
						]
					})]
				}) }, svc.name))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "pb-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-sm font-semibold",
					children: "Environment"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
					className: "text-xs",
					children: "Non-sensitive runtime configuration"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "pt-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-8 text-sm",
					children: [
						{
							label: "App ID",
							value: publicRuntimeConfig.appId ?? "—"
						},
						{
							label: "Supabase URL",
							value: (publicRuntimeConfig.supabaseUrl ?? "").replace(/^https?:\/\//, "").slice(0, 32) + "…" || "—"
						},
						{
							label: "TMDB API",
							value: TMDB_API_KEY ? "✓ Configured" : "✗ Missing"
						},
						{
							label: "Site URL",
							value: publicRuntimeConfig.siteUrl ?? window.location.origin
						},
						{
							label: "Build mode",
							value: "production"
						},
						{
							label: "React version",
							value: "18.x"
						}
					].map(({ label, value }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between py-1.5 border-b border-border/50 last:border-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground",
							children: label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs font-mono text-foreground",
							children: value
						})]
					}, label))
				})
			})] })
		]
	});
}
export { AdminSystemPage as default };
