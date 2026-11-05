import { a as CardTitle, i as CardHeader, n as CardContent, r as CardDescription, t as Card } from "./card-BitaWzvs.js";
import { t as Badge } from "./badge-CsydfRnh.js";
import { t as AdminLayout, u as Separator } from "./AdminLayout-RSqDNN0w.js";
import { t as publicRuntimeConfig } from "./runtime-config-BtSr0Ory.js";
import { L as require_jsx_runtime } from "./dist-CiZ_rQl8.js";
// src/pages/admin/AdminSettingsPage.tsx
var import_jsx_runtime = require_jsx_runtime();
function SettingsSection({ title, description, rows }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
			className: "pb-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-sm font-semibold",
				children: title
			}), description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
				className: "text-xs",
				children: description
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "pt-0",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "divide-y divide-border/50",
				children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between py-3 gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: row.label
					}), row.sensitive && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10px] text-muted-foreground mt-0.5",
						children: "Value hidden for security"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 shrink-0",
						children: [row.badge && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "secondary",
							className: "text-[10px]",
							children: row.badge
						}), !row.sensitive && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs font-mono text-muted-foreground max-w-[200px] truncate",
							children: row.value
						})]
					})]
				}, row.label))
			})
		})
	] });
}
function AdminSettingsPage() {
	const supabaseUrl = publicRuntimeConfig.supabaseUrl ?? "";
	const siteUrl = publicRuntimeConfig.siteUrl ?? window.location.origin;
	const appId = publicRuntimeConfig.appId ?? "—";
	const tmdbKey = publicRuntimeConfig.tmdbApiKey ?? "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminLayout, {
		title: "Settings",
		breadcrumbs: [{ label: "Settings" }],
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-2xl space-y-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "This page shows actual WatchBox configuration. Secrets and API keys are never displayed. To change environment variables, update your deployment configuration."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsSection, {
					title: "General",
					description: "Core application settings",
					rows: [
						{
							label: "App ID",
							value: appId
						},
						{
							label: "Site URL",
							value: siteUrl
						},
						{
							label: "Build Mode",
							value: "production",
							badge: "production"
						}
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsSection, {
					title: "Supabase",
					description: "Backend database and auth configuration",
					rows: [
						{
							label: "Supabase URL",
							value: supabaseUrl.replace("https://", "").slice(0, 40) + "…"
						},
						{
							label: "Anon Key",
							value: "•••••",
							sensitive: true
						},
						{
							label: "Auth",
							value: "Supabase Auth (email + OAuth)",
							badge: "Enabled"
						},
						{
							label: "Storage",
							value: "Supabase Storage",
							badge: "Enabled"
						},
						{
							label: "RLS",
							value: "Row-Level Security on all tables",
							badge: "Active"
						}
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsSection, {
					title: "Content / APIs",
					description: "Third-party content sources",
					rows: [
						{
							label: "TMDB API Key",
							value: "•••••",
							sensitive: true
						},
						{
							label: "TMDB API Key Status",
							value: tmdbKey ? "Configured" : "Missing",
							badge: tmdbKey ? "OK" : "Missing"
						},
						{
							label: "TMDB Image CDN",
							value: "https://image.tmdb.org/t/p/"
						}
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsSection, {
					title: "Recommendations",
					description: "Content recommendation engine settings",
					rows: [
						{
							label: "Engine",
							value: "Genre-frequency interaction scoring"
						},
						{
							label: "Interaction types",
							value: "view, play, like, add_library, add_watchlist"
						},
						{
							label: "Lookback window",
							value: "50 most recent interactions"
						},
						{
							label: "Top genres",
							value: "Top 3 by weighted frequency"
						}
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsSection, {
					title: "Security",
					description: "Authorization and access control",
					rows: [
						{
							label: "Admin role",
							value: "profiles.role = 'admin'"
						},
						{
							label: "Authorization",
							value: "Server-side via SECURITY DEFINER RPCs",
							badge: "Active"
						},
						{
							label: "Session storage",
							value: "localStorage (Supabase default)",
							badge: "SPA"
						},
						{
							label: "Audit logging",
							value: "All admin actions logged to admin_audit_logs",
							badge: "Active"
						}
					]
				})
			]
		})
	});
}
export { AdminSettingsPage as default };
