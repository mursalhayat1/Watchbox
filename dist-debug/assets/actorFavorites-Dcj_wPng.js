import { N as supabase } from "./dist-CiZ_rQl8.js";
// src/lib/supabase/actorFavorites.ts
async function currentUserId() {
	const { data: { session } } = await supabase.auth.getSession();
	return session?.user?.id ?? null;
}
async function getFavoriteActors() {
	const uid = await currentUserId();
	if (!uid) return [];
	const { data, error } = await supabase.from("actor_favorites").select("*").eq("user_id", uid).order("added_at", { ascending: false }).limit(100);
	if (error) throw error;
	return Array.isArray(data) ? data : [];
}
async function isFavoriteActor(personId) {
	const uid = await currentUserId();
	if (!uid) return false;
	const { data } = await supabase.from("actor_favorites").select("id").eq("user_id", uid).eq("person_id", personId).maybeSingle();
	return data !== null;
}
/** Toggle favorite — returns true if now favorited */
async function toggleFavoriteActor(payload) {
	const uid = await currentUserId();
	if (!uid) throw new Error("Not signed in");
	if (await isFavoriteActor(payload.person_id)) {
		const { error } = await supabase.from("actor_favorites").delete().eq("user_id", uid).eq("person_id", payload.person_id);
		if (error) throw error;
		return false;
	} else {
		const { error } = await supabase.from("actor_favorites").upsert({
			...payload,
			user_id: uid
		}, { onConflict: "user_id,person_id" });
		if (error) throw error;
		return true;
	}
}
export { isFavoriteActor as n, toggleFavoriteActor as r, getFavoriteActors as t };
