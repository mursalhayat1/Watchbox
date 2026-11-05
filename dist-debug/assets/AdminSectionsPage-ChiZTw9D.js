import { r as __toESM } from "./rolldown-runtime-SbdDWaPq.js";
import { J as require_react, L as require_jsx_runtime, W as useNavigate } from "./dist-CiZ_rQl8.js";
import { a as verticalListSortingStrategy, c as PointerSensor, d as useSensors, f as CSS, i as useSortable, l as closestCenter, n as arrayMove, o as DndContext, p as GripVertical, r as sortableKeyboardCoordinates, s as KeyboardSensor, t as SortableContext, u as useSensor } from "./sortable.esm-DEUymm83.js";
import { t as Plus } from "./plus-B3yFzkq8.js";
import { t as createLucideIcon } from "./createLucideIcon-CdXsxZqL.js";
import { t as Trash2 } from "./trash-2-D9xIdnDQ.js";
import { t as Copy } from "./copy-C7c4rQzw.js";
import { t as Eye } from "./eye-TDEOK5ms.js";
import { t as Search } from "./search-B48WcWYH.js";
import { A as LayoutList, a as DropdownMenuSeparator, i as DropdownMenuItem, n as DropdownMenu, o as DropdownMenuTrigger, r as DropdownMenuContent, t as AdminLayout } from "./AdminLayout-RSqDNN0w.js";
import { t as RefreshCw } from "./refresh-cw-CqBrT0bt.js";
import { t as ChevronDown } from "./chevron-down-dH9xOy80.js";
import { a as CardTitle, i as CardHeader, n as CardContent, r as CardDescription, t as Card } from "./card-BitaWzvs.js";
import { n as Button, t as Badge } from "./badge-CsydfRnh.js";
import { t as Input } from "./input-DX_qP3JW.js";
import { c as Tooltip, d as TooltipTrigger, h as toast, l as TooltipContent, m as Skeleton, u as TooltipProvider } from "./index-BqTDaTws.js";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog-CiWlBX0t.js";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-B8vDdK30.js";
import { a as adminDuplicateSection, c as adminUpdateSection, i as adminDeleteSection, l as effectiveStatus, o as adminListSections, s as adminReorderSections } from "./sections-WlYP6kNM.js";
/**
* @license lucide-react v0.576.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Funnel = createLucideIcon("funnel", [["path", {
	d: "M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z",
	key: "sc7q7i"
}]]);
/**
* @license lucide-react v0.576.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Pencil = createLucideIcon("pencil", [["path", {
	d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
	key: "1a8usu"
}], ["path", {
	d: "m15 5 4 4",
	key: "1mk7zo"
}]]);
/**
* @license lucide-react v0.576.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Power = createLucideIcon("power", [["path", {
	d: "M12 2v10",
	key: "mnfbl"
}], ["path", {
	d: "M18.4 6.6a9 9 0 1 1-12.77.04",
	key: "obofu9"
}]]);
// src/pages/admin/AdminSectionsPage.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var STATUS_CONFIG = {
	published: {
		label: "Published",
		variant: "default",
		className: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
	},
	draft: {
		label: "Draft",
		variant: "secondary",
		className: ""
	},
	scheduled: {
		label: "Scheduled",
		variant: "outline",
		className: "bg-blue-500/15 text-blue-400 border-blue-500/30"
	},
	disabled: {
		label: "Disabled",
		variant: "outline",
		className: "bg-muted/50 text-muted-foreground"
	},
	expired: {
		label: "Expired",
		variant: "destructive",
		className: "bg-destructive/10 text-destructive border-destructive/30"
	}
};
function StatusBadge({ status }) {
	const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: cfg.variant,
		className: `text-[10px] px-1.5 py-0 h-5 font-medium ${cfg.className}`,
		children: cfg.label
	});
}
var TYPE_LABELS = {
	dynamic: "Dynamic",
	manual: "Manual",
	hybrid: "Hybrid ★"
};
var LAYOUT_LABELS = {
	carousel: "Carousel",
	large_cards: "Large Cards",
	small_cards: "Small Cards",
	grid: "Grid",
	compact_list: "Compact List",
	featured_carousel: "Featured Carousel",
	hero_cards: "Hero + Cards"
};
var SORT_LABELS = {
	popularity: "Popular",
	top_rated: "Top Rated",
	trending_today: "Trending Today",
	trending_week: "Trending Week",
	trending_month: "Trending Month",
	newest_release: "Newest",
	oldest_release: "Oldest",
	highest_vote_count: "Most Votes",
	az: "A-Z",
	za: "Z-A",
	random: "Random",
	relevance: "Relevance",
	recently_added: "Recently Added",
	recently_updated: "Recently Updated",
	most_watched: "Most Watched",
	lowest_vote_count: "Fewest Votes"
};
function SortableRow({ section, onEdit, onDuplicate, onToggle, onPreview, onDelete }) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
	const eff = effectiveStatus(section);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: setNodeRef,
		style: {
			transform: CSS.Transform.toString(transform),
			transition
		},
		className: `flex items-center gap-3 p-3 rounded-lg border bg-card transition-all
        ${isDragging ? "opacity-60 shadow-xl z-50 scale-[1.01]" : "hover:bg-muted/40"}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				...attributes,
				...listeners,
				className: "touch-none text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing shrink-0 p-1",
				"aria-label": "Drag to reorder",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GripVertical, { className: "w-4 h-4" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[11px] text-muted-foreground w-6 text-center shrink-0 tabular-nums",
				children: section.position
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 flex-wrap",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-semibold text-foreground truncate",
						children: section.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						className: "text-[10px] px-1.5 py-0 h-5 shrink-0",
						children: TYPE_LABELS[section.section_type] ?? section.section_type
					})]
				}), section.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] text-muted-foreground truncate mt-0.5",
					children: section.description
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "shrink-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: eff })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "hidden md:block text-[11px] text-muted-foreground shrink-0 w-12",
				children: section.content_type === "all" ? "All" : section.content_type === "movie" ? "Movies" : "TV"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "hidden lg:block text-[11px] text-muted-foreground shrink-0 w-28 truncate",
				children: LAYOUT_LABELS[section.layout] ?? section.layout
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "hidden xl:block text-[11px] text-muted-foreground shrink-0 w-28 truncate",
				children: SORT_LABELS[section.sort_by] ?? section.sort_by
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "hidden md:block text-[11px] text-muted-foreground shrink-0 w-8 text-center",
				children: section.item_limit
			}),
			(section.start_at || section.end_at) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "hidden lg:block text-[10px] text-blue-400 shrink-0 truncate max-w-[80px]",
				children: section.start_at ? new Date(section.start_at).toLocaleDateString() : "—"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "hidden xl:block text-[10px] text-muted-foreground/60 shrink-0 w-20 text-right",
				children: new Date(section.updated_at).toLocaleDateString()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-1 shrink-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TooltipProvider, {
					delayDuration: 300,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							className: "h-7 w-7",
							onClick: () => onPreview(section),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "w-3.5 h-3.5" })
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: "Preview" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							className: "h-7 w-7",
							onClick: () => onEdit(section),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "w-3.5 h-3.5" })
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: "Edit" })] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						className: "h-7 w-7",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "w-3.5 h-3.5" })
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
					align: "end",
					className: "w-44",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
							onClick: () => onDuplicate(section),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "w-3.5 h-3.5 mr-2" }), "Duplicate"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
							onClick: () => onToggle(section),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Power, { className: "w-3.5 h-3.5 mr-2" }), eff === "disabled" ? "Enable" : "Disable"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
							className: "text-destructive focus:text-destructive",
							onClick: () => onDelete(section),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "w-3.5 h-3.5 mr-2" }), "Delete"]
						})
					]
				})] })]
			})
		]
	});
}
function TableHeader() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-3 px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 select-none",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-6 shrink-0" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "w-6 shrink-0",
				children: "Pos"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex-1 min-w-0",
				children: "Name"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "shrink-0 w-20",
				children: "Status"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "hidden md:block shrink-0 w-12",
				children: "Type"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "hidden lg:block shrink-0 w-28",
				children: "Layout"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "hidden xl:block shrink-0 w-28",
				children: "Sort"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "hidden md:block shrink-0 w-8 text-center",
				children: "Limit"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "hidden lg:block shrink-0 w-20",
				children: "Schedule"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "hidden xl:block shrink-0 w-20 text-right",
				children: "Updated"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "shrink-0 w-24" })
		]
	});
}
function AdminSectionsPage() {
	const navigate = useNavigate();
	const [sections, setSections] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [search, setSearch] = (0, import_react.useState)("");
	const [filterStatus, setFilter] = (0, import_react.useState)("all");
	const [deleteTarget, setDeleteTarget] = (0, import_react.useState)(null);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
	const load = (0, import_react.useCallback)(async () => {
		setLoading(true);
		try {
			const data = await adminListSections();
			setSections(data);
		} catch (e) {
			toast.error("Failed to load sections");
		} finally {
			setLoading(false);
		}
	}, []);
	(0, import_react.useEffect)(() => {
		load();
	}, [load]);
	async function handleDragEnd(event) {
		const { active, over } = event;
		if (!over || active.id === over.id) return;
		const oldIdx = sections.findIndex((s) => s.id === active.id);
		const newIdx = sections.findIndex((s) => s.id === over.id);
		const withPositions = arrayMove(sections, oldIdx, newIdx).map((s, i) => ({
			...s,
			position: (i + 1) * 10
		}));
		setSections(withPositions);
		setSaving(true);
		try {
			await adminReorderSections(withPositions.map((s) => s.id), withPositions.map((s) => s.position));
		} catch {
			toast.error("Failed to save order");
			load();
		} finally {
			setSaving(false);
		}
	}
	async function handleToggle(section) {
		const newStatus = effectiveStatus(section) === "disabled" ? "published" : "disabled";
		try {
			await adminUpdateSection(section.id, { status: newStatus });
			setSections((prev) => prev.map((s) => s.id === section.id ? {
				...s,
				status: newStatus
			} : s));
			toast.success(`Section ${newStatus === "published" ? "enabled" : "disabled"}`);
		} catch {
			toast.error("Failed to update section");
		}
	}
	async function handleDuplicate(section) {
		try {
			const dup = await adminDuplicateSection(section.id);
			setSections((prev) => [...prev, dup]);
			toast.success(`"${section.name}" duplicated as draft`);
		} catch {
			toast.error("Failed to duplicate section");
		}
	}
	async function confirmDelete() {
		if (!deleteTarget) return;
		try {
			await adminDeleteSection(deleteTarget.id);
			setSections((prev) => prev.filter((s) => s.id !== deleteTarget.id));
			toast.success("Section deleted");
		} catch {
			toast.error("Failed to delete section");
		} finally {
			setDeleteTarget(null);
		}
	}
	const filtered = sections.filter((s) => {
		const eff = effectiveStatus(s);
		return (!search || s.name.toLowerCase().includes(search.toLowerCase())) && (filterStatus === "all" || eff === filterStatus);
	});
	const stats = {
		total: sections.length,
		published: sections.filter((s) => effectiveStatus(s) === "published").length,
		draft: sections.filter((s) => effectiveStatus(s) === "draft").length,
		disabled: sections.filter((s) => effectiveStatus(s) === "disabled").length
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminLayout, {
		breadcrumbs: [{ label: "Sections" }],
		title: "Homepage Sections",
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			size: "sm",
			onClick: () => navigate("/admin/sections/create"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "w-4 h-4 mr-1.5" }), "New Section"]
		}),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 md:grid-cols-4 gap-3 mb-6",
				children: [
					{
						label: "Total",
						value: stats.total,
						color: ""
					},
					{
						label: "Published",
						value: stats.published,
						color: "text-emerald-500"
					},
					{
						label: "Draft",
						value: stats.draft,
						color: "text-muted-foreground"
					},
					{
						label: "Disabled",
						value: stats.disabled,
						color: "text-amber-500"
					}
				].map(({ label, value, color }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground mb-1",
						children: label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: `text-2xl font-bold tabular-nums ${color}`,
						children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-7 w-8 inline-block" }) : value
					})]
				}) }, label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col md:flex-row gap-3 mb-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative flex-1 min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							placeholder: "Search sections…",
							className: "pl-9",
							value: search,
							onChange: (e) => setSearch(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: filterStatus,
						onValueChange: setFilter,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectTrigger, {
							className: "w-40 shrink-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Funnel, { className: "w-3.5 h-3.5 mr-2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "all",
								children: "All statuses"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "published",
								children: "Published"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "draft",
								children: "Draft"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "scheduled",
								children: "Scheduled"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "disabled",
								children: "Disabled"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "expired",
								children: "Expired"
							})
						] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "icon",
						onClick: load,
						disabled: loading,
						className: "shrink-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `w-4 h-4 ${loading ? "animate-spin" : ""}` })
					})
				]
			}),
			saving && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted-foreground mb-2 flex items-center gap-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "w-3 h-3 animate-spin" }), "Saving order…"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
				className: "pb-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center justify-between gap-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
						className: "text-base flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutList, { className: "w-4 h-4 text-primary" }), "Sections"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Drag rows to reorder. Order controls the homepage display order." })] })
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "pt-0",
				children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-2",
					children: Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-14 w-full rounded-lg" }, i))
				}) : filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center justify-center py-16 gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutList, { className: "w-10 h-10 text-muted-foreground/40" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: search || filterStatus !== "all" ? "No sections match your filter." : "No sections yet."
						}),
						!search && filterStatus === "all" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							onClick: () => navigate("/admin/sections/create"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "w-4 h-4 mr-1.5" }), "Create first section"]
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DndContext, {
						sensors,
						collisionDetection: closestCenter,
						onDragEnd: handleDragEnd,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortableContext, {
							items: filtered.map((s) => s.id),
							strategy: verticalListSortingStrategy,
							children: filtered.map((section) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortableRow, {
								section,
								onEdit: (s) => navigate(`/admin/sections/${s.id}/edit`),
								onDuplicate: handleDuplicate,
								onToggle: handleToggle,
								onPreview: (s) => navigate(`/admin/sections/${s.id}/preview`),
								onDelete: (s) => setDeleteTarget(s)
							}, section.id))
						})
					})]
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
				open: !!deleteTarget,
				onOpenChange: (open) => !open && setDeleteTarget(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, {
					className: "max-w-[calc(100%-2rem)] md:max-w-lg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogTitle, { children: [
						"Delete \"",
						deleteTarget?.name,
						"\"?"
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: "This will permanently remove the section from the homepage. This action cannot be undone." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Cancel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
						className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
						onClick: confirmDelete,
						children: "Delete"
					})] })]
				})
			})
		]
	});
}
export { AdminSectionsPage as default };
