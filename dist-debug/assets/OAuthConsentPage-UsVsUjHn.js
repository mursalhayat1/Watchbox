import { r as __toESM } from "./rolldown-runtime-SbdDWaPq.js";
import { A as useAuth, J as require_react, K as useSearchParams, L as require_jsx_runtime, M as safeAppPath, N as supabase, U as useLocation, W as useNavigate } from "./dist-CiZ_rQl8.js";
import { t as createLucideIcon } from "./createLucideIcon-CdXsxZqL.js";
import { t as Check } from "./check-BhbBEhc0.js";
import { t as LoaderCircle } from "./loader-circle-CB8huMWq.js";
import { t as ShieldCheck } from "./shield-check-BQcpmVdA.js";
import { s as noindexMetadata, t as PageMeta } from "./index-BqTDaTws.js";
import { n as Button, t as Badge } from "./badge-CsydfRnh.js";
import { a as CardTitle, i as CardHeader, n as CardContent, r as CardDescription, t as Card } from "./card-BitaWzvs.js";
/**
* @license lucide-react v0.576.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var CircleAlert = createLucideIcon("circle-alert", [
	["circle", {
		cx: "12",
		cy: "12",
		r: "10",
		key: "1mglay"
	}],
	["line", {
		x1: "12",
		x2: "12",
		y1: "8",
		y2: "12",
		key: "1pkeuh"
	}],
	["line", {
		x1: "12",
		x2: "12.01",
		y1: "16",
		y2: "16",
		key: "4dfq90"
	}]
]);
// src/pages/OAuthConsentPage.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function registeredRedirect(value, registeredUri) {
	try {
		const url = new URL(value);
		const registered = new URL(registeredUri);
		const scheme = url.protocol.slice(0, -1).toLowerCase();
		const safeCustomScheme = /^[a-z][a-z0-9+.-]*$/.test(scheme) && ![
			"javascript",
			"data",
			"file",
			"vbscript"
		].includes(scheme);
		if (!(url.protocol === "https:" || url.protocol === "http:" && [
			"localhost",
			"127.0.0.1",
			"[::1]"
		].includes(url.hostname) || safeCustomScheme) || url.username || url.password) return null;
		if (url.protocol !== registered.protocol || url.host !== registered.host || url.pathname !== registered.pathname) return null;
		if (!url.searchParams.has("code") && !url.searchParams.has("error")) return null;
		return url.href;
	} catch {
		return null;
	}
}
function clientPermissionsPath(clientId) {
	return `/api/oauth/client-permissions?client_id=${encodeURIComponent(clientId)}`;
}
function OAuthConsentPage() {
	const { user, loading: authLoading } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const [searchParams] = useSearchParams();
	const authorizationId = searchParams.get("authorization_id")?.trim() ?? "";
	const [details, setDetails] = (0, import_react.useState)(null);
	const [permissions, setPermissions] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [submitting, setSubmitting] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (authLoading) return;
		if (!user) {
			const next = safeAppPath(`${location.pathname}${location.search}`) ?? "/";
			navigate(`/login?next=${encodeURIComponent(next)}`, { replace: true });
			return;
		}
		if (!authorizationId || authorizationId.length > 512) {
			setError("This OAuth request is missing a valid authorization reference. Return to your AI client and start the connection again.");
			setLoading(false);
			return;
		}
		let active = true;
		async function loadAuthorization() {
			try {
				const { data, error: detailsError } = await supabase.auth.oauth.getAuthorizationDetails(authorizationId);
				if (detailsError || !data) throw new Error("authorization_lookup_failed");
				if ("redirect_url" in data) {
					const redirect = registeredRedirect(data.redirect_url, data.redirect_url);
					if (!redirect) throw new Error("invalid_redirect");
					window.location.assign(redirect);
					return;
				}
				const consent = data;
				if (!consent.authorization_id || !consent.client?.id || !consent.client?.name || consent.user?.id !== user?.id) throw new Error("authorization_identity_mismatch");
				const permissionResponse = await fetch(clientPermissionsPath(consent.client.id), { cache: "no-store" });
				if (!permissionResponse.ok) throw new Error("permission_lookup_failed");
				const access = await permissionResponse.json();
				if (!active) return;
				setDetails(consent);
				setPermissions(access);
				if (!access.read) setError("This registered client is not enabled for Watchbox read access. Contact the Watchbox administrator.");
			} catch {
				if (active) setError("We could not verify this authorization request. Check that you are signed into the correct Watchbox account, then return to your AI client and try again.");
			} finally {
				if (active) setLoading(false);
			}
		}
		loadAuthorization();
		return () => {
			active = false;
		};
	}, [
		authLoading,
		authorizationId,
		location.pathname,
		location.search,
		navigate,
		user
	]);
	async function submitDecision(decision) {
		if (!details || !permissions?.read || submitting) return;
		setSubmitting(decision);
		setError(null);
		try {
			const response = decision === "approve" ? await supabase.auth.oauth.approveAuthorization(details.authorization_id, { skipBrowserRedirect: true }) : await supabase.auth.oauth.denyAuthorization(details.authorization_id, { skipBrowserRedirect: true });
			if (response.error || !response.data?.redirect_url) throw new Error("authorization_decision_failed");
			const redirect = registeredRedirect(response.data.redirect_url, details.redirect_uri);
			if (!redirect) throw new Error("invalid_redirect");
			window.location.assign(redirect);
		} catch {
			setError("Watchbox could not finish this authorization. Return to your AI client and try again.");
			setSubmitting(null);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-screen bg-background px-4 py-10 text-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageMeta, { seo: noindexMetadata("Connect an AI client", "/oauth/consent") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto w-full max-w-xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-6 flex items-center justify-center gap-2 text-sm font-semibold tracking-wide text-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/images/logo/logo-glass.png",
						alt: "",
						className: "h-6 w-6 shrink-0"
					}), "WatchBox"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "border-border/70 shadow-xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
						className: "space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-6 w-6" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Connect an AI client" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Review the app identity and access Watchbox is asking you to authorize." })
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "space-y-6",
						children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3 py-6 text-sm text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), "Verifying the OAuth request…"]
						}) : error && !details ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm",
							role: "alert",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-2 flex items-center gap-2 font-medium text-destructive",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-4 w-4" }), "Authorization could not be verified"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-muted-foreground",
								children: error
							})]
						}) : details && permissions ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2 rounded-lg border border-border/70 bg-muted/20 p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-medium uppercase tracking-wide text-muted-foreground",
										children: "Requesting client"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-lg font-semibold",
										children: details.client.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "break-all font-mono text-xs text-muted-foreground",
										children: ["Client ID: ", details.client.id]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "break-all text-xs text-muted-foreground",
										children: ["Redirect: ", details.redirect_uri]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm font-semibold",
											children: "Watchbox permissions"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: permissions.write ? "default" : "secondary",
											children: permissions.write ? "Read and write" : "Read only"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
										className: "space-y-2 text-sm text-muted-foreground",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
												className: "flex gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "mt-0.5 h-4 w-4 shrink-0 text-primary" }), "Read your library, watchlist, favorites, ratings, notes and episode progress."]
											}),
											permissions.write && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
												className: "flex gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "mt-0.5 h-4 w-4 shrink-0 text-primary" }), "Add titles and update status, ratings, notes and episode progress."]
											}),
											permissions.write && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
												className: "flex gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "mt-0.5 h-4 w-4 shrink-0 text-primary" }), "Remove a single watchlist title only when that specific action is explicitly confirmed."]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
												className: "flex gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "mt-0.5 h-4 w-4 shrink-0 text-primary" }), "The client cannot access other Watchbox accounts; your account identity is verified by Supabase."]
											})
										]
									}),
									permissions.write && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "Write access is enabled for this registered client by Watchbox’s server configuration. A read-only client cannot make changes."
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1 rounded-lg bg-muted/30 p-3 text-xs text-muted-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "font-medium text-foreground",
										children: ["Signed in as ", user?.email ?? "your Watchbox account"]
									}),
									details.scope && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["Identity scopes: ", details.scope] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Approving allows this client to use your Watchbox account until you revoke its access from your authentication settings." })
								]
							}),
							error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-destructive",
								role: "alert",
								children: error
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col-reverse gap-3 sm:flex-row sm:justify-end",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									disabled: submitting !== null,
									onClick: () => void submitDecision("deny"),
									children: [submitting === "deny" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : null, "Deny"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									disabled: submitting !== null || !permissions.read,
									onClick: () => void submitDecision("approve"),
									children: [submitting === "approve" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : null, "Allow access"]
								})]
							})
						] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "Authorization details are not available."
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-5 text-center text-xs text-muted-foreground",
					children: "If you did not start this connection, deny it and close the page."
				})
			]
		})]
	});
}
export { OAuthConsentPage as default };
