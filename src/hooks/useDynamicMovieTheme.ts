/**
 * useDynamicMovieTheme
 *
 * Receives a TMDB backdrop URL → extracts full cinematic palette →
 * writes CSS variables on <html> → drives a scroll-progress darkening
 * effect via requestAnimationFrame (no React state on scroll).
 *
 * CSS variables written:
 *   --theme-lp  (light primary)
 *   --theme-ls  (light secondary)
 *   --theme-la  (light accent)
 *   --theme-dp  (dark primary)
 *   --theme-ds  (dark secondary)
 *   --theme-nb  (near black)
 *   --theme-progress  (0–1, driven by scroll position)
 *   --theme-transition (ms, 0 when reduced-motion)
 *
 * Scroll performance:
 *   - Color extraction ONLY runs when the backdrop URL changes.
 *   - Scroll handler uses rAF + a dirty flag → single rAF per frame max.
 *   - No React state updates during scrolling.
 *   - Cleans up all listeners on unmount.
 */

import { useEffect, useRef } from 'react';
import { extractTheme, FALLBACK, type ProcessedTheme } from '@/lib/colorExtractor';

const TRANSITION_MS = 1000;

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function applyTheme(theme: ProcessedTheme, animate: boolean): void {
  const root = document.documentElement;
  root.style.setProperty('--theme-transition', animate ? `${TRANSITION_MS}ms` : '0ms');
  root.style.setProperty('--theme-lp', theme.lightPrimary);
  root.style.setProperty('--theme-ls', theme.lightSecondary);
  root.style.setProperty('--theme-la', theme.lightAccent);
  root.style.setProperty('--theme-dp', theme.darkPrimary);
  root.style.setProperty('--theme-ds', theme.darkSecondary);
  root.style.setProperty('--theme-nb', theme.nearBlack);
}

export function useDynamicMovieTheme(backdropUrl: string | null | undefined): void {
  const latestUrlRef   = useRef<string | null>(null);
  const initializedRef = useRef(false);
  const rafRef         = useRef<number | null>(null);
  const dirtyRef       = useRef(false);

  // ── Color extraction (only when backdrop changes) ──────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = backdropUrl ?? null;
    latestUrlRef.current = url;

    if (!url) {
      applyTheme(FALLBACK, false);
      document.documentElement.style.setProperty('--theme-progress', '0');
      return;
    }

    let cancelled = false;
    extractTheme(url).then((theme) => {
      if (cancelled || latestUrlRef.current !== url) return;
      const animate = !prefersReducedMotion() && initializedRef.current;
      applyTheme(theme, animate);
      initializedRef.current = true;
    });
    return () => { cancelled = true; };
  }, [backdropUrl]);

  // ── Scroll-progress update (rAF, zero React state) ─────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onScroll = () => {
      if (dirtyRef.current) return; // already queued
      dirtyRef.current = true;
      rafRef.current = requestAnimationFrame(() => {
        dirtyRef.current = false;
        const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        const progress  = Math.min(1, window.scrollY / maxScroll);
        document.documentElement.style.setProperty('--theme-progress', String(progress.toFixed(4)));
      });
    };

    // Set initial value
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);
}

