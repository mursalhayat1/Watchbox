import { x as tmdbFetch } from "./tmdb-D_Jm8xAZ.js";
// src/services/sectionResolver.ts
var _cache = /* @__PURE__ */ new Map();
var CACHE_TTL_MS = 3e5;
function cacheKey(section) {
	return `${section.id}__${section.updated_at}`;
}
function releaseDateRange(filters) {
	const rd = filters.release_date;
	if (!rd) return null;
	const now = /* @__PURE__ */ new Date();
	const fmt = (d) => d.toISOString().slice(0, 10);
	const ago = (days) => {
		const d = new Date(now);
		d.setDate(d.getDate() - days);
		return d;
	};
	const fy = (d) => {
		const r = new Date(d);
		r.setMonth(0, 1);
		return r;
	};
	if (rd.preset === "custom") return {
		from: rd.from ?? void 0,
		to: rd.to ?? void 0
	};
	if (rd.preset === "last_x_days" && rd.last_x) return {
		from: fmt(ago(rd.last_x)),
		to: fmt(now)
	};
	const map = {
		today: () => ({
			from: fmt(now),
			to: fmt(now)
		}),
		this_week: () => ({
			from: fmt(ago(7)),
			to: fmt(now)
		}),
		this_month: () => ({
			from: fmt(new Date(now.getFullYear(), now.getMonth(), 1)),
			to: fmt(now)
		}),
		this_year: () => ({
			from: fmt(fy(now)),
			to: fmt(now)
		}),
		last_7_days: () => ({
			from: fmt(ago(7)),
			to: fmt(now)
		}),
		last_30_days: () => ({
			from: fmt(ago(30)),
			to: fmt(now)
		}),
		last_90_days: () => ({
			from: fmt(ago(90)),
			to: fmt(now)
		}),
		last_6_months: () => ({
			from: fmt(ago(180)),
			to: fmt(now)
		}),
		last_year: () => ({
			from: fmt(ago(365)),
			to: fmt(now)
		}),
		previous_year: () => {
			const py = now.getFullYear() - 1;
			return {
				from: `${py}-01-01`,
				to: `${py}-12-31`
			};
		}
	};
	if (rd.preset && map[rd.preset]) return map[rd.preset]();
	return null;
}
function buildDiscoverParams(section) {
	const f = section.filters ?? {};
	const params = {};
	params.sort_by = {
		popularity: "popularity.desc",
		top_rated: "vote_average.desc",
		trending_week: "popularity.desc",
		trending_today: "popularity.desc",
		trending_month: "popularity.desc",
		newest_release: section.content_type === "tv" ? "first_air_date.desc" : "primary_release_date.desc",
		oldest_release: section.content_type === "tv" ? "first_air_date.asc" : "primary_release_date.asc",
		upcoming: section.content_type === "tv" ? "first_air_date.asc" : "primary_release_date.asc",
		highest_vote_count: "vote_count.desc",
		lowest_vote_count: "vote_count.asc",
		az: "original_title.asc",
		za: "original_title.desc",
		recently_added: "popularity.desc",
		recently_updated: "popularity.desc",
		most_watched: "popularity.desc",
		relevance: "popularity.desc",
		random: "popularity.desc"
	}[section.sort_by] ?? "popularity.desc";
	if (section.sort_direction === "asc" && params.sort_by.endsWith(".desc")) params.sort_by = params.sort_by.replace(".desc", ".asc");
	if (section.sort_by === "upcoming") {
		const tomorrow = /* @__PURE__ */ new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		const from = tomorrow.toISOString().slice(0, 10);
		if (section.content_type === "tv") params["first_air_date.gte"] = from;
		else params["primary_release_date.gte"] = from;
	}
	const minVotes = section.min_vote_count ?? (section.sort_by === "top_rated" ? 200 : void 0);
	if (minVotes) params["vote_count.gte"] = String(minVotes);
	if (f.genres?.include?.length) {
		const sep = f.logic === "OR" ? "|" : ",";
		params.with_genres = f.genres.include.join(sep);
	}
	if (f.genres?.exclude?.length) params.without_genres = f.genres.exclude.join(",");
	if (f.languages?.include?.length === 1) params.with_original_language = f.languages.include[0];
	if (f.countries?.include?.length) params.with_origin_country = f.countries.include.join("|");
	if (f.keywords?.include?.length) {
		const sep = f.keywords.match === "ALL" ? "," : "|";
		params.with_keywords = f.keywords.include.join(sep);
	}
	if (f.keywords?.exclude?.length) params.without_keywords = f.keywords.exclude.join(",");
	if (f.rating?.min != null) params["vote_average.gte"] = String(f.rating.min);
	if (f.rating?.max != null) params["vote_average.lte"] = String(f.rating.max);
	if (f.vote_count?.min != null) params["vote_count.gte"] = String(f.vote_count.min);
	if (f.vote_count?.max != null) params["vote_count.lte"] = String(f.vote_count.max);
	if (f.popularity?.min != null) params["popularity.gte"] = String(f.popularity.min);
	if (f.popularity?.max != null) params["popularity.lte"] = String(f.popularity.max);
	const dateRange = releaseDateRange(f);
	if (dateRange) {
		if (section.content_type === "tv") {
			if (dateRange.from) params["first_air_date.gte"] = dateRange.from;
			if (dateRange.to) params["first_air_date.lte"] = dateRange.to;
		} else {
			if (dateRange.from) params["primary_release_date.gte"] = dateRange.from;
			if (dateRange.to) params["primary_release_date.lte"] = dateRange.to;
		}
	}
	if (f.runtime?.min != null) params["with_runtime.gte"] = String(f.runtime.min);
	if (f.runtime?.max != null) params["with_runtime.lte"] = String(f.runtime.max);
	if (f.actors?.include?.length) params.with_cast = f.actors.include.join(",");
	if (f.directors?.include?.length) params.with_crew = f.directors.include.join(",");
	return params;
}
async function fetchDynamic(section) {
	const limit = Math.min(section.item_limit, 40);
	const mediaType = section.content_type === "all" ? "movie" : section.content_type;
	const results = [];
	if (section.sort_by === "trending_today" || section.sort_by === "trending_week" || section.sort_by === "trending_month") {
		const window = section.sort_by === "trending_today" ? "day" : "week";
		const tmdbType = section.content_type === "all" ? "all" : section.content_type;
		try {
			const res = await tmdbFetch(`/trending/${tmdbType}/${window}`, { page: "1" });
			results.push(...res.results ?? []);
		} catch {}
		if (section.content_type === "all" && results.length < limit) try {
			const res2 = await tmdbFetch(`/trending/all/${window}`, { page: "2" });
			results.push(...res2.results ?? []);
		} catch {}
		return results.slice(0, limit);
	}
	if (section.content_type === "all") {
		const params = buildDiscoverParams({
			...section,
			content_type: "movie"
		});
		const [movRes, tvRes] = await Promise.allSettled([tmdbFetch("/discover/movie", params), tmdbFetch("/discover/tv", buildDiscoverParams({
			...section,
			content_type: "tv"
		}))]);
		const movs = movRes.status === "fulfilled" ? movRes.value.results ?? [] : [];
		const tvs = tvRes.status === "fulfilled" ? tvRes.value.results ?? [] : [];
		const merged = [];
		const maxLen = Math.max(movs.length, tvs.length);
		for (let i = 0; i < maxLen; i++) {
			if (i < movs.length) merged.push({
				...movs[i],
				media_type: "movie"
			});
			if (i < tvs.length) merged.push({
				...tvs[i],
				media_type: "tv"
			});
		}
		return merged.slice(0, limit);
	}
	const endpoint = mediaType === "movie" ? "/discover/movie" : "/discover/tv";
	const params = buildDiscoverParams(section);
	try {
		const res = await tmdbFetch(endpoint, params);
		results.push(...(res.results ?? []).map((m) => ({
			...m,
			media_type: mediaType
		})));
	} catch {}
	return results.slice(0, limit);
}
function pinnedToMovie(p) {
	return {
		id: p.tmdb_id,
		title: p.media_type === "movie" ? p.title : void 0,
		name: p.media_type === "tv" ? p.title : void 0,
		poster_path: p.poster_path,
		backdrop_path: null,
		vote_average: 0,
		vote_count: 0,
		genre_ids: [],
		overview: "",
		media_type: p.media_type
	};
}
async function resolveSection(section) {
	const key = cacheKey(section);
	const cached = _cache.get(key);
	if (cached && Date.now() - cached.ts < CACHE_TTL_MS) return cached.data;
	const excludedIds = new Set((section.excluded_items ?? []).map((e) => `${e.media_type}:${e.tmdb_id}`));
	const strip = (movies) => movies.filter((m) => {
		const mt = m.media_type ?? "movie";
		return !excludedIds.has(`${mt}:${m.id}`);
	});
	let results = [];
	try {
		if (section.section_type === "manual") results = strip((section.pinned_items ?? []).map(pinnedToMovie));
		else if (section.section_type === "hybrid") {
			const pinnedMovies = strip((section.pinned_items ?? []).map(pinnedToMovie));
			const pinnedIds = new Set(pinnedMovies.map((m) => `${m.media_type ?? "movie"}:${m.id}`));
			const dynamic = strip(await fetchDynamic(section)).filter((m) => !pinnedIds.has(`${m.media_type ?? "movie"}:${m.id}`));
			results = [...pinnedMovies, ...dynamic].slice(0, section.item_limit);
		} else results = strip(await fetchDynamic(section)).slice(0, section.item_limit);
	} catch {
		results = [];
	}
	_cache.set(key, {
		data: results,
		ts: Date.now()
	});
	return results;
}
/** Pre-resolve for preview (bypasses cache). */
async function previewSection(section) {
	const key = cacheKey(section);
	_cache.delete(key);
	return resolveSection(section);
}
export { resolveSection as n, previewSection as t };
