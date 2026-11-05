import { r as __toESM } from "./rolldown-runtime-SbdDWaPq.js";
import { A as useAuth, J as require_react, K as useSearchParams, L as require_jsx_runtime, M as safeAppPath, W as useNavigate, z as Link } from "./dist-CiZ_rQl8.js";
import { t as createLucideIcon } from "./createLucideIcon-CdXsxZqL.js";
import { t as Eye } from "./eye-TDEOK5ms.js";
import { h as toast, s as noindexMetadata, t as PageMeta } from "./index-BqTDaTws.js";
import { t as Silk } from "./Silk-D_eXH-HI.js";
import { n as GlassFilterDef } from "./liquid-glass-B_BlSmm5.js";
/**
* @license lucide-react v0.576.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Chromium = createLucideIcon("chromium", [
	["path", {
		d: "M10.88 21.94 15.46 14",
		key: "xkve6t"
	}],
	["path", {
		d: "M21.17 8H12",
		key: "19dcdn"
	}],
	["path", {
		d: "M3.95 6.06 8.54 14",
		key: "g8jz9m"
	}],
	["circle", {
		cx: "12",
		cy: "12",
		r: "10",
		key: "1mglay"
	}],
	["circle", {
		cx: "12",
		cy: "12",
		r: "4",
		key: "4exip2"
	}]
]);
/**
* @license lucide-react v0.576.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var EyeOff = createLucideIcon("eye-off", [
	["path", {
		d: "M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49",
		key: "ct8e1f"
	}],
	["path", {
		d: "M14.084 14.158a3 3 0 0 1-4.242-4.242",
		key: "151rxh"
	}],
	["path", {
		d: "M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143",
		key: "13bj9a"
	}],
	["path", {
		d: "m2 2 20 20",
		key: "1ooewy"
	}]
]);
/**
* @license lucide-react v0.576.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Mail = createLucideIcon("mail", [["path", {
	d: "m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7",
	key: "132q7q"
}], ["rect", {
	x: "2",
	y: "4",
	width: "20",
	height: "16",
	rx: "2",
	key: "izxlao"
}]]);
// src/pages/LoginPage.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function DiscordIcon({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		className,
		viewBox: "0 0 24 24",
		fill: "currentColor",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" })
	});
}
function LoginPage() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const returnTo = safeAppPath(searchParams.get("next")) ?? "/";
	const { signInWithGoogle, signInWithDiscord, signInWithEmail, signUpWithEmail } = useAuth();
	const [tab, setTab] = (0, import_react.useState)("signin");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [showPw, setShowPw] = (0, import_react.useState)(false);
	const [agreed, setAgreed] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const handleEmail = async (e) => {
		e.preventDefault();
		if (tab === "signup" && !agreed) {
			toast.error("Please agree to the User Agreement & Privacy Policy");
			return;
		}
		setBusy(true);
		try {
			const { error } = tab === "signin" ? await signInWithEmail(email, password) : await signUpWithEmail(email, password, returnTo);
			if (error) throw error;
			if (tab === "signup") toast.success("Check your email to confirm your account!");
			else navigate(returnTo);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Authentication failed");
		} finally {
			setBusy(false);
		}
	};
	const handleGoogle = async () => {
		try {
			await signInWithGoogle(returnTo);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Google sign-in failed");
		}
	};
	const handleDiscord = async () => {
		try {
			await signInWithDiscord(returnTo);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Discord sign-in failed");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden",
		style: { background: "hsl(189,80%,4%)" },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageMeta, { seo: noindexMetadata("Sign In", "/login") }),
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
						style: { background: "linear-gradient(160deg, rgba(0,18,26,0.88) 0%, rgba(0,12,20,0.92) 40%, rgba(0,8,16,0.95) 100%)" }
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute top-0 left-0 w-[600px] h-[400px] pointer-events-none",
						style: { background: "radial-gradient(ellipse at 0% 0%, rgba(14,116,144,0.20) 0%, transparent 70%)" }
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 w-full max-w-md",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col items-center mb-8",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/",
								className: "mb-4 hover:opacity-80 transition-opacity",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: "/images/logo/logo-glass.png",
									alt: "WatchBox",
									className: "w-14 h-14 object-contain",
									draggable: false
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "text-2xl font-bold text-white tracking-tight",
								children: tab === "signin" ? "Welcome back" : "Create account"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-white/40 text-sm mt-1",
								children: tab === "signin" ? "Sign in to your WatchBox account" : "Start tracking your movies & shows"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl p-6 md:p-8",
						style: {
							background: "rgba(10,25,30,0.72)",
							border: "1px solid rgba(14,116,144,0.30)",
							backdropFilter: "blur(24px)",
							boxShadow: "0 24px 64px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex rounded-xl p-1 mb-6",
								style: {
									background: "rgba(255,255,255,0.05)",
									border: "1px solid rgba(255,255,255,0.07)"
								},
								children: ["signin", "signup"].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setTab(t),
									className: "flex-1 py-2 rounded-lg text-sm font-semibold transition-all",
									style: tab === t ? {
										background: "rgba(14,116,144,0.45)",
										color: "#fff",
										boxShadow: "0 2px 8px rgba(14,116,144,0.25)"
									} : { color: "rgba(255,255,255,0.40)" },
									children: t === "signin" ? "Sign In" : "Sign Up"
								}, t))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-3 mb-5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: handleGoogle,
									className: "flex items-center justify-center gap-3 w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-85 active:scale-[0.98]",
									style: {
										background: "rgba(255,255,255,0.08)",
										border: "1px solid rgba(255,255,255,0.14)"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chromium, { className: "w-4 h-4" }), "Continue with Google"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: handleDiscord,
									className: "flex items-center justify-center gap-3 w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-85 active:scale-[0.98]",
									style: {
										background: "rgba(88,101,242,0.20)",
										border: "1px solid rgba(88,101,242,0.40)"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DiscordIcon, { className: "w-4 h-4" }), "Continue with Discord"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3 mb-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex-1 h-px",
										style: { background: "rgba(255,255,255,0.09)" }
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-white/30 font-medium",
										children: "or with email"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex-1 h-px",
										style: { background: "rgba(255,255,255,0.09)" }
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								onSubmit: handleEmail,
								className: "flex flex-col gap-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "email",
											required: true,
											value: email,
											onChange: (e) => setEmail(e.target.value),
											placeholder: "Email address",
											className: "w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm placeholder:text-white/28 outline-none focus:border-cyan-500/55 focus:bg-white/10 transition-all"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: showPw ? "text" : "password",
											required: true,
											value: password,
											onChange: (e) => setPassword(e.target.value),
											placeholder: "Password",
											className: "w-full pl-4 pr-11 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm placeholder:text-white/28 outline-none focus:border-cyan-500/55 focus:bg-white/10 transition-all"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => setShowPw((p) => !p),
											className: "absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors",
											children: showPw ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "w-4 h-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "w-4 h-4" })
										})]
									}),
									tab === "signup" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "flex items-start gap-2.5 cursor-pointer",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "checkbox",
											checked: agreed,
											onChange: (e) => setAgreed(e.target.checked),
											className: "mt-0.5 w-4 h-4 rounded accent-cyan-500 shrink-0"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-xs text-white/40 leading-relaxed",
											children: [
												"I agree to the",
												" ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
													to: "/user-agreement",
													className: "text-cyan-400 hover:underline",
													children: "User Agreement"
												}),
												" ",
												"and",
												" ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
													to: "/privacy",
													className: "text-cyan-400 hover:underline",
													children: "Privacy Policy"
												})
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "submit",
										disabled: busy,
										className: "w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50",
										style: { background: "linear-gradient(135deg, hsl(189,70%,32%), hsl(189,80%,22%))" },
										children: busy ? "Please wait…" : tab === "signin" ? "Sign In" : "Create Account"
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-center text-white/20 text-xs mt-6",
						children: [
							"© ",
							(/* @__PURE__ */ new Date()).getFullYear(),
							" WatchBox. All rights reserved."
						]
					})
				]
			})
		]
	});
}
export { LoginPage as default };
