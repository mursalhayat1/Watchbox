/**
 * colorExtractor.ts
 *
 * Canvas-based dominant-color extraction using weighted k-means.
 * Produces a FULL cinematic palette: light (visible hue) and dark variants.
 *
 * Key design decisions:
 *  - processHsl() no longer crushes all colors to near-black.
 *    Light variants retain visible hue at moderate lightness (25–45%).
 *    Dark variants are cinematic darks (6–15%) for background use.
 *  - pixelWeight() rewards mid-saturation + mid-lightness — cinematic tones,
 *    not tiny neons or large near-black areas.
 *  - LRU cache (max 30 entries) keyed by backdrop URL.
 *  - All browser APIs guarded — safe for SSR.
 */

export interface CinematicPalette {
  // Light variants — strong enough to visibly tint the atmosphere
  lightPrimary:   [number, number, number]; // hsl tuple
  lightSecondary: [number, number, number];
  lightAccent:    [number, number, number];
  // Dark variants — for deep page background layers
  darkPrimary:   [number, number, number];
  darkSecondary: [number, number, number];
  // Near-black derived from hue — page bottom color
  nearBlack: [number, number, number];
  /** true = real extraction; false = neutral fallback */
  extracted: boolean;
}

// CSS hsl() value string e.g. "220 65% 35%"
export type HslStr = string;

export interface ProcessedTheme {
  // Light — used at scroll top, hero area, glow effects
  lightPrimary:   HslStr;
  lightSecondary: HslStr;
  lightAccent:    HslStr;
  // Dark — used as page mid-tone backgrounds
  darkPrimary:   HslStr;
  darkSecondary: HslStr;
  // Near-black — page bottom
  nearBlack: HslStr;
  extracted: boolean;
}

// ─── LRU cache ────────────────────────────────────────────────────────────────
const CACHE_MAX = 30;
const cache = new Map<string, ProcessedTheme>();

function cacheGet(key: string): ProcessedTheme | undefined {
  const v = cache.get(key);
  if (v) { cache.delete(key); cache.set(key, v); }
  return v;
}
function cacheSet(key: string, value: ProcessedTheme): void {
  if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value as string);
  cache.set(key, value);
}

// ─── HSL helpers ──────────────────────────────────────────────────────────────
export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const nr = r / 255, ng = g / 255, nb = b / 255;
  const max = Math.max(nr, ng, nb), min = Math.min(nr, ng, nb);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case nr: h = ((ng - nb) / d + (ng < nb ? 6 : 0)) / 6; break;
      case ng: h = ((nb - nr) / d + 2) / 6; break;
      case nb: h = ((nr - ng) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslStr(h: number, s: number, l: number): HslStr {
  return `${h} ${s}% ${l}%`;
}

/**
 * Build light + dark variants for a raw hsl cluster centroid.
 *
 * Light: retain hue, push saturation to 55–75%, lightness to 28–42%.
 *        This is the "visible atmosphere" color — clearly blue, red, etc.
 *
 * Dark:  retain hue, reduce saturation to 35–50%, lightness to 6–13%.
 *        This is the cinematic dark background color.
 *
 * Accent light: slightly higher lightness (38–48%) for accents/glows.
 */
function buildVariants(h: number, s: number, _l: number, role: 'primary' | 'secondary' | 'accent'): {
  light: [number, number, number];
  dark: [number, number, number];
} {
  // Saturation — desaturate oversaturated neons, boost desaturated tones
  const lightS = Math.round(Math.max(50, Math.min(s * 1.1, role === 'accent' ? 80 : 70)));
  const darkS  = Math.round(Math.max(30, Math.min(s * 0.75, 55)));

  // Lightness targets — strong enough to actually be visible
  const lightLTargets = { primary: 35, secondary: 28, accent: 42 };
  const darkLTargets  = { primary: 10, secondary:  7, accent: 13 };

  const lightL = lightLTargets[role];
  const darkL  = darkLTargets[role];

  return {
    light: [h, lightS, lightL],
    dark:  [h, darkS,  darkL],
  };
}

// ─── Fallback — neutral dark (no green hue) ───────────────────────────────────
export const FALLBACK: ProcessedTheme = {
  lightPrimary:   '220 15% 22%',
  lightSecondary: '220 12% 18%',
  lightAccent:    '220 20% 28%',
  darkPrimary:    '220 12% 9%',
  darkSecondary:  '220 10% 6%',
  nearBlack:      '220 8% 4%',
  extracted: false,
};

// ─── Pixel sampling + k-means ─────────────────────────────────────────────────
interface RGB { r: number; g: number; b: number; weight: number }

function pixelWeight(r: number, g: number, b: number): number {
  const [, s, l] = rgbToHsl(r, g, b);
  if (l < 5 || l > 90 || s < 10) return 0;
  // Reward mid-saturation (35–65%) and mid-lightness (25–55%) — cinematic sweet spot
  const sScore = 1 - Math.abs(s - 50) / 50;
  const lScore = 1 - Math.abs(l - 40) / 55;
  return Math.max(0, sScore * 0.55 + lScore * 0.45);
}

function samplePixels(data: Uint8ClampedArray, stride = 4): RGB[] {
  const pixels: RGB[] = [];
  for (let i = 0; i < data.length; i += 4 * stride) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    if (a < 128) continue;
    const w = pixelWeight(r, g, b);
    if (w > 0) pixels.push({ r, g, b, weight: w });
  }
  return pixels;
}

function centroid(pixels: RGB[]): [number, number, number] {
  let tw = 0, sr = 0, sg = 0, sb = 0;
  for (const p of pixels) { sr += p.r * p.weight; sg += p.g * p.weight; sb += p.b * p.weight; tw += p.weight; }
  return tw === 0 ? [128, 128, 128] : [sr / tw, sg / tw, sb / tw];
}

function kMeans(pixels: RGB[], k = 3): Array<[number, number, number]> {
  if (pixels.length < k) return Array.from({ length: k }, (_, i) => [128 - i * 15, 128 - i * 15, 128 - i * 15] as [number,number,number]);
  const step = Math.floor(pixels.length / k);
  let centers: Array<[number, number, number]> = Array.from({ length: k }, (_, i) => {
    const p = pixels[Math.min(i * step, pixels.length - 1)];
    return [p.r, p.g, p.b];
  });
  for (let iter = 0; iter < 8; iter++) {
    const clusters: RGB[][] = Array.from({ length: k }, () => []);
    for (const p of pixels) {
      let minD = Infinity, idx = 0;
      for (let c = 0; c < k; c++) {
        const dr = p.r - centers[c][0], dg = p.g - centers[c][1], db = p.b - centers[c][2];
        const d = dr * dr + dg * dg + db * db;
        if (d < minD) { minD = d; idx = c; }
      }
      clusters[idx].push(p);
    }
    centers = clusters.map((cl, i) => cl.length > 0 ? centroid(cl) : centers[i]);
  }
  // Sort by weighted cluster mass descending
  const masses = Array.from({ length: k }, () => 0);
  for (const p of pixels) {
    let minD = Infinity, idx = 0;
    for (let c = 0; c < k; c++) {
      const dr = p.r - centers[c][0], dg = p.g - centers[c][1], db = p.b - centers[c][2];
      const d = dr * dr + dg * dg + db * db;
      if (d < minD) { minD = d; idx = c; }
    }
    masses[idx] += p.weight;
  }
  return [...centers.keys()].sort((a, b) => masses[b] - masses[a]).map(i => centers[i]);
}

// ─── Canvas loader ─────────────────────────────────────────────────────────────
const SAMPLE_W = 160;

function loadAndSample(url: string): Promise<RGB[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = SAMPLE_W;
        canvas.height = Math.round(SAMPLE_W * (img.naturalHeight / Math.max(img.naturalWidth, 1)));
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('no ctx')); return; }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(samplePixels(ctx.getImageData(0, 0, canvas.width, canvas.height).data, 3));
      } catch (e) { reject(e); }
    };
    img.onerror = () => reject(new Error('load failed'));
    img.src = url;
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────
export async function extractTheme(url: string | null | undefined): Promise<ProcessedTheme> {
  if (typeof window === 'undefined' || !url) return FALLBACK;
  const cached = cacheGet(url);
  if (cached) return cached;

  try {
    const pixels = await loadAndSample(url);
    if (pixels.length < 8) throw new Error('too few pixels');

    const [c0, c1, c2] = kMeans(pixels, 3);
    const [h0, s0, l0] = rgbToHsl(...c0);
    const [h1, s1, l1] = rgbToHsl(...c1);
    const [h2, s2, l2] = rgbToHsl(...c2);

    const p = buildVariants(h0, s0, l0, 'primary');
    const s_ = buildVariants(h1, s1, l1, 'secondary');
    const a = buildVariants(h2, s2, l2, 'accent');

    // Near-black: primary hue, very low saturation + lightness
    const nearBlack: [number,number,number] = [h0, Math.round(Math.min(s0 * 0.4, 20)), 4];

    const theme: ProcessedTheme = {
      lightPrimary:   hslStr(...p.light),
      lightSecondary: hslStr(...s_.light),
      lightAccent:    hslStr(...a.light),
      darkPrimary:    hslStr(...p.dark),
      darkSecondary:  hslStr(...s_.dark),
      nearBlack:      hslStr(...nearBlack),
      extracted: true,
    };
    cacheSet(url, theme);
    return theme;
  } catch {
    cacheSet(url, FALLBACK);
    return FALLBACK;
  }
}

