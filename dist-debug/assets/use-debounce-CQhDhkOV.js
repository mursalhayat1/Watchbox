import { r as __toESM } from "./rolldown-runtime-SbdDWaPq.js";
import { J as require_react } from "./dist-CiZ_rQl8.js";
// src/hooks/use-debounce.ts
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
function useDebounce(value, delay) {
	const [debouncedValue, setDebouncedValue] = import_react.useState(value);
	import_react.useEffect(() => {
		const timer = setTimeout(() => setDebouncedValue(value), delay ?? 500);
		return () => {
			clearTimeout(timer);
		};
	}, [value, delay]);
	return debouncedValue;
}
export { useDebounce as t };
