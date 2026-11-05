import { N as supabase } from "./dist-CiZ_rQl8.js";
// src/lib/supabase/library.ts
var LIBRARY_STATUSES = [
	"Watching",
	"Completed",
	"Plan to Watch",
	"On Hold",
	"Dropped"
];
/** Save or clear a note + user rating on an existing library item. */
async function updateLibraryNoteRating(id, note, userRating) {
	const uid = await currentUserId();
	if (!uid) throw new Error("Not signed in");
	const { error } = await supabase.from("library_items").update({
		note,
		user_rating: userRating
	}).eq("id", id).eq("user_id", uid);
	if (error) throw error;
}
/** Returns null (not throws) when the user is not signed in. */
async function currentUserId() {
	const { data: { session } } = await supabase.auth.getSession();
	return session?.user?.id ?? null;
}
async function getLibrary() {
	const uid = await currentUserId();
	if (!uid) return [];
	const { data, error } = await supabase.from("library_items").select("*").eq("user_id", uid).order("added_at", { ascending: false }).limit(500);
	if (error) throw error;
	return Array.isArray(data) ? data : [];
}
async function getLibraryItem(tmdbId, mediaType) {
	const uid = await currentUserId();
	if (!uid) return null;
	const { data } = await supabase.from("library_items").select("*").eq("user_id", uid).eq("tmdb_id", tmdbId).eq("media_type", mediaType).maybeSingle();
	return data ?? null;
}
async function addToLibrary(payload) {
	const uid = await currentUserId();
	if (!uid) throw new Error("Not signed in");
	const { error } = await supabase.from("library_items").upsert({
		...payload,
		user_id: uid
	}, { onConflict: "user_id,tmdb_id,media_type" });
	if (error) throw error;
}
async function updateLibraryStatus(id, status) {
	const uid = await currentUserId();
	if (!uid) throw new Error("Not signed in");
	const { error } = await supabase.from("library_items").update({ status }).eq("id", id).eq("user_id", uid);
	if (error) throw error;
}
async function removeFromLibrary(id) {
	const uid = await currentUserId();
	if (!uid) throw new Error("Not signed in");
	const { error } = await supabase.from("library_items").delete().eq("id", id).eq("user_id", uid);
	if (error) throw error;
}
export { removeFromLibrary as a, getLibraryItem as i, addToLibrary as n, updateLibraryNoteRating as o, getLibrary as r, updateLibraryStatus as s, LIBRARY_STATUSES as t };
