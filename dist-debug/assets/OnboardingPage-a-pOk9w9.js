import { r as __toESM } from "./rolldown-runtime-SbdDWaPq.js";
import { A as useAuth, J as require_react, L as require_jsx_runtime, N as supabase, W as useNavigate } from "./dist-CiZ_rQl8.js";
import { t as createLucideIcon } from "./createLucideIcon-CdXsxZqL.js";
import { t as Check } from "./check-BhbBEhc0.js";
import { t as LoaderCircle } from "./loader-circle-CB8huMWq.js";
import { h as toast, s as noindexMetadata, t as PageMeta } from "./index-BqTDaTws.js";
/**
* @license lucide-react v0.576.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var AtSign = createLucideIcon("at-sign", [["circle", {
	cx: "12",
	cy: "12",
	r: "4",
	key: "4exip2"
}], ["path", {
	d: "M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8",
	key: "7n84p3"
}]]);
// src/pages/OnboardingPage.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var cyanNb = "hsl(189,80%,4%)";
var cyanDp = "hsla(189,80%,18%,0.55)";
var cyanDs = "hsla(189,60%,28%,0.30)";
function OnboardingPage() {
	const navigate = useNavigate();
	const { user, refreshProfile } = useAuth();
	const [username, setUsername] = (0, import_react.useState)("");
	const [checking, setChecking] = (0, import_react.useState)(false);
	const [available, setAvailable] = (0, import_react.useState)(null);
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	const isValid = /^[a-zA-Z0-9_]{3,24}$/.test(username);
	const checkAvailability = async (val) => {
		if (!val || !/^[a-zA-Z0-9_]{3,24}$/.test(val)) {
			setAvailable(null);
			return;
		}
		setChecking(true);
		const { data } = await supabase.from("profiles").select("id").eq("username", val.toLowerCase()).maybeSingle();
		setAvailable(data === null);
		setChecking(false);
	};
	const handleChange = (v) => {
		setUsername(v);
		setAvailable(null);
		const trimmed = v.trim().toLowerCase();
		const timeout = setTimeout(() => checkAvailability(trimmed), 600);
		return () => clearTimeout(timeout);
	};
	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!isValid || !available || !user) return;
		setSubmitting(true);
		try {
			const { error } = await supabase.from("profiles").update({
				username: username.toLowerCase(),
				onboarded: true
			}).eq("id", user.id);
			if (error) throw error;
			await refreshProfile();
			toast.success(`Welcome, @${username.toLowerCase()}!`);
			navigate("/");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not save username");
		} finally {
			setSubmitting(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden",
		style: { background: cyanNb },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageMeta, { seo: noindexMetadata("Set Up Your Profile", "/onboarding") }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "fixed inset-0 z-0 pointer-events-none",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-0",
						style: { background: cyanNb }
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-0",
						style: { background: `radial-gradient(ellipse 80% 60% at 15% -5%, ${cyanDp} 0%, transparent 70%)` }
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-0",
						style: { background: `radial-gradient(ellipse 60% 40% at 85% 5%, ${cyanDs} 0%, transparent 65%)` }
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 w-full max-w-md",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center mb-8 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "w-16 h-16 rounded-full flex items-center justify-center mb-4 text-3xl",
							style: {
								background: "rgba(255,255,255,0.08)",
								border: "1px solid rgba(255,255,255,0.14)"
							},
							children: "🎬"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-2xl font-bold text-white",
							children: "Choose your username"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-white/45 text-sm mt-2 max-w-xs",
							children: [
								"This is your unique handle. Others can find your profile at",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-cyan-400",
									children: "watchbox.app/u/username"
								})
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-2xl p-6 md:p-8",
					style: {
						background: "rgba(255,255,255,0.05)",
						border: "1px solid rgba(255,255,255,0.10)",
						backdropFilter: "blur(20px)"
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleSubmit,
						className: "flex flex-col gap-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AtSign, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35 pointer-events-none" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "text",
											value: username,
											onChange: (e) => handleChange(e.target.value),
											placeholder: "yourname",
											maxLength: 24,
											autoComplete: "off",
											spellCheck: false,
											className: "w-full pl-10 pr-11 py-3 rounded-xl bg-white/[0.07] border text-white text-sm placeholder:text-white/30 outline-none transition-all",
											style: { borderColor: available === true ? "rgba(34,197,94,0.5)" : available === false ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.10)" }
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "absolute right-3.5 top-1/2 -translate-y-1/2",
											children: [
												checking && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "w-4 h-4 text-white/40 animate-spin" }),
												!checking && available === true && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "w-4 h-4 text-green-400" }),
												!checking && available === false && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-red-400 text-xs font-semibold",
													children: "Taken"
												})
											]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 flex justify-between items-center",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-white/30",
										children: "Letters, digits and _ · 3–24 chars"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-xs text-white/25",
										children: [username.length, "/24"]
									})]
								}),
								username && !isValid && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-red-400/80 mt-1",
									children: "Invalid username format"
								})
							] }),
							isValid && available && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl px-4 py-3 flex items-center gap-3",
								style: {
									background: "rgba(34,197,94,0.08)",
									border: "1px solid rgba(34,197,94,0.20)"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "w-4 h-4 text-green-400 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-sm text-white/70",
									children: [
										"Your profile will be at",
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-white font-semibold",
											children: ["/u/", username.toLowerCase()]
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "submit",
								disabled: !isValid || !available || submitting,
								className: "w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2",
								style: { background: "linear-gradient(135deg, hsl(189,70%,30%), hsl(189,80%,20%))" },
								children: [submitting && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "w-4 h-4 animate-spin" }), "Claim Username"]
							})
						]
					})
				})]
			})
		]
	});
}
export { OnboardingPage as default };
