import { N as supabase } from "./dist-CiZ_rQl8.js";
// src/lib/supabase/favorites.ts
async function currentUserId() {
	const { data: { session } } = await supabase.auth.getSession();
	return session?.user?.id ?? null;
}
async function getFavorites() {
	const uid = await currentUserId();
	if (!uid) return [];
	const { data, error } = await supabase.from("favorite_items").select("*").eq("user_id", uid).order("added_at", { ascending: false }).limit(500);
	if (error) throw error;
	return Array.isArray(data) ? data : [];
}
async function isFavorited(tmdbId, mediaType) {
	const uid = await currentUserId();
	if (!uid) return false;
	const { data } = await supabase.from("favorite_items").select("id").eq("user_id", uid).eq("tmdb_id", tmdbId).eq("media_type", mediaType).maybeSingle();
	return data !== null;
}
async function toggleFavorite(payload) {
	const uid = await currentUserId();
	if (!uid) throw new Error("Not signed in");
	if (await isFavorited(payload.tmdb_id, payload.media_type)) {
		const { error } = await supabase.from("favorite_items").delete().eq("user_id", uid).eq("tmdb_id", payload.tmdb_id).eq("media_type", payload.media_type);
		if (error) throw error;
		return false;
	} else {
		const { error } = await supabase.from("favorite_items").upsert({
			...payload,
			user_id: uid
		}, { onConflict: "user_id,tmdb_id,media_type" });
		if (error) throw error;
		return true;
	}
}
export { isFavorited as n, toggleFavorite as r, getFavorites as t };
