import { r as __toESM } from "./rolldown-runtime-SbdDWaPq.js";
import { J as require_react, L as require_jsx_runtime } from "./dist-CiZ_rQl8.js";
import { t as Check } from "./check-BhbBEhc0.js";
import { t as Copy } from "./copy-C7c4rQzw.js";
import { t as ExternalLink } from "./external-link-DerKKTRF.js";
import { t as ShieldCheck } from "./shield-check-BQcpmVdA.js";
import { n as Navbar, t as Footer } from "./Footer-DJ1ZEBZc.js";
import { t as Silk } from "./Silk-D_eXH-HI.js";
import { a as generateStaticMetadata, h as toast, t as PageMeta } from "./index-BqTDaTws.js";
import { t as publicRuntimeConfig } from "./runtime-config-BtSr0Ory.js";
import { n as GlassFilterDef, t as GlassButton } from "./liquid-glass-B_BlSmm5.js";
// src/pages/McpPage.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var MCP_SERVER_URL = publicRuntimeConfig.mcpPublicUrl ?? (publicRuntimeConfig.siteUrl ? `${publicRuntimeConfig.siteUrl.replace(/\/$/, "")}/mcp` : null);
var ASSISTANTS = [{
	id: "chatgpt",
	name: "ChatGPT",
	glyph: "G",
	accent: "#10a37f",
	tagline: "OpenAI Apps & Connectors",
	openUrl: "https://chatgpt.com/plugins",
	cta: "Open ChatGPT Plugins",
	steps: [
		"Click below — it opens the ChatGPT Plugins page.",
		"Select \"Create\" (or \"Add custom connector\" in Developer mode).",
		"Name it WatchBox and paste the MCP server URL from above.",
		"In any chat ask WatchBox something — approve the WatchBox sign-in on first use."
	]
}, {
	id: "claude",
	name: "Claude",
	glyph: "✳",
	accent: "#d97757",
	tagline: "Anthropic Custom Connectors",
	openUrl: "https://claude.ai/customize/connectors",
	cta: "Open Claude Connectors",
	steps: [
		"Click below — it opens claude.ai Settings → Connectors.",
		"Select \"Add custom connector\".",
		"Name it WatchBox and paste the MCP server URL from above.",
		"Connect, approve the WatchBox sign-in, then start asking in chat."
	]
}];
var glassCard = {
	backdropFilter: "blur(20px) saturate(180%)",
	WebkitBackdropFilter: "blur(20px) saturate(180%)",
	background: "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.05) 100%)",
	border: "1px solid rgba(255,255,255,0.14)",
	boxShadow: "0 4px 24px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.20), inset 1px 0 0 rgba(255,255,255,0.08)",
	transition: "filter 200ms ease, transform 150ms ease, border-color 200ms ease"
};
function AssistantCard({ option }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-3xl p-6 md:p-7 flex flex-col hover:-translate-y-0.5 hover:border-white/25",
		style: glassCard,
		onMouseEnter: (e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)",
		onMouseLeave: (e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3.5 mb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "w-11 h-11 rounded-2xl flex items-center justify-center text-lg font-bold text-white shrink-0",
					style: {
						background: `linear-gradient(135deg, ${option.accent}33 0%, ${option.accent}11 100%)`,
						border: `1px solid ${option.accent}55`,
						textShadow: "0 1px 2px rgba(0,0,0,0.4)"
					},
					children: option.glyph
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-bold text-white leading-tight",
					children: option.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs",
					style: { color: "rgba(255,255,255,0.45)" },
					children: option.tagline
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "flex flex-col gap-3 mb-6 flex-1",
				children: option.steps.map((step, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold text-white/80 shrink-0 mt-0.5",
						style: {
							background: "rgba(255,255,255,0.08)",
							border: "1px solid rgba(255,255,255,0.14)"
						},
						children: i + 1
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-white/65 leading-relaxed",
						children: step
					})]
				}, i))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GlassButton, {
				asChild: true,
				size: "lg",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: option.openUrl,
					target: "_blank",
					rel: "noreferrer",
					className: "flex items-center gap-2",
					children: [option.cta, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "w-3.5 h-3.5" })]
				})
			})
		]
	});
}
function McpPage() {
	const [copied, setCopied] = (0, import_react.useState)(false);
	const seo = generateStaticMetadata({
		title: "MCP — Connect WatchBox to ChatGPT & Claude",
		description: "Add WatchBox to ChatGPT or Claude as a Model Context Protocol connector and ask your AI assistant about your library, favorites, and watch stats.",
		path: "/connect"
	});
	const copyUrl = async () => {
		if (!MCP_SERVER_URL) return;
		try {
			await navigator.clipboard.writeText(MCP_SERVER_URL);
			setCopied(true);
			toast.success("MCP server URL copied");
			setTimeout(() => setCopied(false), 2e3);
		} catch {
			toast.error("Could not copy — please copy the URL manually.");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative min-h-screen bg-[#050a0e] flex flex-col overflow-x-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageMeta, { seo }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GlassFilterDef, {}),
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
						className: "absolute top-0 left-0 w-[600px] h-[400px] pointer-events-none",
						style: { background: "radial-gradient(ellipse at 0% 0%, rgba(6,182,212,0.10) 0%, transparent 70%)" }
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navbar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "relative z-10 flex-1 w-full max-w-screen-2xl mx-auto px-4 md:px-6 pt-28 pb-24",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-w-3xl mx-auto",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-center mb-10",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] font-semibold tracking-widest uppercase mb-3",
									style: { color: "rgba(255,255,255,0.38)" },
									children: "Model Context Protocol"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "text-3xl md:text-4xl font-bold text-white leading-tight",
									children: "Connect WatchBox to your AI"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm md:text-base text-white/55 mt-3 max-w-xl mx-auto leading-relaxed",
									children: "WatchBox is an MCP server — an open standard that lets ChatGPT and Claude use real apps. Add it as a connector and your assistant can see your library, favorites, and watch stats."
								})
							]
						}),
						MCP_SERVER_URL ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-10",
							style: glassCard,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1 min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] font-semibold tracking-widest uppercase mb-1",
									style: { color: "rgba(255,255,255,0.38)" },
									children: "WatchBox MCP Server URL"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-mono text-sm text-white/85 truncate select-all",
									children: MCP_SERVER_URL
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GlassButton, {
								onClick: copyUrl,
								size: "md",
								className: "shrink-0",
								children: [copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "w-3.5 h-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "w-3.5 h-3.5" }), copied ? "Copied" : "Copy URL"]
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-2xl px-5 py-4 mb-10 text-center",
							style: glassCard,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-white/60",
								children: [
									"MCP server URL is not configured. Set ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono",
										children: "VITE_MCP_PUBLIC_URL"
									}),
									" in your environment."
								]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-1 md:grid-cols-2 gap-5 mb-8",
							children: ASSISTANTS.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AssistantCard, { option }, option.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "flex items-start justify-center gap-2 text-xs text-white/35 text-center leading-relaxed max-w-lg mx-auto",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "w-4 h-4 shrink-0 mt-0.5" }), "Connecting uses OAuth — WatchBox never sees your ChatGPT or Claude account, and you can revoke access at any time from their connector settings."]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative z-10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, {})
			})
		]
	});
}
export { McpPage as default };
