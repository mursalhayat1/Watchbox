import { N as supabase } from "./dist-CiZ_rQl8.js";
// src/lib/supabase/sections.ts
/**
* Sections API — client-side data access for the Dynamic Sections system.
* Admin mutations call SECURITY DEFINER RPCs; public reads hit the table
* directly (RLS restricts to published/active sections for non-admins).
*/
var DEFAULT_DISPLAY_OPTIONS = {
	show_title: true,
	show_rating: true,
	show_year: true,
	show_genre: false,
	show_language: false,
	show_country: false,
	show_content_type: true,
	show_badges: true
};
function coerce(row) {
	const s = row;
	return {
		...s,
		display_options: s.display_options ?? DEFAULT_DISPLAY_OPTIONS,
		filters: s.filters ?? {},
		pinned_items: s.pinned_items ?? [],
		excluded_items: s.excluded_items ?? []
	};
}
/** Fetch active sections for the homepage (respects RLS — no auth needed). */
async function getActiveSections() {
	const { data, error } = await supabase.from("sections").select("*").order("position", { ascending: true });
	if (error) throw error;
	return (data ?? []).map(coerce);
}
/** Fetch a single section by ID (public). */
async function getSection(id) {
	const { data, error } = await supabase.from("sections").select("*").eq("id", id).maybeSingle();
	if (error) throw error;
	return data ? coerce(data) : null;
}
/** Admin: list ALL sections regardless of status (calls SECURITY DEFINER RPC). */
async function adminListSections() {
	const { data, error } = await supabase.rpc("admin_list_sections");
	if (error) throw error;
	return (data ?? []).map(coerce);
}
/** Create a new section (admin). */
async function adminCreateSection(payload) {
	const { data, error } = await supabase.from("sections").insert(payload).select().single();
	if (error) throw error;
	return coerce(data);
}
/** Update a section (admin). */
async function adminUpdateSection(id, payload) {
	const { data, error } = await supabase.from("sections").update(payload).eq("id", id).select().single();
	if (error) throw error;
	return coerce(data);
}
/** Delete a section (admin). */
async function adminDeleteSection(id) {
	const { error } = await supabase.from("sections").delete().eq("id", id);
	if (error) throw error;
}
/** Duplicate a section (admin). */
async function adminDuplicateSection(id) {
	const { data, error } = await supabase.rpc("admin_duplicate_section", { p_id: id });
	if (error) throw error;
	return coerce(data);
}
/** Bulk reorder sections (admin). */
async function adminReorderSections(ids, positions) {
	const { error } = await supabase.rpc("admin_reorder_sections", {
		p_ids: ids,
		p_positions: positions
	});
	if (error) throw error;
}
/** Derive the *effective* status accounting for schedule expiry/activation. */
function effectiveStatus(s) {
	const now = /* @__PURE__ */ new Date();
	if (s.status === "expired") return "expired";
	if (s.status === "disabled") return "disabled";
	if (s.status === "draft") return "draft";
	if (s.status === "scheduled") {
		if (s.start_at && new Date(s.start_at) <= now) {
			if (!s.end_at || new Date(s.end_at) > now) return "published";
		}
		return "scheduled";
	}
	if (s.status === "published") {
		if (s.end_at && new Date(s.end_at) <= now) return "expired";
		return "published";
	}
	return s.status;
}
var SECTION_PRESETS = [
	{
		key: "trending_now",
		label: "Trending Now",
		config: {
			name: "Trending Now",
			content_type: "all",
			sort_by: "trending_week",
			filters: {},
			section_type: "dynamic",
			layout: "carousel",
			item_limit: 20
		}
	},
	{
		key: "top_rated",
		label: "Top Rated",
		config: {
			name: "Top Rated",
			content_type: "all",
			sort_by: "top_rated",
			filters: { vote_count: {
				min: 500,
				max: null
			} },
			section_type: "dynamic",
			layout: "carousel",
			item_limit: 20,
			min_vote_count: 500
		}
	},
	{
		key: "new_releases",
		label: "New Releases",
		config: {
			name: "New Releases",
			content_type: "all",
			sort_by: "newest_release",
			filters: { release_date: { preset: "last_90_days" } },
			section_type: "dynamic",
			layout: "carousel",
			item_limit: 20
		}
	},
	{
		key: "popular_movies",
		label: "Popular Movies",
		config: {
			name: "Popular Movies",
			content_type: "movie",
			sort_by: "popularity",
			filters: {},
			section_type: "dynamic",
			layout: "carousel",
			item_limit: 20
		}
	},
	{
		key: "popular_tv",
		label: "Popular TV Shows",
		config: {
			name: "Popular TV Shows",
			content_type: "tv",
			sort_by: "popularity",
			filters: {},
			section_type: "dynamic",
			layout: "carousel",
			item_limit: 20
		}
	},
	{
		key: "korean_movies",
		label: "Korean Movies",
		config: {
			name: "Korean Movies",
			content_type: "movie",
			sort_by: "popularity",
			filters: { languages: {
				include: ["ko"],
				exclude: []
			} },
			section_type: "dynamic",
			layout: "carousel",
			item_limit: 20
		}
	},
	{
		key: "japanese_movies",
		label: "Japanese Movies",
		config: {
			name: "Japanese Movies",
			content_type: "movie",
			sort_by: "popularity",
			filters: { languages: {
				include: ["ja"],
				exclude: []
			} },
			section_type: "dynamic",
			layout: "carousel",
			item_limit: 20
		}
	},
	{
		key: "hindi_movies",
		label: "Hindi Movies",
		config: {
			name: "Hindi Movies",
			content_type: "movie",
			sort_by: "popularity",
			filters: { languages: {
				include: ["hi"],
				exclude: []
			} },
			section_type: "dynamic",
			layout: "carousel",
			item_limit: 20
		}
	},
	{
		key: "action_movies",
		label: "Action Movies",
		config: {
			name: "Action Movies",
			content_type: "movie",
			sort_by: "popularity",
			filters: { genres: {
				include: [28],
				exclude: []
			} },
			section_type: "dynamic",
			layout: "carousel",
			item_limit: 20
		}
	},
	{
		key: "scifi_movies",
		label: "Sci-Fi Movies",
		config: {
			name: "Sci-Fi Movies",
			content_type: "movie",
			sort_by: "popularity",
			filters: { genres: {
				include: [878],
				exclude: []
			} },
			section_type: "dynamic",
			layout: "carousel",
			item_limit: 20
		}
	},
	{
		key: "highly_rated",
		label: "Highly Rated",
		config: {
			name: "Highly Rated",
			content_type: "all",
			sort_by: "top_rated",
			filters: {
				rating: {
					min: 8,
					max: null
				},
				vote_count: {
					min: 1e3,
					max: null
				}
			},
			section_type: "dynamic",
			layout: "carousel",
			item_limit: 20,
			min_vote_count: 1e3
		}
	},
	{
		key: "most_watched",
		label: "Most Watched",
		config: {
			name: "Most Watched",
			content_type: "all",
			sort_by: "most_watched",
			filters: {},
			section_type: "dynamic",
			layout: "carousel",
			item_limit: 20
		}
	}
];
export { adminDuplicateSection as a, adminUpdateSection as c, getSection as d, adminDeleteSection as i, effectiveStatus as l, SECTION_PRESETS as n, adminListSections as o, adminCreateSection as r, adminReorderSections as s, DEFAULT_DISPLAY_OPTIONS as t, getActiveSections as u };
