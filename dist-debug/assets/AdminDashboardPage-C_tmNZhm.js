import { r as __toESM } from "./rolldown-runtime-SbdDWaPq.js";
import { J as require_react, L as require_jsx_runtime, z as Link } from "./dist-CiZ_rQl8.js";
import { t as Users } from "./users-CS9FK_8p.js";
import { t as Film } from "./film-uoMQFx7L.js";
import { t as BookOpen } from "./book-open-DF2T-gSK.js";
import { t as Heart } from "./heart-o7-jw9A6.js";
import { t as List } from "./list-Dquv8Qku.js";
import { j as Activity, t as AdminLayout } from "./AdminLayout-RSqDNN0w.js";
import { n as Pie, r as TrendingUp, t as PieChart } from "./PieChart-ClQY5k8k.js";
import { t as Eye } from "./eye-TDEOK5ms.js";
import { t as RefreshCw } from "./refresh-cw-CqBrT0bt.js";
import { a as CardTitle, i as CardHeader, n as CardContent, r as CardDescription, t as Card } from "./card-BitaWzvs.js";
import { n as Button, t as Badge } from "./badge-CsydfRnh.js";
import { h as toast, m as Skeleton } from "./index-BqTDaTws.js";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-B8vDdK30.js";
import { n as Area, r as CartesianGrid, t as AreaChart } from "./AreaChart-DUFcGMRS.js";
import { F as Cell, I as ResponsiveContainer, L as Tooltip, i as XAxis, p as Bar, r as YAxis, t as BarChart, z as Legend } from "./BarChart-Dcrhwdwr.js";
import { a as getMediaDistribution, n as getActivity, o as getStatusDistribution, r as getAdminStats, s as getTopTitles, u as getUserGrowth } from "./admin-D_OTUGmL.js";
import { S as tmdbImageUrl } from "./tmdb-D_Jm8xAZ.js";
// src/pages/admin/AdminDashboardPage.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var TIME_RANGES = [
	{
		label: "Today",
		days: 1
	},
	{
		label: "7 days",
		days: 7
	},
	{
		label: "30 days",
		days: 30
	},
	{
		label: "90 days",
		days: 90
	},
	{
		label: "All time",
		days: void 0
	}
];
function StatCard({ title, value, icon: Icon, loading, href, badge, color = "text-primary" }) {
	const inner = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "hover:border-primary/40 transition-colors group",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "p-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium text-muted-foreground mb-1",
						children: title
					}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-7 w-20" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-2xl font-bold text-foreground tabular-nums",
						children: (value ?? 0).toLocaleString()
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: `w-9 h-9 rounded-lg bg-muted/60 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: `w-4 h-4 ${color}` })
				})]
			}), badge && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				variant: "secondary",
				className: "mt-2 text-[10px]",
				children: badge
			})]
		})
	});
	return href ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: href,
		children: inner
	}) : inner;
}
var CHART_COLORS = [
	"hsl(210,80%,52%)",
	"hsl(38,75%,52%)",
	"hsl(160,60%,45%)",
	"hsl(280,60%,55%)",
	"hsl(0,65%,55%)"
];
function AdminDashboardPage() {
	const [timeRange, setTimeRange] = (0, import_react.useState)(TIME_RANGES[2]);
	const [stats, setStats] = (0, import_react.useState)(null);
	const [growth, setGrowth] = (0, import_react.useState)([]);
	const [activity, setActivity] = (0, import_react.useState)([]);
	const [topTitles, setTopTitles] = (0, import_react.useState)([]);
	const [mediaDistrib, setMediaDistrib] = (0, import_react.useState)([]);
	const [statusDistrib, setStatusDistrib] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [refreshing, setRefreshing] = (0, import_react.useState)(false);
	const loadAll = (0, import_react.useCallback)(async (showRefresh = false) => {
		if (showRefresh) setRefreshing(true);
		else setLoading(true);
		try {
			const [s, g, a, tt, md, sd] = await Promise.all([
				getAdminStats(timeRange.days),
				getUserGrowth(timeRange.days ?? 90),
				getActivity(timeRange.days ?? 30),
				getTopTitles(8),
				getMediaDistribution(),
				getStatusDistribution()
			]);
			setStats(s);
			setGrowth(g);
			setActivity(a);
			setTopTitles(tt);
			setMediaDistrib(md.map((r) => ({
				name: r.media_type === "movie" ? "Movies" : "TV Shows",
				value: Number(r.cnt)
			})));
			setStatusDistrib(sd.map((r) => ({
				name: r.status,
				value: Number(r.cnt)
			})));
		} catch (e) {
			toast.error("Failed to load dashboard data");
			console.error(e);
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	}, [timeRange]);
	(0, import_react.useEffect)(() => {
		loadAll();
	}, [loadAll]);
	const growthData = growth.map((r) => ({
		date: r.day.slice(5),
		new: Number(r.new_users),
		total: Number(r.cumulative_users)
	}));
	const activityData = activity.map((r) => ({
		date: r.day.slice(5),
		library: Number(r.library_adds),
		favorites: Number(r.favorites_adds),
		watchlist: Number(r.watchlist_adds)
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminLayout, {
		title: "Dashboard",
		breadcrumbs: [{ label: "Dashboard" }],
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "ghost",
			size: "sm",
			onClick: () => loadAll(true),
			disabled: refreshing,
			className: "gap-1.5 text-xs",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}` }), "Refresh"]
		}),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-3 mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Showing data for"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: String(timeRange.days ?? "all"),
					onValueChange: (v) => setTimeRange(TIME_RANGES.find((r) => String(r.days ?? "all") === v) ?? TIME_RANGES[2]),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						className: "w-36 h-8 text-xs",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: TIME_RANGES.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: String(r.days ?? "all"),
						children: r.label
					}, String(r.days ?? "all"))) })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 md:grid-cols-4 gap-3 mb-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						title: "Total Users",
						value: stats?.total_users,
						loading,
						icon: Users,
						href: "/admin/users",
						color: "text-primary"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						title: "New Users",
						value: stats?.new_users,
						loading,
						icon: TrendingUp,
						color: "text-chart-3"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						title: "Library Items",
						value: stats?.total_library_items,
						loading,
						icon: BookOpen,
						href: "/admin/watch-data",
						color: "text-chart-2"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						title: "New Library Items",
						value: stats?.new_library_items,
						loading,
						icon: TrendingUp,
						color: "text-chart-3"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						title: "Favorites",
						value: stats?.total_favorites,
						loading,
						icon: Heart,
						color: "text-chart-5"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						title: "Watchlist Items",
						value: stats?.total_watchlist_items,
						loading,
						icon: List,
						color: "text-chart-4"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						title: "Episode Progress",
						value: stats?.total_episode_progress,
						loading,
						icon: Film,
						color: "text-chart-1"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						title: "Currently Watching",
						value: stats?.currently_watching_users,
						loading,
						icon: Eye,
						color: "text-accent"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					className: "pb-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-sm font-semibold",
						children: "User Growth"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
						className: "text-xs",
						children: "New & cumulative signups"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "pt-0",
					children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-48 w-full" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: 200,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
							data: growthData,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
									id: "gTotal",
									x1: "0",
									y1: "0",
									x2: "0",
									y2: "1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
										offset: "5%",
										stopColor: CHART_COLORS[0],
										stopOpacity: .3
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
										offset: "95%",
										stopColor: CHART_COLORS[0],
										stopOpacity: 0
									})]
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									strokeDasharray: "3 3",
									stroke: "hsl(var(--border))"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "date",
									tick: {
										fontSize: 10,
										fill: "hsl(var(--muted-foreground))"
									},
									tickLine: false,
									axisLine: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									tick: {
										fontSize: 10,
										fill: "hsl(var(--muted-foreground))"
									},
									tickLine: false,
									axisLine: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
									background: "hsl(var(--card))",
									border: "1px solid hsl(var(--border))",
									borderRadius: 8,
									fontSize: 12
								} }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
									type: "monotone",
									dataKey: "total",
									stroke: CHART_COLORS[0],
									fill: "url(#gTotal)",
									strokeWidth: 2,
									name: "Total"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
									type: "monotone",
									dataKey: "new",
									stroke: CHART_COLORS[2],
									fill: "none",
									strokeWidth: 2,
									strokeDasharray: "4 2",
									name: "New"
								})
							]
						})
					})
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					className: "pb-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-sm font-semibold",
						children: "Watch Activity"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
						className: "text-xs",
						children: "Daily library / favorites / watchlist adds"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "pt-0",
					children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-48 w-full" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: 200,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
							data: activityData,
							barSize: 4,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									strokeDasharray: "3 3",
									stroke: "hsl(var(--border))"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "date",
									tick: {
										fontSize: 10,
										fill: "hsl(var(--muted-foreground))"
									},
									tickLine: false,
									axisLine: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									tick: {
										fontSize: 10,
										fill: "hsl(var(--muted-foreground))"
									},
									tickLine: false,
									axisLine: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
									background: "hsl(var(--card))",
									border: "1px solid hsl(var(--border))",
									borderRadius: 8,
									fontSize: 12
								} }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, { wrapperStyle: { fontSize: 11 } }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "library",
									fill: CHART_COLORS[0],
									name: "Library",
									radius: [
										2,
										2,
										0,
										0
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "favorites",
									fill: CHART_COLORS[1],
									name: "Favorites",
									radius: [
										2,
										2,
										0,
										0
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "watchlist",
									fill: CHART_COLORS[2],
									name: "Watchlist",
									radius: [
										2,
										2,
										0,
										0
									]
								})
							]
						})
					})
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
						className: "pb-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-sm font-semibold",
							children: "Media Type"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "pt-0",
						children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40 w-full" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: 160,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PieChart, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pie, {
								data: mediaDistrib,
								dataKey: "value",
								nameKey: "name",
								cx: "50%",
								cy: "50%",
								outerRadius: 60,
								label: ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`,
								labelLine: false,
								style: { fontSize: 10 },
								children: mediaDistrib.map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: CHART_COLORS[i % CHART_COLORS.length] }, i))
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
								background: "hsl(var(--card))",
								border: "1px solid hsl(var(--border))",
								borderRadius: 8,
								fontSize: 12
							} })] })
						})
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
						className: "pb-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-sm font-semibold",
							children: "Library Status"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "pt-0",
						children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40 w-full" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: 160,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
								data: statusDistrib,
								layout: "vertical",
								barSize: 12,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
										strokeDasharray: "3 3",
										stroke: "hsl(var(--border))",
										horizontal: false
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
										type: "number",
										tick: {
											fontSize: 10,
											fill: "hsl(var(--muted-foreground))"
										},
										tickLine: false,
										axisLine: false
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
										type: "category",
										dataKey: "name",
										tick: {
											fontSize: 9,
											fill: "hsl(var(--muted-foreground))"
										},
										width: 80,
										tickLine: false,
										axisLine: false
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
										background: "hsl(var(--card))",
										border: "1px solid hsl(var(--border))",
										borderRadius: 8,
										fontSize: 12
									} }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
										dataKey: "value",
										name: "Items",
										radius: [
											0,
											2,
											2,
											0
										],
										children: statusDistrib.map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: CHART_COLORS[i % CHART_COLORS.length] }, i))
									})
								]
							})
						})
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
						className: "pb-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-sm font-semibold",
							children: "Top Saved Titles"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "pt-0",
						children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-2",
							children: Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-full" }, i))
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-1",
							children: topTitles.slice(0, 6).map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 py-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "w-4 text-[10px] text-muted-foreground tabular-nums",
										children: i + 1
									}),
									t.poster_path && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: tmdbImageUrl(t.poster_path, "w45") ?? "",
										alt: t.title,
										className: "w-6 h-8 rounded object-cover shrink-0"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex-1 min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs font-medium truncate",
											children: t.title
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[10px] text-muted-foreground capitalize",
											children: t.media_type
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "secondary",
										className: "text-[10px] shrink-0",
										children: t.save_count
									})
								]
							}, t.tmdb_id))
						})
					})] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 md:grid-cols-4 gap-3",
				children: [
					{
						label: "Manage Users",
						href: "/admin/users",
						icon: Users
					},
					{
						label: "Watch Data",
						href: "/admin/watch-data",
						icon: BookOpen
					},
					{
						label: "Analytics",
						href: "/admin/analytics",
						icon: Activity
					},
					{
						label: "Audit Logs",
						href: "/admin/logs",
						icon: FileText
					}
				].map(({ label, href, icon: Icon }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: href,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "hover:border-primary/40 transition-colors cursor-pointer",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "p-4 flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "w-4 h-4 text-primary shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-medium truncate",
								children: label
							})]
						})
					})
				}, href))
			})
		]
	});
}
function FileText({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		className,
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", { points: "14 2 14 8 20 8" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: "16",
				y1: "13",
				x2: "8",
				y2: "13"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: "16",
				y1: "17",
				x2: "8",
				y2: "17"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: "10",
				y1: "9",
				x2: "8",
				y2: "9"
			})
		]
	});
}
export { AdminDashboardPage as default };
