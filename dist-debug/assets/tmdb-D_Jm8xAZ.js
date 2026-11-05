import { n as __exportAll } from "./rolldown-runtime-SbdDWaPq.js";
import { t as publicRuntimeConfig } from "./runtime-config-BtSr0Ory.js";
// src/services/tmdb.ts
var tmdb_exports = /* @__PURE__ */ __exportAll({ searchMulti: () => searchMulti });
var BASE_URL = "https://api.themoviedb.org/3";
var IMG_BASE = "https://image.tmdb.org/t/p";
var tmdbImageUrl = (path, size = "w342") => path ? `${IMG_BASE}/${size}${path}` : null;
var tmdbBackdropUrl = (path) => tmdbImageUrl(path, "w1280");
var tmdbProviderLogoUrl = (path) => tmdbImageUrl(path, "w45");
/** Title logo image (PNG with transparency) — use w500 for crisp display */
var tmdbLogoUrl = (path) => tmdbImageUrl(path, "w500");
var getApiKey = () => publicRuntimeConfig.tmdbApiKey ?? void 0;
async function tmdbFetch(endpoint, params = {}) {
	const apiKey = getApiKey();
	if (!apiKey) throw new Error("TMDB API key not configured. Set VITE_TMDB_API_KEY.");
	const url = new URL(`${BASE_URL}${endpoint}`);
	url.searchParams.set("api_key", apiKey);
	for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
	const res = await fetch(url.toString());
	if (!res.ok) throw new Error(`TMDB error ${res.status}: ${res.statusText}`);
	return res.json();
}
var getTrending = (mediaType, page = "1") => tmdbFetch(`/trending/${mediaType}/week`, { page });
var getUpcomingMovies = (page = "1") => tmdbFetch("/movie/upcoming", { page });
var getAnime = (page = "1", params = {}) => tmdbFetch("/discover/tv", {
	with_genres: "16",
	with_original_language: "ja",
	sort_by: "popularity.desc",
	page,
	...params
});
var discoverFiltered = ({ mediaType, genre, year, sortBy, provider, region, page = "1", anime, keywords }) => {
	const endpoint = `/discover/${mediaType}`;
	const params = {
		sort_by: sortBy ?? "popularity.desc",
		page
	};
	if (genre) params["with_genres"] = genre;
	if (year) {
		if (mediaType === "movie") params["primary_release_year"] = year;
		else params["first_air_date_year"] = year;
	}
	if (provider) {
		params["with_watch_providers"] = provider;
		params["watch_region"] = region ?? "US";
	}
	if (region) params["with_origin_country"] = region;
	if (anime) {
		params["with_genres"] = genre ? `${genre},16` : "16";
		params["with_original_language"] = "ja";
	}
	if (keywords) params["with_keywords"] = keywords;
	return tmdbFetch(endpoint, params);
};
var searchKeywords = (query) => tmdbFetch("/search/keyword", { query });
var getTopRated = (mediaType, page = "1") => tmdbFetch(`/${mediaType}/top_rated`, { page });
var searchMulti = (query, page = "1") => tmdbFetch("/search/multi", {
	query,
	page
});
var searchPerson = (query, page = "1") => tmdbFetch("/search/person", {
	query,
	page
});
var getMovieDetails = (id) => tmdbFetch(`/movie/${id}`, { append_to_response: "videos,credits,similar,watch/providers,external_ids" });
var getTVDetails = (id) => tmdbFetch(`/tv/${id}`, { append_to_response: "videos,credits,similar,watch/providers,external_ids" });
var getTVSeason = (tvId, seasonNumber) => tmdbFetch(`/tv/${tvId}/season/${seasonNumber}`);
var getMovieGenres = () => tmdbFetch("/genre/movie/list");
var getTVGenres = () => tmdbFetch("/genre/tv/list");
var getSimilarMovies = (movieId, page = "1") => tmdbFetch(`/movie/${movieId}/similar`, { page });
var getSimilarTV = (tvId, page = "1") => tmdbFetch(`/tv/${tvId}/similar`, { page });
var getPopularTV = (page = "1") => tmdbFetch("/tv/popular", { page });
var getPersonDetails = (id) => tmdbFetch(`/person/${id}`, { append_to_response: "combined_credits,external_ids" });
var getMovieImages = (id) => tmdbFetch(`/movie/${id}/images`, { include_image_language: "en,null" });
var getTVImages = (id) => tmdbFetch(`/tv/${id}/images`, { include_image_language: "en,null" });
export { tmdbLogoUrl as C, tmdbImageUrl as S, tmdb_exports as T, searchKeywords as _, getMovieImages as a, tmdbBackdropUrl as b, getSimilarMovies as c, getTVGenres as d, getTVImages as f, getUpcomingMovies as g, getTrending as h, getMovieGenres as i, getSimilarTV as l, getTopRated as m, getAnime as n, getPersonDetails as o, getTVSeason as p, getMovieDetails as r, getPopularTV as s, discoverFiltered as t, getTVDetails as u, searchMulti as v, tmdbProviderLogoUrl as w, tmdbFetch as x, searchPerson as y };
