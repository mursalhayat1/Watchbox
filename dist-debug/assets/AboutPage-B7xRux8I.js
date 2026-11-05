import { t as ArrowRight } from "./arrow-right-B2aFG8us.js";
import { t as ChartColumn } from "./chart-column-B8Fs9Ogp.js";
import { i as Compass, n as Navbar, r as Sparkles, t as Footer } from "./Footer-DJ1ZEBZc.js";
import { t as createLucideIcon } from "./createLucideIcon-CdXsxZqL.js";
import { L as require_jsx_runtime, z as Link } from "./dist-CiZ_rQl8.js";
import { t as Silk } from "./Silk-D_eXH-HI.js";
import { a as generateStaticMetadata, t as PageMeta } from "./index-BqTDaTws.js";
import { n as GlassFilterDef, t as GlassButton } from "./liquid-glass-B_BlSmm5.js";
/**
* @license lucide-react v0.576.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Library = createLucideIcon("library", [
	["path", {
		d: "m16 6 4 14",
		key: "ji33uf"
	}],
	["path", {
		d: "M12 6v14",
		key: "1n7gus"
	}],
	["path", {
		d: "M8 8v12",
		key: "1gg7y9"
	}],
	["path", {
		d: "M4 4v16",
		key: "6qkkli"
	}]
]);
// src/pages/AboutPage.tsx
var import_jsx_runtime = require_jsx_runtime();
var FEATURES = [
	{
		id: "track",
		icon: Library,
		accent: "#22d3ee",
		title: "Track everything",
		text: "Keep your whole watch life in one place — Currently Watching, Completed, Plan to Watch, On Hold and Dropped — with ratings from 0 to 10, personal notes and lists, plus a spot for your favorite actors."
	},
	{
		id: "discover",
		icon: Compass,
		accent: "#a78bfa",
		title: "Discover your next favorite",
		text: "Browse trending movies and shows, dig through the Discover page, and get a For You feed built around what you actually watch — all powered by TMDb data."
	},
	{
		id: "stats",
		icon: ChartColumn,
		accent: "#34d399",
		title: "Watch stats that feel personal",
		text: "Your library becomes a story — see what you watch, how much, and how you rate it. WatchBox turns every status change and rating into stats worth coming back for."
	},
	{
		id: "ai",
		icon: Sparkles,
		accent: "#fbbf24",
		title: "Bring your AI assistant",
		text: "WatchBox speaks MCP, so ChatGPT and Claude can connect to your library directly — ask about your favorites, next up, or watch stats inside any chat."
	}
];
var glassCard = {
	backdropFilter: "blur(20px) saturate(180%)",
	WebkitBackdropFilter: "blur(20px) saturate(180%)",
	background: "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.05) 100%)",
	border: "1px solid rgba(255,255,255,0.14)",
	boxShadow: "0 4px 24px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.20), inset 1px 0 0 rgba(255,255,255,0.08)",
	transition: "filter 200ms ease, transform 150ms ease, border-color 200ms ease"
};
function FeatureCard({ feature }) {
	const Icon = feature.icon;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-3xl p-6 md:p-7 flex flex-col hover:-translate-y-0.5 hover:border-white/25",
		style: glassCard,
		onMouseEnter: (e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)",
		onMouseLeave: (e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3.5 mb-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0",
				style: {
					background: `linear-gradient(135deg, ${feature.accent}33 0%, ${feature.accent}11 100%)`,
					border: `1px solid ${feature.accent}55`,
					textShadow: "0 1px 2px rgba(0,0,0,0.4)"
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "w-5 h-5" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-lg font-bold text-white leading-tight",
				children: feature.title
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-white/65 leading-relaxed",
			children: feature.text
		})]
	});
}
function AboutPage() {
	const seo = generateStaticMetadata({
		title: "About WatchBox",
		description: "WatchBox is a personal media universe for movies and TV — track what you watch, discover trending titles, see your watch stats, and connect ChatGPT or Claude through MCP.",
		path: "/about"
	});
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
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: "/images/logo/logo-glass.png",
									alt: "",
									"aria-hidden": "true",
									draggable: false,
									className: "w-16 h-16 mx-auto mb-6 object-contain"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] font-semibold tracking-widest uppercase mb-3",
									style: { color: "rgba(255,255,255,0.38)" },
									children: "About WatchBox"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "text-3xl md:text-4xl font-bold text-white leading-tight",
									children: "Your personal media universe"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm md:text-base text-white/55 mt-3 max-w-xl mx-auto leading-relaxed",
									children: "WatchBox is a home for everything you watch — a quiet place to track shows and movies, find what's next, and see your watching habits take shape over time."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-1 md:grid-cols-2 gap-5 mb-8",
							children: FEATURES.map((feature) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeatureCard, { feature }, feature.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl px-6 py-6 md:px-7 mb-8 flex flex-col sm:flex-row sm:items-center gap-5",
							style: glassCard,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-lg font-bold text-white leading-tight mb-1",
									children: "Talk to your library"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-white/60 leading-relaxed",
									children: "Connect WatchBox to ChatGPT or Claude as an MCP connector and your assistant knows your watchlist, favorites and stats — no copy-pasting required."
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GlassButton, {
								asChild: true,
								size: "lg",
								className: "shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/connect",
									className: "flex items-center gap-2",
									children: ["Connect your AI", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "w-4 h-4" })]
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-white/35 text-center leading-relaxed max-w-lg mx-auto",
							children: "Media data provided by TMDb. Not endorsed by TMDb."
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
export { AboutPage as default };
