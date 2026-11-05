import { N as supabase } from "./dist-CiZ_rQl8.js";
// src/lib/supabase/admin.ts
/**
* Admin API layer — all functions call SECURITY DEFINER RPCs.
* The server verifies admin role on every call; never trust client-side checks alone.
* No service-role key is used here — only the anon key with auth session.
*/
async function getAdminStats(days) {
	const { data, error } = await supabase.rpc("admin_get_stats", { p_days: days ?? null });
	if (error) throw error;
	return data;
}
async function getUserGrowth(days = 30) {
	const { data, error } = await supabase.rpc("admin_get_user_growth", { p_days: days });
	if (error) throw error;
	return Array.isArray(data) ? data : [];
}
async function getActivity(days = 30) {
	const { data, error } = await supabase.rpc("admin_get_activity", { p_days: days });
	if (error) throw error;
	return Array.isArray(data) ? data : [];
}
async function getTopTitles(limit = 10, mediaType) {
	const { data, error } = await supabase.rpc("admin_get_top_titles", {
		p_limit: limit,
		p_media_type: mediaType ?? null
	});
	if (error) throw error;
	return Array.isArray(data) ? data : [];
}
async function getMediaDistribution() {
	const { data, error } = await supabase.rpc("admin_get_media_distribution");
	if (error) throw error;
	return Array.isArray(data) ? data : [];
}
async function getStatusDistribution() {
	const { data, error } = await supabase.rpc("admin_get_status_distribution");
	if (error) throw error;
	return Array.isArray(data) ? data : [];
}
async function listUsers(search, limit = 20, offset = 0, sortBy = "created_at", sortDir = "desc") {
	const { data, error } = await supabase.rpc("admin_list_users", {
		p_search: search ?? null,
		p_limit: limit,
		p_offset: offset,
		p_sort_by: sortBy,
		p_sort_dir: sortDir
	});
	if (error) throw error;
	return data;
}
async function getUserDetails(userId) {
	const { data, error } = await supabase.rpc("admin_get_user_details", { p_user_id: userId });
	if (error) throw error;
	return data;
}
async function updateUser(userId, opts) {
	const { error } = await supabase.rpc("admin_update_user", {
		p_user_id: userId,
		p_is_suspended: opts.is_suspended ?? null,
		p_role: opts.role ?? null
	});
	if (error) throw error;
}
async function deleteUser(userId) {
	const { error } = await supabase.rpc("admin_delete_user", { p_user_id: userId });
	if (error) throw error;
}
async function getUserLibrary(userId, limit = 50, offset = 0) {
	const { data, error } = await supabase.from("library_items").select("id,tmdb_id,title,media_type,status,poster_path,vote_average,release_date,added_at").eq("user_id", userId).order("added_at", { ascending: false }).range(offset, offset + limit - 1);
	if (error) throw error;
	return Array.isArray(data) ? data : [];
}
async function getUserFavorites(userId, limit = 50, offset = 0) {
	const { data, error } = await supabase.from("favorite_items").select("id,tmdb_id,title,media_type,poster_path,vote_average,release_date,added_at").eq("user_id", userId).order("added_at", { ascending: false }).range(offset, offset + limit - 1);
	if (error) throw error;
	return Array.isArray(data) ? data : [];
}
async function getWatchData(table = "library_items", search, limit = 25, offset = 0) {
	const { data, error } = await supabase.rpc("admin_get_watch_data", {
		p_table: table,
		p_search: search ?? null,
		p_limit: limit,
		p_offset: offset
	});
	if (error) throw error;
	return data;
}
async function getAuditLogs(limit = 25, offset = 0) {
	const { data, error } = await supabase.rpc("admin_get_audit_logs", {
		p_limit: limit,
		p_offset: offset
	});
	if (error) throw error;
	return data;
}
async function logAdminAction(action, targetType, targetId, details, status = "success") {
	const { error } = await supabase.rpc("admin_log_action", {
		p_action: action,
		p_target_type: targetType ?? null,
		p_target_id: targetId ?? null,
		p_details: details ?? null,
		p_status: status
	});
	if (error) throw error;
}
export { getMediaDistribution as a, getUserDetails as c, getUserLibrary as d, getWatchData as f, updateUser as h, getAuditLogs as i, getUserFavorites as l, logAdminAction as m, getActivity as n, getStatusDistribution as o, listUsers as p, getAdminStats as r, getTopTitles as s, deleteUser as t, getUserGrowth as u };
