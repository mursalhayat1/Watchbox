import { r as __toESM } from "./rolldown-runtime-SbdDWaPq.js";
import { A as useAuth, J as require_react, K as useSearchParams, L as require_jsx_runtime, M as safeAppPath, N as supabase, W as useNavigate, j as loginUrlFor } from "./dist-CiZ_rQl8.js";
import { s as noindexMetadata, t as PageMeta } from "./index-BqTDaTws.js";
// src/pages/AuthCallbackPage.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function AuthCallbackPage() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const returnTo = safeAppPath(searchParams.get("next"));
	const { profile, loading, refreshProfile } = useAuth();
	const [done, setDone] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const check = async () => {
			const { data } = await supabase.auth.getSession();
			if (!data.session) {
				navigate(loginUrlFor(returnTo), { replace: true });
				return;
			}
			await refreshProfile();
			setDone(true);
		};
		check();
	}, []);
	(0, import_react.useEffect)(() => {
		if (!done || loading) return;
		if (returnTo) {
			navigate(returnTo, { replace: true });
			return;
		}
		if (!profile?.onboarded || !profile?.username) navigate("/onboarding", { replace: true });
		else navigate("/", { replace: true });
	}, [
		done,
		loading,
		profile,
		navigate,
		returnTo
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen flex items-center justify-center",
		style: { background: "hsl(189,80%,4%)" },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageMeta, { seo: noindexMetadata("Signing In", "/auth/callback") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-center gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-10 h-10 rounded-full border-2 border-white/20 border-t-white/70 animate-spin" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-white/40 text-sm",
				children: "Signing you in…"
			})]
		})]
	});
}
export { AuthCallbackPage as default };
