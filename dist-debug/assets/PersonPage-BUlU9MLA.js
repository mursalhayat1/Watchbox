import { r as __toESM } from "./rolldown-runtime-SbdDWaPq.js";
import { A as useAuth, G as useParams, J as require_react, L as require_jsx_runtime, z as Link } from "./dist-CiZ_rQl8.js";
import { t as ArrowLeft } from "./arrow-left-w48oU94W.js";
import { t as Heart } from "./heart-o7-jw9A6.js";
import { t as createLucideIcon } from "./createLucideIcon-CdXsxZqL.js";
import { t as Calendar } from "./calendar-DSCeGRW1.js";
import { t as User } from "./user-Bo4eTJUg.js";
import { t as ExternalLink } from "./external-link-DerKKTRF.js";
import { t as Film } from "./film-uoMQFx7L.js";
import { t as Tv } from "./tv-CASs2yUo.js";
import { t as ChevronLeft } from "./chevron-left-asACpT8_.js";
import { t as ChevronRight } from "./chevron-right-B7MVhAaO.js";
import { h as toast, i as generatePersonMetadata, t as PageMeta } from "./index-BqTDaTws.js";
import { n as Navbar, t as Footer } from "./Footer-DJ1ZEBZc.js";
import { n as GlassFilterDef, t as GlassButton } from "./liquid-glass-B_BlSmm5.js";
import { t as Silk } from "./Silk-D_eXH-HI.js";
import { t as useAsync } from "./useTMDB-iI3pS55R.js";
import { S as tmdbImageUrl, o as getPersonDetails } from "./tmdb-D_Jm8xAZ.js";
import { n as isFavoriteActor, r as toggleFavoriteActor } from "./actorFavorites-Dcj_wPng.js";
import { t as formatDate } from "./format-date-BWQUQ3t9.js";
/**
* @license lucide-react v0.576.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var MapPin = createLucideIcon("map-pin", [["path", {
	d: "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",
	key: "1r0f0z"
}], ["circle", {
	cx: "12",
	cy: "10",
	r: "3",
	key: "ilqhr7"
}]]);
// src/pages/PersonPage.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function calcAge(birthday, deathday) {
	const end = deathday ? new Date(deathday) : /* @__PURE__ */ new Date();
	const birth = new Date(birthday);
	let age = end.getFullYear() - birth.getFullYear();
	const m = end.getMonth() - birth.getMonth();
	if (m < 0 || m === 0 && end.getDate() < birth.getDate()) age--;
	return age;
}
function genderLabel(g) {
	if (g === 1) return "Female";
	if (g === 2) return "Male";
	if (g === 3) return "Non-binary";
	return "Unknown";
}
function fmtDate(d) {
	return formatDate(d);
}
function CreditCard({ credit }) {
	const title = credit.title ?? credit.name ?? "Unknown";
	const year = (credit.release_date ?? credit.first_air_date ?? "").slice(0, 4);
	const poster = tmdbImageUrl(credit.poster_path, "w342");
	const href = `/detail/${credit.media_type}/${credit.id}`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: href,
		className: "group flex flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative w-full rounded-xl overflow-hidden bg-white/6 border border-white/8",
				style: { aspectRatio: "2/3" },
				children: [poster ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: poster,
					alt: title,
					className: "w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "w-full h-full flex items-center justify-center",
					children: credit.media_type === "tv" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tv, { className: "w-8 h-8 text-white/20" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Film, { className: "w-8 h-8 text-white/20" })
				}), year && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "absolute top-2 left-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-md",
					style: {
						background: "rgba(0,0,0,0.65)",
						color: "rgba(255,255,255,0.8)",
						backdropFilter: "blur(4px)"
					},
					children: year
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1.5 text-xs font-semibold text-white/90 truncate leading-snug",
				children: title
			}),
			credit.character && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] text-white/45 truncate",
				children: credit.character
			}),
			credit.job && !credit.character && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] text-white/45 truncate",
				children: credit.job
			})
		]
	});
}
var glassArrow = {
	backdropFilter: "blur(20px) saturate(180%)",
	WebkitBackdropFilter: "blur(20px) saturate(180%)",
	background: "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 100%)",
	border: "1px solid rgba(255,255,255,0.22)",
	boxShadow: "0 4px 24px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.28)"
};
function KnownForRow({ credits }) {
	const scrollRef = (0, import_react.useRef)(null);
	const [canLeft, setCanLeft] = (0, import_react.useState)(false);
	const [canRight, setCanRight] = (0, import_react.useState)(true);
	const onScroll = (0, import_react.useCallback)(() => {
		const el = scrollRef.current;
		if (!el) return;
		setCanLeft(el.scrollLeft > 0);
		setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
	}, []);
	const scroll = (dir) => {
		const el = scrollRef.current;
		if (!el) return;
		el.scrollBy({
			left: dir === "left" ? -(el.clientWidth * .75) : el.clientWidth * .75,
			behavior: "smooth"
		});
	};
	const featured = [...credits].filter((c) => c.poster_path).sort((a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0)).slice(0, 8);
	if (featured.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mb-10",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-center justify-between mb-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-base md:text-lg font-bold text-white",
				children: "Known For"
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative group/kfr",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => scroll("left"),
					disabled: !canLeft,
					"aria-label": "Scroll left",
					className: "absolute left-0 top-0 bottom-0 z-10 w-14 flex items-center justify-center\n            opacity-0 group-hover/kfr:opacity-100 disabled:!opacity-0\n            transition-opacity duration-200 pointer-events-none group-hover/kfr:pointer-events-auto",
					style: { background: "linear-gradient(to right, rgba(8,22,25,0.85) 0%, transparent 100%)" },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-9 h-9 rounded-full flex items-center justify-center text-white",
						style: glassArrow,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "w-4 h-4" })
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					ref: scrollRef,
					onScroll,
					className: "flex gap-4 overflow-x-auto hide-scrollbar pb-2",
					children: [featured.map((credit) => {
						const title = credit.title ?? credit.name ?? "";
						const year = (credit.release_date ?? credit.first_air_date ?? "").slice(0, 4);
						const poster = tmdbImageUrl(credit.poster_path, "w500");
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: `/detail/${credit.media_type}/${credit.id}`,
							className: "shrink-0 w-[200px] md:w-[240px] group",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative w-full rounded-2xl overflow-hidden border border-white/10",
								style: {
									aspectRatio: "2/3",
									background: "rgba(255,255,255,0.06)"
								},
								children: [
									poster && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: poster,
										alt: title,
										className: "w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "absolute inset-0 flex flex-col justify-end p-3",
										style: { background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)" },
										children: [
											year && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[10px] font-semibold text-white/60 mb-0.5",
												children: year
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm font-bold text-white leading-snug text-balance",
												children: title
											}),
											credit.character && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[11px] text-white/55 mt-0.5 truncate",
												children: credit.character
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "absolute top-2 right-2 text-[9px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide",
										style: {
											background: "rgba(0,0,0,0.60)",
											color: "rgba(255,255,255,0.75)",
											backdropFilter: "blur(4px)"
										},
										children: credit.media_type === "tv" ? "TV" : "Film"
									})
								]
							})
						}, `${credit.media_type}-${credit.id}`);
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "shrink-0 w-4 md:w-6",
						"aria-hidden": "true"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => scroll("right"),
					disabled: !canRight,
					"aria-label": "Scroll right",
					className: "absolute right-0 top-0 bottom-0 z-10 w-14 flex items-center justify-center\n            opacity-0 group-hover/kfr:opacity-100 disabled:!opacity-0\n            transition-opacity duration-200 pointer-events-none group-hover/kfr:pointer-events-auto",
					style: { background: "linear-gradient(to left, rgba(8,22,25,0.85) 0%, transparent 100%)" },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-9 h-9 rounded-full flex items-center justify-center text-white",
						style: glassArrow,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "w-4 h-4" })
					})
				})
			]
		})]
	});
}
function LoadingSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative min-h-screen bg-[#050a0e] flex flex-col overflow-x-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "fixed inset-0 z-0 pointer-events-none",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Silk, {
				color: "#0e7490",
				speed: 3,
				scale: 1.3,
				noiseIntensity: 1.1,
				rotation: .25
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0",
				style: { background: "linear-gradient(160deg, rgba(0,18,26,0.82) 0%, rgba(0,12,20,0.88) 40%, rgba(0,8,16,0.92) 100%)" }
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative z-10 flex flex-col min-h-screen",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navbar, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex-1 px-4 md:px-8 py-8 max-w-screen-xl mx-auto w-full",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-8 mt-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "shrink-0 w-[160px] h-[240px] rounded-2xl bg-white/8 animate-pulse" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1 space-y-3 pt-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-48 bg-white/8 rounded animate-pulse" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-4 w-24 bg-white/6 rounded animate-pulse" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-4 w-full max-w-sm bg-white/6 rounded animate-pulse" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-4 w-3/4 max-w-xs bg-white/6 rounded animate-pulse" })
						]
					})]
				})
			})]
		})]
	});
}
function PersonPage() {
	const { id } = useParams();
	const personId = Number(id);
	const [bioExpanded, setBioExpanded] = (0, import_react.useState)(false);
	const [filterTab, setFilterTab] = (0, import_react.useState)("all");
	const [actorFavorited, setActorFavorited] = (0, import_react.useState)(false);
	const [actorFavBusy, setActorFavBusy] = (0, import_react.useState)(false);
	const { user } = useAuth();
	const { data: person, loading, error } = useAsync(() => getPersonDetails(personId), [personId]);
	(0, import_react.useEffect)(() => {
		if (!user || !personId) return;
		isFavoriteActor(personId).then(setActorFavorited).catch(() => {});
	}, [user, personId]);
	const handleActorFavorite = (0, import_react.useCallback)(async () => {
		if (!user) {
			toast.error("Sign in to save favorites");
			return;
		}
		if (!person) return;
		setActorFavBusy(true);
		try {
			const next = await toggleFavoriteActor({
				person_id: person.id,
				name: person.name,
				profile_path: person.profile_path ?? null,
				known_for_department: person.known_for_department ?? null
			});
			setActorFavorited(next);
			toast.success(next ? `${person.name} added to favorites` : `${person.name} removed from favorites`);
		} catch {
			toast.error("Failed to update favorite");
		} finally {
			setActorFavBusy(false);
		}
	}, [user, person]);
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingSkeleton, {});
	if (error || !person) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative min-h-screen bg-[#050a0e] flex flex-col overflow-x-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "fixed inset-0 z-0 pointer-events-none",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Silk, {
				color: "#0e7490",
				speed: 3,
				scale: 1.3,
				noiseIntensity: 1.1,
				rotation: .25
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0",
				style: { background: "linear-gradient(160deg, rgba(0,18,26,0.82) 0%, rgba(0,12,20,0.88) 40%, rgba(0,8,16,0.92) 100%)" }
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative z-10 flex flex-col min-h-screen",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navbar, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex-1 flex items-center justify-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-center space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-white/60 text-lg",
						children: "Could not load this person."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "text-white/40 hover:text-white text-sm underline",
						children: "← Go back home"
					})]
				})
			})]
		})]
	});
	const allCredits = [...person.combined_credits?.cast ?? [], ...person.combined_credits?.crew ?? []];
	const seen = /* @__PURE__ */ new Set();
	const dedupedCredits = allCredits.filter((c) => {
		if (seen.has(c.id)) return false;
		seen.add(c.id);
		return true;
	}).sort((a, b) => {
		const da = a.release_date ?? a.first_air_date ?? "";
		return (b.release_date ?? b.first_air_date ?? "").localeCompare(da);
	});
	const movieCount = dedupedCredits.filter((c) => c.media_type === "movie").length;
	const tvCount = dedupedCredits.filter((c) => c.media_type === "tv").length;
	const filteredCredits = filterTab === "all" ? dedupedCredits : dedupedCredits.filter((c) => c.media_type === filterTab);
	const profileImg = tmdbImageUrl(person.profile_path, "w342");
	const imdbId = person.imdb_id ?? person.external_ids?.imdb_id;
	const BIO_LIMIT = 400;
	const shortBio = person.biography.length > BIO_LIMIT ? person.biography.slice(0, BIO_LIMIT) + "…" : person.biography;
	const seo = generatePersonMetadata(person, `/person/${person.id}`);
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
						className: "absolute top-0 left-0 w-[500px] h-[350px] pointer-events-none",
						style: { background: "radial-gradient(ellipse at 0% 0%, rgba(14,116,144,0.18) 0%, transparent 70%)" }
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 flex flex-col min-h-screen",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navbar, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
						className: "flex-1 px-4 md:px-8 py-6 w-full max-w-screen-xl mx-auto",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: -1,
								className: "inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white/90 transition-colors mb-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "w-4 h-4" }), " Back"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col md:flex-row gap-6 md:gap-8 mb-10",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "shrink-0 w-[140px] md:w-[160px]",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "w-full rounded-2xl overflow-hidden border border-white/12 shadow-2xl",
										style: {
											aspectRatio: "2/3",
											background: "rgba(255,255,255,0.06)"
										},
										children: profileImg ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: profileImg,
											alt: person.name,
											className: "w-full h-full object-cover object-top"
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "w-full h-full flex items-center justify-center",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "w-12 h-12 text-white/20" })
										})
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex-1 min-w-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-start justify-between gap-4 mb-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
												className: "text-2xl md:text-3xl font-bold text-white leading-tight",
												children: person.name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GlassButton, {
												size: "sm",
												className: "shrink-0 gap-1.5",
												active: actorFavorited,
												disabled: actorFavBusy,
												onClick: handleActorFavorite,
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: `w-3.5 h-3.5 ${actorFavorited ? "fill-red-400 text-red-400" : ""}` }), actorFavorited ? "Favorited" : "Favorite"]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs font-semibold tracking-widest uppercase text-white/45 mb-4",
											children: person.known_for_department
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-6 mb-5",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "text-center",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-lg font-bold text-white",
														children: movieCount
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-[10px] uppercase tracking-wide text-white/40",
														children: "Movies"
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-px h-8 bg-white/10" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "text-center",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-lg font-bold text-white",
														children: tvCount
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-[10px] uppercase tracking-wide text-white/40",
														children: "TV Shows"
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-px h-8 bg-white/10" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "text-center",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-lg font-bold text-white",
														children: Math.round(person.popularity)
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-[10px] uppercase tracking-wide text-white/40",
														children: "Popularity"
													})]
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2.5 mb-5 text-sm",
											children: [
												person.birthday && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-start gap-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "w-3.5 h-3.5 text-white/35 mt-0.5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-[10px] uppercase tracking-widest text-white/35 mb-0.5",
														children: "Born"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
														className: "text-white/80 text-sm",
														children: [fmtDate(person.birthday), !person.deathday && ` (${calcAge(person.birthday)} yrs)`]
													})] })]
												}),
												person.place_of_birth && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-start gap-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "w-3.5 h-3.5 text-white/35 mt-0.5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-[10px] uppercase tracking-widest text-white/35 mb-0.5",
														children: "Place of Birth"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-white/80 text-sm",
														children: person.place_of_birth
													})] })]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-start gap-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "w-3.5 h-3.5 text-white/35 mt-0.5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-[10px] uppercase tracking-widest text-white/35 mb-0.5",
														children: "Gender"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-white/80 text-sm",
														children: genderLabel(person.gender)
													})] })]
												}),
												imdbId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-start gap-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "w-3.5 h-3.5 text-white/35 mt-0.5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-[10px] uppercase tracking-widest text-white/35 mb-0.5",
														children: "IMDb"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
														href: `https://www.imdb.com/name/${imdbId}`,
														target: "_blank",
														rel: "noopener noreferrer",
														className: "text-white/80 text-sm hover:text-white transition-colors",
														children: [imdbId, " ↗"]
													})] })]
												})
											]
										}),
										person.also_known_as.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mb-5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[10px] uppercase tracking-widest text-white/35 mb-2",
												children: "Also Known As"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "flex flex-wrap gap-2",
												children: person.also_known_as.slice(0, 8).map((alias) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-xs px-2.5 py-1 rounded-full border border-white/12",
													style: {
														background: "rgba(255,255,255,0.07)",
														color: "rgba(255,255,255,0.7)"
													},
													children: alias
												}, alias))
											})]
										}),
										person.biography && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[10px] uppercase tracking-widest text-white/35 mb-2",
												children: "Biography"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm text-white/65 leading-relaxed",
												children: bioExpanded ? person.biography : shortBio
											}),
											person.biography.length > BIO_LIMIT && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												onClick: () => setBioExpanded((v) => !v),
												className: "mt-1.5 text-xs text-white/40 hover:text-white/80 transition-colors",
												children: bioExpanded ? "Show less" : "Read more"
											})
										] })
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KnownForRow, { credits: dedupedCredits }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between mb-5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
									className: "text-base md:text-lg font-bold text-white",
									children: ["Filmography", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "ml-2 text-sm font-normal text-white/40",
										children: [dedupedCredits.length, " titles"]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex items-center gap-1 rounded-full p-1",
									style: {
										background: "rgba(255,255,255,0.06)",
										border: "1px solid rgba(255,255,255,0.10)"
									},
									children: [
										"all",
										"movie",
										"tv"
									].map((tab) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => setFilterTab(tab),
										className: "text-xs font-semibold px-3 py-1 rounded-full transition-all duration-150",
										style: filterTab === tab ? {
											background: "rgba(255,255,255,0.18)",
											color: "rgba(255,255,255,0.95)",
											boxShadow: "0 1px 6px rgba(0,0,0,0.3)"
										} : { color: "rgba(255,255,255,0.45)" },
										children: tab === "all" ? `All (${dedupedCredits.length})` : tab === "movie" ? `Movies (${movieCount})` : `TV (${tvCount})`
									}, tab))
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid gap-4",
								style: { gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))" },
								children: filteredCredits.map((credit) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { credit }, `${credit.media_type}-${credit.id}`))
							})] })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, {})
				]
			})
		]
	});
}
export { PersonPage as default };
