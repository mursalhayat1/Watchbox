"use client";
/**
 * liquid-glass.tsx
 *
 * Liquid-glass design primitives for the Movie Discovery Platform.
 *
 * Three exports:
 *   GlassButton      — pill/rounded button with text label (nav tabs, filter pills, CTA)
 *   GlassIconButton  — square icon-only circle button (search, settings, +, info)
 *   GlassNavPill     — wrapper for the centered navbar pill container
 *
 * Visual recipe (Apple liquid-glass aesthetic):
 *   • backdrop-filter: blur + saturate so underlying artwork bleeds through
 *   • Semi-transparent white/black base tint (dark theme → white/8–12%)
 *   • Single-pixel white top + left highlight border (inset)
 *   • Thin rgba(255,255,255,0.08) outer border
 *   • Subtle box-shadow for depth
 *   • SVG feTurbulence displacement map for the "liquid wobble" on hover
 *
 * The SVG filter is rendered once via <GlassFilterDef /> — insert it anywhere
 * in the DOM (hidden). All glass elements reference it by id="lg-filter".
 */

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ─── SVG displacement filter — rendered once, reused by all glass elements ───
export function GlassFilterDef() {
  return (
    <svg
      aria-hidden="true"
      style={{ position: "fixed", width: 0, height: 0, pointerEvents: "none", zIndex: -1 }}
    >
      <defs>
        <filter id="lg-filter" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
          {/* Subtle displacement — gives the liquid wobble feel */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            seed="2"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="3"
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />
          {/* Merge displaced + original so interior text/icons stay sharp */}
          <feComposite in="displaced" in2="SourceGraphic" operator="atop" />
        </filter>
      </defs>
    </svg>
  );
}

// ─── Shared inline styles for the glass surface ───────────────────────────────
const glassBase: React.CSSProperties = {
  backdropFilter: "blur(20px) saturate(180%)",
  WebkitBackdropFilter: "blur(20px) saturate(180%)",
  background: "linear-gradient(135deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.06) 100%)",
  border: "1px solid rgba(255,255,255,0.18)",
  boxShadow: "0 4px 24px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.22), inset 1px 0 0 rgba(255,255,255,0.10)",
  transition: "filter 200ms ease, transform 150ms ease, background 200ms ease, box-shadow 200ms ease",
};

const glassActiveBase: React.CSSProperties = {
  ...glassBase,
  background: "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.82) 100%)",
  boxShadow: "0 2px 12px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.80)",
};

// ─── GlassButton ─────────────────────────────────────────────────────────────
const glassButtonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer",
    "text-sm font-semibold rounded-full",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      size: {
        sm:  "h-8  px-4 text-xs",
        md:  "h-9  px-5",
        lg:  "h-10 px-7",
        xl:  "h-11 px-8 text-base",
      },
    },
    defaultVariants: { size: "md" },
  }
);

export interface GlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof glassButtonVariants> {
  asChild?: boolean;
  /** When true, renders the active (white-fill) glass style */
  active?: boolean;
  /** Override the liquid-wobble filter (set false to disable) */
  liquidFilter?: boolean;
}

export const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, size, asChild = false, active = false, liquidFilter = true, style, ...props }, ref) => {
    const [hovered, setHovered] = React.useState(false);
    const Comp = asChild ? Slot : "button";

    const dynamicStyle: React.CSSProperties = {
      ...(active ? glassActiveBase : glassBase),
      color: active ? "rgba(0,0,0,0.88)" : "rgba(255,255,255,0.92)",
      filter: hovered && liquidFilter && !active ? "url(#lg-filter) brightness(1.08)" : "none",
      transform: hovered && !active ? "scale(1.03)" : "scale(1)",
      ...style,
    };

    return (
      <Comp
        ref={ref}
        className={cn(glassButtonVariants({ size }), className)}
        style={dynamicStyle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        {...props}
      />
    );
  }
);
GlassButton.displayName = "GlassButton";

// ─── GlassIconButton — circle icon-only ──────────────────────────────────────
export interface GlassIconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  /** Circle diameter in px — default 36 */
  size?: number;
  active?: boolean;
  liquidFilter?: boolean;
}

export const GlassIconButton = React.forwardRef<HTMLButtonElement, GlassIconButtonProps>(
  ({ className, size = 36, asChild = false, active = false, liquidFilter = true, style, children, ...props }, ref) => {
    const [hovered, setHovered] = React.useState(false);
    const Comp = asChild ? Slot : "button";

    const dynamicStyle: React.CSSProperties = {
      width:  size,
      height: size,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      flexShrink: 0,
      ...(active ? glassActiveBase : glassBase),
      color: active ? "rgba(0,0,0,0.88)" : "rgba(255,255,255,0.88)",
      filter: hovered && liquidFilter && !active ? "url(#lg-filter) brightness(1.10)" : "none",
      transform: hovered ? "scale(1.08)" : "scale(1)",
      ...style,
    };

    return (
      <Comp
        ref={ref}
        className={cn(
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
          "disabled:pointer-events-none disabled:opacity-50",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0",
          className
        )}
        style={dynamicStyle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);
GlassIconButton.displayName = "GlassIconButton";

// ─── GlassNavPill — wraps the centered nav container ─────────────────────────
export interface GlassNavPillProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
}

export function GlassNavPill({ as: Tag = "nav", className, style, children, ...props }: GlassNavPillProps) {
  return (
    <Tag
      className={cn("flex items-center rounded-full p-1 gap-0.5", className)}
      style={{
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        background: "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)",
        border: "1px solid rgba(255,255,255,0.16)",
        boxShadow: "0 4px 32px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.18)",
        ...style,
      }}
      {...props}
    >
      {children}
    </Tag>
  );
}
