import { r as __toESM } from "./rolldown-runtime-SbdDWaPq.js";
import { G as useParams, J as require_react, L as require_jsx_runtime, W as useNavigate, z as Link } from "./dist-CiZ_rQl8.js";
import { t as ArrowLeft } from "./arrow-left-w48oU94W.js";
import { t as BookOpen } from "./book-open-DF2T-gSK.js";
import { t as Heart } from "./heart-o7-jw9A6.js";
import { t as ShieldBan } from "./shield-ban-D-RB2_S3.js";
import { t as ShieldCheck } from "./shield-check-BQcpmVdA.js";
import { t as createLucideIcon } from "./createLucideIcon-CdXsxZqL.js";
import { t as Trash2 } from "./trash-2-D9xIdnDQ.js";
import { t as RefreshCw } from "./refresh-cw-CqBrT0bt.js";
import { S as AvatarImage, b as Avatar, k as UserRound, t as AdminLayout, x as AvatarFallback } from "./AdminLayout-RSqDNN0w.js";
import { a as CardTitle, i as CardHeader, n as CardContent, t as Card } from "./card-BitaWzvs.js";
import { n as Button, t as Badge } from "./badge-CsydfRnh.js";
import { h as toast, m as Skeleton } from "./index-BqTDaTws.js";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-D5Wvmc8_.js";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, l as AlertDialogTrigger, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog-CiWlBX0t.js";
import { c as getUserDetails, d as getUserLibrary, h as updateUser, l as getUserFavorites, m as logAdminAction, t as deleteUser } from "./admin-D_OTUGmL.js";
import { S as tmdbImageUrl } from "./tmdb-D_Jm8xAZ.js";
/**
* @license lucide-react v0.576.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Shield = createLucideIcon("shield", [["path", {
	d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
	key: "oel41y"
}]]);
// src/pages/admin/AdminUserDetailPage.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function StatBadge({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "text-center px-4 py-3 bg-muted/40 rounded-lg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-lg font-bold tabular-nums",
			children: value
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[10px] text-muted-foreground mt-0.5",
			children: label
		})]
	});
}
function AdminUserDetailPage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [details, setDetails] = (0, import_react.useState)(null);
	const [library, setLibrary] = (0, import_react.useState)([]);
	const [favs, setFavs] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [actioning, setActioning] = (0, import_react.useState)(false);
	const load = (0, import_react.useCallback)(async () => {
		if (!id) return;
		setLoading(true);
		try {
			const [d, lib, fv] = await Promise.all([
				getUserDetails(id),
				getUserLibrary(id, 20),
				getUserFavorites(id, 20)
			]);
			setDetails(d);
			setLibrary(lib);
			setFavs(fv);
		} catch {
			toast.error("Failed to load user details");
		} finally {
			setLoading(false);
		}
	}, [id]);
	(0, import_react.useEffect)(() => {
		load();
	}, [load]);
	const handleSuspend = async (suspend) => {
		if (!id || !details) return;
		setActioning(true);
		try {
			await updateUser(id, { is_suspended: suspend });
			await logAdminAction(suspend ? "user_suspended" : "user_restored", "user", id, { email: details.profile.email ?? void 0 });
			toast.success(suspend ? "User suspended" : "User restored");
			await load();
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Action failed");
		} finally {
			setActioning(false);
		}
	};
	const handleRoleToggle = async () => {
		if (!id || !details) return;
		const newRole = details.profile.role === "admin" ? "user" : "admin";
		setActioning(true);
		try {
			await updateUser(id, { role: newRole });
			await logAdminAction("user_role_changed", "user", id, { new_role: newRole });
			toast.success(`Role changed to ${newRole}`);
			await load();
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Action failed");
		} finally {
			setActioning(false);
		}
	};
	const handleDelete = async () => {
		if (!id || !details) return;
		setActioning(true);
		try {
			await logAdminAction("user_deleted", "user", id, { email: details.profile.email ?? void 0 });
			await deleteUser(id);
			toast.success("User deleted");
			navigate("/admin/users");
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Action failed");
			setActioning(false);
		}
	};
	const p = details?.profile;
	const displayName = p ? p.full_name || p.display_name || p.username || p.email || p.id.slice(0, 8) : "…";
	const initial = displayName.charAt(0).toUpperCase();
	const avatarUrl = p?.avatar_url || p?.provider_avatar_url;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminLayout, {
		breadcrumbs: [{
			label: "Users",
			href: "/admin/users"
		}, { label: loading ? "…" : displayName }],
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "sm",
				asChild: true,
				className: "gap-1.5 text-xs -ml-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/admin/users",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "w-3.5 h-3.5" }), " Back to Users"]
				})
			})
		}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-32 w-full rounded-xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-64 w-full rounded-xl" })]
		}) : !details ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-center py-16 text-muted-foreground",
			children: "User not found"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "p-5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col md:flex-row items-start md:items-center gap-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
								className: "w-16 h-16 shrink-0",
								children: [avatarUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, { src: avatarUrl }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
									className: "text-xl bg-primary/20 text-primary font-bold",
									children: initial
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1 min-w-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 flex-wrap",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
												className: "text-lg font-bold",
												children: displayName
											}),
											p.role === "admin" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												className: "text-[10px] bg-primary/20 text-primary border-primary/30",
												children: "Admin"
											}),
											p.is_suspended && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "destructive",
												className: "text-[10px]",
												children: "Suspended"
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-muted-foreground mt-0.5",
										children: p.email
									}),
									p.username && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted-foreground",
										children: ["@", p.username]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap gap-4 mt-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-[11px] text-muted-foreground",
												children: ["Joined ", new Date(p.created_at).toLocaleDateString()]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-[11px] text-muted-foreground",
												children: ["Updated ", new Date(p.updated_at).toLocaleDateString()]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[11px] font-mono text-muted-foreground/60",
												children: p.id
											})
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap gap-2 shrink-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "outline",
										size: "sm",
										onClick: handleRoleToggle,
										disabled: actioning,
										className: "gap-1.5 text-xs h-8",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "w-3.5 h-3.5" }), p.role === "admin" ? "Remove Admin" : "Make Admin"]
									}),
									p.is_suspended ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "outline",
										size: "sm",
										onClick: () => handleSuspend(false),
										disabled: actioning,
										className: "gap-1.5 text-xs h-8 text-chart-3 border-chart-3/40",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "w-3.5 h-3.5" }), " Restore"]
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "outline",
										size: "sm",
										onClick: () => handleSuspend(true),
										disabled: actioning,
										className: "gap-1.5 text-xs h-8 text-destructive border-destructive/40",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldBan, { className: "w-3.5 h-3.5" }), " Suspend"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialog, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTrigger, {
										asChild: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											variant: "outline",
											size: "sm",
											disabled: actioning,
											className: "gap-1.5 text-xs h-8 text-destructive border-destructive/40",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "w-3.5 h-3.5" }), " Delete"]
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, {
										className: "max-w-[calc(100%-2rem)] md:max-w-lg",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Delete user account?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogDescription, { children: [
											"This permanently deletes ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: displayName }),
											" and all their data — library, favorites, watchlist, episode progress. This action cannot be undone."
										] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Cancel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
											onClick: handleDelete,
											className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
											children: "Delete permanently"
										})] })]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										size: "sm",
										onClick: () => load(),
										disabled: loading,
										className: "gap-1.5 text-xs h-8",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "w-3.5 h-3.5" })
									})
								]
							})
						]
					})
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-3 md:grid-cols-6 gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatBadge, {
							label: "Library",
							value: details.library_count
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatBadge, {
							label: "Favorites",
							value: details.favorites_count
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatBadge, {
							label: "Watchlist",
							value: details.watchlist_count
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatBadge, {
							label: "Watching",
							value: details.watching_count
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatBadge, {
							label: "Completed",
							value: details.completed_count
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatBadge, {
							label: "Episodes",
							value: details.episode_progress_count
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
					className: "pb-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-sm font-semibold",
						children: "User Activity"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "pt-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
						defaultValue: "library",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
								className: "h-8 text-xs mb-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
									value: "library",
									className: "text-xs gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "w-3 h-3" }), " Library"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
									value: "favorites",
									className: "text-xs gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "w-3 h-3" }), " Favorites"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
								value: "library",
								children: library.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted-foreground py-4 text-center",
									children: "No library items"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid grid-cols-2 md:grid-cols-4 gap-3",
									children: library.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: `/detail/${item.media_type}/${item.tmdb_id}`,
										className: "flex items-start gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors group",
										children: [item.poster_path ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: tmdbImageUrl(item.poster_path, "w92") ?? "",
											alt: item.title,
											className: "w-10 h-14 rounded object-cover shrink-0"
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "w-10 h-14 rounded bg-muted flex items-center justify-center shrink-0",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRound, { className: "w-4 h-4 text-muted-foreground" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "min-w-0 flex-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs font-medium truncate",
												children: item.title
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "secondary",
												className: "text-[9px] mt-1",
												children: item.status
											})]
										})]
									}, item.id))
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
								value: "favorites",
								children: favs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted-foreground py-4 text-center",
									children: "No favorites"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid grid-cols-2 md:grid-cols-4 gap-3",
									children: favs.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: `/detail/${item.media_type}/${item.tmdb_id}`,
										className: "flex items-start gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors",
										children: [item.poster_path ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: tmdbImageUrl(item.poster_path, "w92") ?? "",
											alt: item.title,
											className: "w-10 h-14 rounded object-cover shrink-0"
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-10 h-14 rounded bg-muted shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "min-w-0 flex-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs font-medium truncate",
												children: item.title
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[10px] text-muted-foreground capitalize mt-0.5",
												children: item.media_type
											})]
										})]
									}, item.id))
								})
							})
						]
					})
				})] })
			]
		})]
	});
}
export { AdminUserDetailPage as default };
