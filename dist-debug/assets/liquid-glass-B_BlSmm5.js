import { r as __toESM } from "./rolldown-runtime-SbdDWaPq.js";
import { J as require_react, L as require_jsx_runtime, S as cn, g as Slot } from "./dist-CiZ_rQl8.js";
import { t as cva } from "./dist-Dx_V9-mm.js";
// src/components/ui/liquid-glass.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function GlassFilterDef() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		"aria-hidden": "true",
		style: {
			position: "fixed",
			width: 0,
			height: 0,
			pointerEvents: "none",
			zIndex: -1
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("filter", {
			id: "lg-filter",
			x: "-20%",
			y: "-20%",
			width: "140%",
			height: "140%",
			colorInterpolationFilters: "sRGB",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("feTurbulence", {
					type: "fractalNoise",
					baseFrequency: "0.65",
					numOctaves: "3",
					seed: "2",
					result: "noise"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("feDisplacementMap", {
					in: "SourceGraphic",
					in2: "noise",
					scale: "3",
					xChannelSelector: "R",
					yChannelSelector: "G",
					result: "displaced"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("feComposite", {
					in: "displaced",
					in2: "SourceGraphic",
					operator: "atop"
				})
			]
		}) })
	});
}
var glassBase = {
	backdropFilter: "blur(20px) saturate(180%)",
	WebkitBackdropFilter: "blur(20px) saturate(180%)",
	background: "linear-gradient(135deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.06) 100%)",
	border: "1px solid rgba(255,255,255,0.18)",
	boxShadow: "0 4px 24px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.22), inset 1px 0 0 rgba(255,255,255,0.10)",
	transition: "filter 200ms ease, transform 150ms ease, background 200ms ease, box-shadow 200ms ease"
};
var glassActiveBase = {
	...glassBase,
	background: "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.82) 100%)",
	boxShadow: "0 2px 12px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.80)"
};
var glassButtonVariants = cva([
	"inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer",
	"text-sm font-semibold rounded-full",
	"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
	"disabled:pointer-events-none disabled:opacity-50",
	"[&_svg]:pointer-events-none [&_svg]:shrink-0"
].join(" "), {
	variants: { size: {
		sm: "h-8  px-4 text-xs",
		md: "h-9  px-5",
		lg: "h-10 px-7",
		xl: "h-11 px-8 text-base"
	} },
	defaultVariants: { size: "md" }
});
var GlassButton = import_react.forwardRef(({ className, size, asChild = false, active = false, liquidFilter = true, style, ...props }, ref) => {
	const [hovered, setHovered] = import_react.useState(false);
	const Comp = asChild ? Slot : "button";
	const dynamicStyle = {
		...active ? glassActiveBase : glassBase,
		color: active ? "rgba(0,0,0,0.88)" : "rgba(255,255,255,0.92)",
		filter: hovered && liquidFilter && !active ? "url(#lg-filter) brightness(1.08)" : "none",
		transform: hovered && !active ? "scale(1.03)" : "scale(1)",
		...style
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Comp, {
		ref,
		className: cn(glassButtonVariants({ size }), className),
		style: dynamicStyle,
		onMouseEnter: () => setHovered(true),
		onMouseLeave: () => setHovered(false),
		...props
	});
});
GlassButton.displayName = "GlassButton";
var GlassIconButton = import_react.forwardRef(({ className, size = 36, asChild = false, active = false, liquidFilter = true, style, children, ...props }, ref) => {
	const [hovered, setHovered] = import_react.useState(false);
	const Comp = asChild ? Slot : "button";
	const dynamicStyle = {
		width: size,
		height: size,
		borderRadius: "50%",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		cursor: "pointer",
		flexShrink: 0,
		...active ? glassActiveBase : glassBase,
		color: active ? "rgba(0,0,0,0.88)" : "rgba(255,255,255,0.88)",
		filter: hovered && liquidFilter && !active ? "url(#lg-filter) brightness(1.10)" : "none",
		transform: hovered ? "scale(1.08)" : "scale(1)",
		...style
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Comp, {
		ref,
		className: cn("focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60", "disabled:pointer-events-none disabled:opacity-50", "[&_svg]:pointer-events-none [&_svg]:shrink-0", className),
		style: dynamicStyle,
		onMouseEnter: () => setHovered(true),
		onMouseLeave: () => setHovered(false),
		...props,
		children
	});
});
GlassIconButton.displayName = "GlassIconButton";
export { GlassFilterDef as n, GlassIconButton as r, GlassButton as t };
