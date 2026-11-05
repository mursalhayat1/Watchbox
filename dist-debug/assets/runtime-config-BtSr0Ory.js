// src/lib/runtime-config.ts
function firstValue(...values) {
	for (const value of values) {
		const trimmed = value?.trim();
		if (trimmed) return trimmed;
	}
	return null;
}
var injected = typeof window === "undefined" ? void 0 : window.__WATCHBOX_CONFIG__;
var browserOrigin = typeof window === "undefined" ? null : window.location.origin;
var publicRuntimeConfig = {
	supabaseUrl: firstValue(injected?.supabaseUrl, "https://hveckbndlnkokfgzrztn.supabase.co"),
	supabaseAnonKey: firstValue(injected?.supabaseAnonKey, "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2ZWNrYm5kbG5rb2tmZ3pyenRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5OTg4ODcsImV4cCI6MjEwNDU3NDg4N30.05io_K051qQyrkU8VM1I2NaPkEzqjwwL3IsjszTP7I8"),
	tmdbApiKey: firstValue(injected?.tmdbApiKey, "c33e96ad39a868914e728a924aceb587"),
	siteUrl: firstValue(injected?.siteUrl, void 0, browserOrigin)?.replace(/\/$/, "") ?? null,
	appId: firstValue(injected?.appId, "app-eb909nta4u81"),
	mcpPublicUrl: firstValue(injected?.mcpPublicUrl, "https://watchbox2.vercel.app/mcp")
};
export { publicRuntimeConfig as t };
