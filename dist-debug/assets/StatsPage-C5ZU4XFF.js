import { r as __toESM } from "./rolldown-runtime-SbdDWaPq.js";
import { A as useAuth, D as getDisplayName, E as getAvatarUrl, J as require_react, L as require_jsx_runtime, T as getAuthProvider, W as useNavigate, z as Link } from "./dist-CiZ_rQl8.js";
import { h as toast, s as noindexMetadata, t as PageMeta } from "./index-BqTDaTws.js";
import { F as Cell, I as ResponsiveContainer, L as Tooltip, i as XAxis, p as Bar, r as YAxis, t as BarChart, z as Legend } from "./BarChart-Dcrhwdwr.js";
import { n as Pie, r as TrendingUp, t as PieChart } from "./PieChart-ClQY5k8k.js";
import { n as Navbar, o as CircleUserRound, t as Footer } from "./Footer-DJ1ZEBZc.js";
import { n as LogOut } from "./x-DnkSYaUr.js";
import { t as Film } from "./film-uoMQFx7L.js";
import { t as Tv } from "./tv-CASs2yUo.js";
import { t as BookOpen } from "./book-open-DF2T-gSK.js";
import { t as Eye } from "./eye-TDEOK5ms.js";
import { t as CircleCheck } from "./circle-check-6SwjKigc.js";
import { t as createLucideIcon } from "./createLucideIcon-CdXsxZqL.js";
import { t as CircleX } from "./circle-x-BdJpCuXm.js";
import { t as useLibrary } from "./useLibrary-D9G-VYzy.js";
import { S as tmdbImageUrl } from "./tmdb-D_Jm8xAZ.js";
/**
* @license lucide-react v0.576.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var CirclePause = createLucideIcon("circle-pause", [
	["circle", {
		cx: "12",
		cy: "12",
		r: "10",
		key: "1mglay"
	}],
	["line", {
		x1: "10",
		x2: "10",
		y1: "15",
		y2: "9",
		key: "c1nkhi"
	}],
	["line", {
		x1: "14",
		x2: "14",
		y1: "15",
		y2: "9",
		key: "h65svq"
	}]
]);
/**
* @license lucide-react v0.576.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Clock3 = createLucideIcon("clock-3", [["circle", {
	cx: "12",
	cy: "12",
	r: "10",
	key: "1mglay"
}], ["path", {
	d: "M12 6v6h4",
	key: "135r8i"
}]]);
// src/pages/StatsPage.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var STATUS_COLORS = {
	"Watching": "#3b82f6",
	"Completed": "#22c55e",
	"Plan to Watch": "#a855f7",
	"On Hold": "#f59e0b",
	"Dropped": "#ef4444"
};
var STATUS_ICONS = {
	"Watching": Eye,
	"Completed": CircleCheck,
	"Plan to Watch": Clock3,
	"On Hold": CirclePause,
	"Dropped": CircleX
};
var CHART_COLORS = [
	"#06b6d4",
	"#3b82f6",
	"#a855f7",
	"#f59e0b",
	"#22c55e",
	"#ef4444",
	"#ec4899",
	"#10b981"
];
function StatCard({ label, value, icon: Icon, color }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl p-4 flex flex-col items-center gap-2",
		style: {
			background: "rgba(255,255,255,0.04)",
			border: "1px solid rgba(255,255,255,0.08)"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "w-10 h-10 rounded-xl flex items-center justify-center",
				style: { background: color ? `${color}22` : "rgba(255,255,255,0.07)" },
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
					className: "w-5 h-5",
					style: { color: color ?? "rgba(255,255,255,0.6)" }
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-white/45 text-[10px] uppercase tracking-widest font-medium",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-white text-2xl font-bold leading-none",
				children: value
			})
		]
	});
}
function ActivityHeatmap({ items }) {
	const today = /* @__PURE__ */ new Date();
	const startDate = new Date(today);
	startDate.setFullYear(today.getFullYear() - 1);
	const completionDates = (0, import_react.useMemo)(() => {
		const map = {};
		items.filter((it) => it.status === "Completed").forEach((it) => {
			const d = it.updated_at?.slice(0, 10) ?? it.added_at?.slice(0, 10);
			if (d) map[d] = (map[d] ?? 0) + 1;
		});
		return map;
	}, [items]);
	const weeks = (0, import_react.useMemo)(() => {
		const result = [];
		const cur = new Date(startDate);
		while (cur.getDay() !== 1) cur.setDate(cur.getDate() - 1);
		while (cur <= today) {
			const week = [];
			for (let d = 0; d < 7; d++) {
				const ds = cur.toISOString().slice(0, 10);
				week.push({
					date: ds,
					count: completionDates[ds] ?? 0
				});
				cur.setDate(cur.getDate() + 1);
			}
			result.push(week);
		}
		return result;
	}, [completionDates]);
	const cellColor = (count) => {
		if (count === 0) return "rgba(255,255,255,0.06)";
		if (count === 1) return "rgba(34,197,94,0.35)";
		if (count === 2) return "rgba(34,197,94,0.60)";
		if (count >= 3) return "rgba(34,197,94,0.90)";
		return "rgba(255,255,255,0.06)";
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl p-5",
		style: {
			background: "rgba(255,255,255,0.04)",
			border: "1px solid rgba(255,255,255,0.08)"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between mb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm font-semibold text-white",
					children: "Completion Activity"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs text-white/35",
					children: "Past 12 months"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-[3px] min-w-max",
					children: weeks.map((week, wi) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-col gap-[3px]",
						children: week.map(({ date, count }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							title: count > 0 ? `${date}: ${count} completed` : date,
							className: "w-[11px] h-[11px] rounded-[2px] cursor-default",
							style: { background: cellColor(count) }
						}, date))
					}, wi))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 mt-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[10px] text-white/30",
						children: "Less"
					}),
					[
						0,
						1,
						2,
						3
					].map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-[11px] h-[11px] rounded-[2px]",
						style: { background: cellColor(n) }
					}, n)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[10px] text-white/30",
						children: "More"
					})
				]
			})
		]
	});
}
function TopRatedList({ items }) {
	const sorted = (0, import_react.useMemo)(() => [...items].sort((a, b) => b.vote_average - a.vote_average).slice(0, 6), [items]);
	if (!sorted.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl overflow-hidden",
		style: {
			background: "rgba(255,255,255,0.04)",
			border: "1px solid rgba(255,255,255,0.08)"
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "px-5 pt-5 pb-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-sm font-semibold text-white",
				children: "Top Rated"
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "divide-y divide-white/[0.06]",
			children: sorted.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: `/detail/${item.media_type}/${item.tmdb_id}`,
				className: "flex items-center gap-3 px-5 py-3 hover:bg-white/[0.04] transition-colors",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-white/8",
						children: item.poster_path ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: tmdbImageUrl(item.poster_path, "w92") ?? "",
							alt: item.title,
							className: "w-full h-full object-cover"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Film, { className: "w-4 h-4 m-auto mt-2.5 text-white/25" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex-1 min-w-0 text-sm text-white/85 truncate",
						children: item.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1.5 shrink-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-1 w-24 rounded-full overflow-hidden bg-white/10",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-full rounded-full bg-white/50",
								style: { width: `${item.vote_average / 10 * 100}%` }
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-white/60 w-5 text-right",
							children: item.vote_average.toFixed(0)
						})]
					})
				]
			}, item.id))
		})]
	});
}
function StatsPage() {
	const { user, profile, signOut } = useAuth();
	const navigate = useNavigate();
	const { items, loading } = useLibrary();
	const provider = getAuthProvider(user);
	const displayName = (user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? user?.user_metadata?.global_name) || getDisplayName(profile);
	const avatarUrl = getAvatarUrl(profile);
	const total = items.length;
	const byStatus = (0, import_react.useMemo)(() => {
		const m = {};
		items.forEach((it) => {
			m[it.status] = (m[it.status] ?? 0) + 1;
		});
		return m;
	}, [items]);
	const ratingBuckets = (0, import_react.useMemo)(() => {
		const buckets = {
			"1-2": 0,
			"3-4": 0,
			"5-6": 0,
			"7-8": 0,
			"9-10": 0
		};
		items.forEach((it) => {
			const v = it.vote_average;
			if (v <= 2) buckets["1-2"]++;
			else if (v <= 4) buckets["3-4"]++;
			else if (v <= 6) buckets["5-6"]++;
			else if (v <= 8) buckets["7-8"]++;
			else buckets["9-10"]++;
		});
		return Object.entries(buckets).map(([name, value]) => ({
			name,
			value
		}));
	}, [items]);
	const pieData = (0, import_react.useMemo)(() => Object.entries(byStatus).map(([name, value]) => ({
		name,
		value
	})), [byStatus]);
	const movieCount = items.filter((i) => i.media_type === "movie").length;
	const tvCount = items.filter((i) => i.media_type === "tv").length;
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col min-h-screen",
		style: { background: "hsl(191,60%,5%)" },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navbar, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex-1 flex flex-col items-center justify-center gap-5 pt-24 px-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleUserRound, { className: "w-16 h-16 text-white/20" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-bold text-white",
					children: "Sign in to view your stats"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-white/45 text-sm text-center max-w-xs",
					children: "Track your watch history, genre preferences, and more."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/login",
					className: "px-6 py-2.5 rounded-xl text-sm font-semibold text-white",
					style: { background: "linear-gradient(135deg,hsl(189,70%,32%),hsl(189,80%,22%))" },
					children: "Sign In"
				})
			]
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col min-h-screen",
		style: { background: "hsl(191,60%,5%)" },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageMeta, { seo: noindexMetadata("My Stats", "/stats") }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navbar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "flex-1 max-w-screen-xl mx-auto w-full px-4 md:px-8 pt-24 pb-20 md:pb-16",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-4 mb-8 flex-wrap",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "relative w-14 h-14 rounded-full overflow-hidden shrink-0",
								style: { border: "2px solid rgba(255,255,255,0.15)" },
								children: avatarUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: avatarUrl,
									alt: displayName,
									className: "w-full h-full object-cover"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleUserRound, { className: "w-full h-full text-white/30 p-2" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 flex-wrap",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "text-xl font-bold text-white",
									children: displayName
								}), provider !== "email" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full",
									style: {
										background: provider === "google" ? "rgba(234,67,53,0.18)" : "rgba(88,101,242,0.22)",
										color: provider === "google" ? "#ea4335" : "#7289da",
										border: `1px solid ${provider === "google" ? "rgba(234,67,53,0.35)" : "rgba(88,101,242,0.40)"}`
									},
									children: provider
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-white/40 text-sm",
								children: profile?.email ?? ""
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: async () => {
								await signOut();
								toast.success("Signed out");
								navigate("/");
							},
							className: "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white/60 hover:text-white transition-colors",
							style: {
								background: "rgba(255,255,255,0.06)",
								border: "1px solid rgba(255,255,255,0.10)"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "w-4 h-4" }), " Sign Out"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 mb-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "w-5 h-5 text-cyan-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-lg font-bold text-white",
							children: "Stats & Insights"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-3 md:grid-cols-6 gap-3 mb-8",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
								label: "Total",
								value: total,
								icon: BookOpen,
								color: "#06b6d4"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
								label: "Watching",
								value: byStatus["Watching"] ?? 0,
								icon: Eye,
								color: "#3b82f6"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
								label: "Completed",
								value: byStatus["Completed"] ?? 0,
								icon: CircleCheck,
								color: "#22c55e"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
								label: "Plan to Watch",
								value: byStatus["Plan to Watch"] ?? 0,
								icon: Clock3,
								color: "#a855f7"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
								label: "On Hold",
								value: byStatus["On Hold"] ?? 0,
								icon: CirclePause,
								color: "#f59e0b"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
								label: "Dropped",
								value: byStatus["Dropped"] ?? 0,
								icon: CircleX,
								color: "#ef4444"
							})
						]
					}),
					loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex justify-center py-20",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-8 h-8 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" })
					}),
					!loading && total === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-center py-20 text-white/35",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "w-12 h-12 mx-auto mb-4 opacity-30" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-base font-medium",
								children: "Your library is empty"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm mt-1",
								children: "Start adding movies & shows to see your stats here."
							})
						]
					}),
					!loading && total > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl p-5",
								style: {
									background: "rgba(255,255,255,0.04)",
									border: "1px solid rgba(255,255,255,0.08)"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-sm font-semibold text-white mb-4",
									children: "Media Type"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-6",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-col items-center gap-1",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Film, { className: "w-8 h-8 text-cyan-400" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-2xl font-bold text-white",
													children: movieCount
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-xs text-white/40",
													children: "Movies"
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex-1 h-2 rounded-full overflow-hidden bg-white/8",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "h-full bg-cyan-500 rounded-full transition-all",
												style: { width: total > 0 ? `${movieCount / total * 100}%` : "0%" }
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-col items-center gap-1",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tv, { className: "w-8 h-8 text-purple-400" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-2xl font-bold text-white",
													children: tvCount
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-xs text-white/40",
													children: "TV Shows"
												})
											]
										})
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl p-5",
								style: {
									background: "rgba(255,255,255,0.04)",
									border: "1px solid rgba(255,255,255,0.08)"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-sm font-semibold text-white mb-4",
									children: "Rating Distribution"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
									width: "100%",
									height: 110,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
										data: ratingBuckets,
										barSize: 28,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
												dataKey: "name",
												tick: {
													fill: "rgba(255,255,255,0.40)",
													fontSize: 11
												},
												axisLine: false,
												tickLine: false
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, { hide: true }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
												contentStyle: {
													background: "rgba(10,20,24,0.95)",
													border: "1px solid rgba(255,255,255,0.12)",
													borderRadius: 10,
													color: "#fff",
													fontSize: 12
												},
												cursor: { fill: "rgba(255,255,255,0.04)" }
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
												dataKey: "value",
												radius: [
													4,
													4,
													0,
													0
												],
												children: ratingBuckets.map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: CHART_COLORS[i % CHART_COLORS.length] }, i))
											})
										]
									})
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl p-5",
								style: {
									background: "rgba(255,255,255,0.04)",
									border: "1px solid rgba(255,255,255,0.08)"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-sm font-semibold text-white mb-2",
									children: "Library Status"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
									width: "100%",
									height: 200,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PieChart, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pie, {
											data: pieData,
											cx: "50%",
											cy: "50%",
											innerRadius: 52,
											outerRadius: 76,
											dataKey: "value",
											paddingAngle: 3,
											children: pieData.map(({ name }, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: STATUS_COLORS[name] ?? CHART_COLORS[i % CHART_COLORS.length] }, i))
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
											contentStyle: {
												background: "rgba(10,20,24,0.95)",
												border: "1px solid rgba(255,255,255,0.12)",
												borderRadius: 10,
												color: "#fff",
												fontSize: 12
											},
											formatter: (value, name) => [value, name]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, {
											iconType: "circle",
											iconSize: 8,
											formatter: (value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: {
													color: "rgba(255,255,255,0.55)",
													fontSize: 11
												},
												children: value
											})
										})
									] })
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "md:col-span-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopRatedList, { items })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-2 md:grid-cols-5 gap-3 mb-4",
							children: Object.entries(STATUS_COLORS).map(([status, color]) => {
								const Icon = STATUS_ICONS[status] ?? BookOpen;
								const count = byStatus[status] ?? 0;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-2xl p-4 flex items-center gap-3",
									style: {
										background: "rgba(255,255,255,0.04)",
										border: `1px solid ${color}30`
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
										className: "w-5 h-5 shrink-0",
										style: { color }
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-white text-lg font-bold leading-none",
											children: count
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[11px] text-white/40 truncate mt-0.5",
											children: status
										})]
									})]
								}, status);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mb-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActivityHeatmap, { items })
						})
					] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, {})
		]
	});
}
export { StatsPage as default };
