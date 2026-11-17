# Cinemaos Embed Provider Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Cinemaos as a third embed provider in the media player modal — same shared security config as NxSha/ScreenScape, plus real PostMessage progress tracking (absolute position, ENDED auto-watch, `startTime` resume).

**Architecture:** Provider config + URL building live in a new dependency-free module `src/lib/embed-providers.ts` (mirrors `lib/episode-nav`); the modal consumes it. Cinemaos-specific behavior (origin-checked `PLAYER_EVENT` listener, throttled absolute saves with additive fallback, `startTime` baked into the embed URL, Start-over `seek 0` command) is wired in `MediaPlayerModal.tsx`. NxSha/ScreenScape behavior is untouched.

**Tech Stack:** React 18 + TypeScript + Vite; vitest (jsdom, `vitest.config.ts` at root); localStorage progress via `src/hooks/usePlaybackProgress.ts`.

**Spec:** `docs/superpowers/specs/2026-11-17-cinemaos-provider-design.md`

## Global Constraints

- Package manager is pnpm. There is no root `test` script: run tests with `npx vitest run <file>` (picks up `vitest.config.ts`: jsdom, `globals: true`, setup `src/__tests__/setup.ts`, alias `@` → `./src`). Typecheck with `npx tsc -b` (the `build` script runs `tsc -b && vite build`).
- Root tests import source via **relative paths** (see `tests/episode-nav.test.ts`: `from '../src/lib/episode-nav'`) — match that.
- `src/lib/embed-providers.ts` must stay **dependency-free** (no React, framer-motion, or TMDB imports) so node-side tests stay light.
- Exact CinemaOS URL values (pinned by spec): endpoints `https://cinemaos.tech/player/{tmdbId}` (movie) and `https://cinemaos.tech/player/{tmdbId}/{season}/{episode}` (TV); params `theme=0e7490`, `nextButton=false`, `autoNext=false` on every URL; `startTime` appended only when a resume position > 0 exists.
- PostMessage contract (verified from live docs): listener gates on `origin === 'https://cinemaos.tech'`; envelope `data.type === 'PLAYER_EVENT'` with inner `data.data` `{ event: 'play'|'pause'|'seeked'|'ended'|'timeupdate'|'playerstatus', currentTime: number, duration: number, tmdbId: string /* STRING */, mediaType: 'movie'|'tv', season?, episode?, playing, muted, volume }`; parent→player commands are `{ command: 'seek', time: <secs> }` via `iframe.contentWindow.postMessage`.
- Switcher label is exactly `Cinemaos` (user's requested capitalization); provider id is `cinemaos`.
- Do not change: NxSha/ScreenScape URL math, the shared iframe `sandbox`/`allow` attributes, the `referrerPolicy` ternary (`cinemaos` gets `no-referrer` automatically since it isn't `screenscape`), `usePlaybackProgress.ts` storage semantics, or `DetailPage.tsx`.

## Review Focus

Inputs the spec implies but no single task's tests fully exercise — each pinned where noted:

1. **Message noise from other origins/scripts** on the shared `window` (any app code, devtools) — must be ignored by the listener. Pinned: Task 1 tests reject wrong origin, wrong `type`, malformed payload.
2. **`tmdbId` is a STRING in PLAYER_EVENT** (`'550'`) while the app holds a number — mismatched comparison would silently drop all events. Pinned: Task 1 test accepts `'550'` for `tmdbId=550` and rejects `'27205'`.
3. **No PLAYER_EVENT ever arrives** (player fails, events blocked) — close/switch must still save via the additive session estimate, never corrupting absolute tracking. Pinned: Task 1 `resolveCinemaosSave` fallback test.
4. **`startTime` on fresh or near-finished content** — must be omitted (fresh = 0 position; near-finished = `movieHasResume`/`tvHasResume` 5–95% gates). Pinned: Task 1 test omits param at 0; Task 3 wires the gates; Task 4 smoke checks a fresh title loads without `startTime`.
5. **ENDED + forward-step double-fire** of `onEpisodeLeft` (user finishes episode, then clicks Next) — expected: no duplicate marks (`markEpisodeWatchedLocal` dedupes; server mark is a best-effort upsert). Verified by Task 4 smoke checklist.
6. **Provider switch mid-session** with Cinemaos — iframe remounts (existing `key={embedUrl}`), listener re-subscribes, no stale saves land on the new provider's URL. Verified by Task 4 smoke checklist.

---

### Task 1: Pure provider module `src/lib/embed-providers.ts`

**Files:**
- Create: `src/lib/embed-providers.ts`
- Create: `tests/embed-providers.test.ts`

**Interfaces:**
- Consumes: nothing (dependency-free module).
- Produces (used by Tasks 2–3 and future callers):
  - `export type EmbedProvider = 'nxsha' | 'screenscape' | 'cinemaos'`
  - `export const PROVIDERS: { id: EmbedProvider; label: string }[]` — `[{ id:'nxsha', label:'NxSha' }, { id:'screenscape', label:'ScreenScape' }, { id:'cinemaos', label:'Cinemaos' }]`
  - `export const LS_KEY = 'watchbox_embed_provider'`
  - `export function getSavedProvider(): EmbedProvider` — reads LS_KEY, returns the value only if it's one of the three ids, else `'nxsha'`; all storage access in try/catch.
  - `export function saveProvider(p: EmbedProvider): void` — try/catch write.
  - `export const CINEMAOS_EMBED_ORIGIN = 'https://cinemaos.tech'`
  - `export function buildEmbedUrl(provider: EmbedProvider, mediaType: 'movie' | 'tv', tmdbId: number, season = 1, episode = 1, startAtSecs = 0): string`
  - `export interface CinemaosPlayerEventData { event: 'play'|'pause'|'seeked'|'ended'|'timeupdate'|'playerstatus'; currentTime: number; duration: number; tmdbId: string; mediaType: 'movie'|'tv'; season?: number; episode?: number; playing: boolean; muted: boolean; volume: number }`
  - `export function parseCinemaosPlayerEvent(msg: { origin: string | null; data: unknown }, tmdbId: number): CinemaosPlayerEventData | null`
  - `export interface CinemaosSaveInput { trackedSecs: number; trackedDurationSecs: number; sessionSecs: number; prevPositionSecs: number; prevDurationSecs: number }`
  - `export interface ProgressSave { positionSecs: number; durationSecs: number }`
  - `export function resolveCinemaosSave(input: CinemaosSaveInput): ProgressSave`

- [ ] **Step 1: Write the failing test** in `tests/embed-providers.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import {
  PROVIDERS, getSavedProvider, saveProvider, buildEmbedUrl,
  parseCinemaosPlayerEvent, resolveCinemaosSave, CINEMAOS_EMBED_ORIGIN, LS_KEY,
} from '../src/lib/embed-providers';

describe('PROVIDERS', () => {
  it('lists the three providers in order', () => {
    expect(PROVIDERS.map(p => p.id)).toEqual(['nxsha', 'screenscape', 'cinemaos']);
    expect(PROVIDERS.find(p => p.id === 'cinemaos')?.label).toBe('Cinemaos');
  });
});

describe('getSavedProvider', () => {
  it('defaults to nxsha', () => {
    localStorage.removeItem(LS_KEY);
    expect(getSavedProvider()).toBe('nxsha');
  });
  it('accepts each valid id and rejects garbage', () => {
    saveProvider('cinemaos');
    expect(getSavedProvider()).toBe('cinemaos');
    localStorage.setItem(LS_KEY, 'bogus');
    expect(getSavedProvider()).toBe('nxsha');
  });
});

describe('buildEmbedUrl', () => {
  it('builds nxsha movie url with teal color param', () => {
    expect(buildEmbedUrl('nxsha', 'movie', 550))
      .toBe('https://nxsha.space/embed/movie/550?color=%230e7490');
  });
  it('builds nxsha tv url with season and episode', () => {
    expect(buildEmbedUrl('nxsha', 'tv', 550, 2, 3))
      .toBe('https://nxsha.space/embed/tv/550/2/3?color=%230e7490');
  });
  it('builds screenscape movie url', () => {
    expect(buildEmbedUrl('screenscape', 'movie', 550))
      .toBe('https://screenscape.me/embed?tmdb=550&type=movie');
  });
  it('builds screenscape tv url', () => {
    expect(buildEmbedUrl('screenscape', 'tv', 550, 2, 3))
      .toBe('https://screenscape.me/embed?tmdb=550&type=tv&s=2&e=3');
  });
  it('builds cinemaos movie url with pinned params', () => {
    expect(buildEmbedUrl('cinemaos', 'movie', 550))
      .toBe('https://cinemaos.tech/player/550?theme=0e7490&nextButton=false&autoNext=false');
  });
  it('builds cinemaos tv url with season and episode', () => {
    expect(buildEmbedUrl('cinemaos', 'tv', 550, 1, 2))
      .toBe('https://cinemaos.tech/player/550/1/2?theme=0e7490&nextButton=false&autoNext=false');
  });
  it('appends startTime only for a positive resume position', () => {
    const withStart = buildEmbedUrl('cinemaos', 'movie', 550, 1, 1, 123);
    expect(withStart).toContain('startTime=123');
    expect(buildEmbedUrl('cinemaos', 'movie', 550, 1, 1, 0)).not.toContain('startTime');
  });
});

describe('parseCinemaosPlayerEvent', () => {
  const payload = {
    type: 'PLAYER_EVENT',
    data: {
      event: 'timeupdate', currentTime: 120.5, duration: 8280,
      tmdbId: '550', mediaType: 'movie', playing: true, muted: false, volume: 1,
    },
  };
  it('accepts a valid event from the cinemaos origin, matching tmdbId as string', () => {
    const parsed = parseCinemaosPlayerEvent({ origin: CINEMAOS_EMBED_ORIGIN, data: payload }, 550);
    expect(parsed?.event).toBe('timeupdate');
    expect(parsed?.currentTime).toBe(120.5);
  });
  it('rejects other origins', () => {
    expect(parseCinemaosPlayerEvent({ origin: 'https://evil.example', data: payload }, 550)).toBeNull();
  });
  it('rejects non-PLAYER_EVENT types and malformed data', () => {
    expect(parseCinemaosPlayerEvent({ origin: CINEMAOS_EMBED_ORIGIN, data: { type: 'MEDIA_DATA', data: {} } }, 550)).toBeNull();
    expect(parseCinemaosPlayerEvent({ origin: CINEMAOS_EMBED_ORIGIN, data: null }, 550)).toBeNull();
    expect(parseCinemaosPlayerEvent({ origin: CINEMAOS_EMBED_ORIGIN, data: { type: 'PLAYER_EVENT' } }, 550)).toBeNull();
  });
  it('rejects events for a different tmdb id (string vs number)', () => {
    expect(parseCinemaosPlayerEvent({ origin: CINEMAOS_EMBED_ORIGIN, data: payload }, 27205)).toBeNull();
  });
  it('rejects unknown event names', () => {
    const bad = { ...payload, data: { ...payload.data, event: 'hijack' } };
    expect(parseCinemaosPlayerEvent({ origin: CINEMAOS_EMBED_ORIGIN, data: bad }, 550)).toBeNull();
  });
});

describe('resolveCinemaosSave', () => {
  it('prefers real tracked position over the session estimate', () => {
    expect(resolveCinemaosSave({
      trackedSecs: 120.6, trackedDurationSecs: 8280.4,
      sessionSecs: 500, prevPositionSecs: 100, prevDurationSecs: 0,
    })).toEqual({ positionSecs: 121, durationSecs: 8280 });
  });
  it('falls back to the additive session estimate when nothing was tracked', () => {
    expect(resolveCinemaosSave({
      trackedSecs: 0, trackedDurationSecs: 0,
      sessionSecs: 33.2, prevPositionSecs: 100, prevDurationSecs: 8280,
    })).toEqual({ positionSecs: 133, durationSecs: 8280 });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/embed-providers.test.ts`
Expected: FAIL — cannot resolve `../src/lib/embed-providers`.

- [ ] **Step 3: Implement `src/lib/embed-providers.ts`**

Module header comment mirroring `lib/episode-nav` style. `buildEmbedUrl` preserves the existing screenscape and nxsha branches verbatim (moved from `MediaPlayerModal.tsx:37-55`) and adds:

```ts
if (provider === 'cinemaos') {
  const params = new URLSearchParams({
    theme: '0e7490',          // app accent (CinemaOS wants hex WITHOUT '#'; mirrors nxsha's color=#0e7490)
    nextButton: 'false',      // modal has its own Prev/Next episode buttons
    autoNext: 'false',        // player must not silently navigate episodes inside the iframe
  });
  if (startAtSecs > 0) params.set('startTime', String(Math.floor(startAtSecs)));
  const query = params.toString();
  if (mediaType === 'tv') return `${CINEMAOS_EMBED_ORIGIN}/player/${tmdbId}/${season}/${episode}?${query}`;
  return `${CINEMAOS_EMBED_ORIGIN}/player/${tmdbId}?${query}`;
}
```

`getSavedProvider` validates against all three ids (`'nxsha' | 'screenscape' | 'cinemaos'`), default `'nxsha'`. `parseCinemaosPlayerEvent`: null-check `msg.origin !== CINEMAOS_EMBED_ORIGIN` → null; `msg.data` must be an object with `type === 'PLAYER_EVENT'`; inner `data.data` must have `event` in the six allowed strings, numeric `currentTime`, string `tmdbId` strictly equal to `String(tmdbId)`; normalize `duration` to `0` when not numeric; return the inner object as `CinemaosPlayerEventData`. `resolveCinemaosSave`: if `trackedSecs > 0` → `{ positionSecs: Math.round(trackedSecs), durationSecs: Math.round(trackedDurationSecs) }`; else → `{ positionSecs: Math.round(prevPositionSecs + sessionSecs), durationSecs: prevDurationSecs }`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/embed-providers.test.ts`
Expected: PASS (all suites green).

- [ ] **Step 5: Commit**

```bash
git add src/lib/embed-providers.ts tests/embed-providers.test.ts
git commit -m "feat: add cinemaos embed provider config module"
```

---

### Task 2: Modal consumes the module — Cinemaos appears in the switcher

**Files:**
- Modify: `src/components/movie/MediaPlayerModal.tsx` (lines 14–55 replaced by an import; no other behavioral change)

**Interfaces:**
- Consumes: everything Task 1 exports.
- Produces: the modal still default-exports `MediaPlayerModal`; nothing else imports `EmbedProvider` from it (verified — only `DetailPage.tsx` imports the default), so no re-export needed.

- [ ] **Step 1: Replace the local provider block (lines 14–55) with:**

```ts
import {
  PROVIDERS, getSavedProvider, saveProvider, buildEmbedUrl,
  type EmbedProvider,
} from '@/lib/embed-providers';
```

Keep `const [provider, setProvider] = useState<EmbedProvider>(getSavedProvider);` and `handleProviderChange` exactly as-is (they already work for the third id via the type union). Keep the `embedUrl` call site at six args (`startAtSecs` arrives in Task 3 — pass nothing yet).

- [ ] **Step 2: Verify no regressions**

Run: `npx tsc -b && npx vitest run tests/embed-providers.test.ts`
Expected: typecheck clean; Task 1 suite passes (the modal has no other test importers; the full-suite gate is Task 4).

- [ ] **Step 3: Commit**

```bash
git add src/components/movie/MediaPlayerModal.tsx
git commit -m "feat: add Cinemaos to the embed provider switcher"
```

---

### Task 3: Real tracking — startTime resume, PLAYER_EVENT listener, ENDED auto-watch

**Files:**
- Modify: `src/components/movie/MediaPlayerModal.tsx`

**Interfaces:**
- Consumes: `buildEmbedUrl(..., startAtSecs)`, `CINEMAOS_EMBED_ORIGIN`, `parseCinemaosPlayerEvent`, `resolveCinemaosSave` (Task 1); `movieHasResume`/`getMovieProgress`/`tvHasResume`/`getTVProgress`/`saveMovieProgress`/`saveTVProgress` (already imported from `@/hooks/usePlaybackProgress`); `onEpisodeLeft` prop (already declared, `DetailPage` persists watched server+local).
- Produces: no new exports; modal behavior only.

- [ ] **Step 1: Add resume position state and wire it into the URL**

Near the other state (top of the component): `const [startAtSecs, setStartAtSecs] = useState(0);` and change the embed URL line to:

```ts
const embedUrl = buildEmbedUrl(provider, mediaType, tmdbId, season, episode, startAtSecs);
```

New effect (placed near the open-reset effect):

```ts
// Cinemaos only: bake the saved resume position into the embed URL so the
// player starts there. movieHasResume/tvHasResume enforce the 5–95% band.
useEffect(() => {
  if (!open || provider !== 'cinemaos') { setStartAtSecs(0); return; }
  let pos = 0;
  if (mediaType === 'movie') {
    if (movieHasResume(tmdbId)) pos = getMovieProgress(tmdbId)!.positionSecs;
  } else if (tvHasResume(tmdbId, season, episode)) {
    pos = getTVProgress(tmdbId)!.positionSecs;
  }
  setStartAtSecs(pos);
}, [open, provider, mediaType, tmdbId, season, episode]);
```

- [ ] **Step 2: Add tracking refs and reset them with session/episode changes**

```ts
// Cinemaos real-time position (PLAYER_EVENT), null until the first event arrives
const trackedRef    = useRef<{ secs: number; duration: number } | null>(null);
const lastSaveAtRef = useRef(0);
```

In the open-reset effect (after `openedAtRef.current = Date.now();`) and in the `[season, episode]` reset effect: `trackedRef.current = null; lastSaveAtRef.current = 0;`

- [ ] **Step 3: Branch `flushProgress` on the provider**

`flushProgress` (currently `prevPos + sessionSecs` additive, `MediaPlayerModal.tsx:206-224`) keeps its signature and call sites; inside, for `provider === 'cinemaos'` the save math becomes `resolveCinemaosSave({ trackedSecs: trackedRef.current?.secs ?? 0, trackedDurationSecs: trackedRef.current?.duration ?? 0, sessionSecs, prevPositionSecs: <existing prevPos>, prevDurationSecs: <existing prevDur> })`, then one `saveMovieProgress`/`saveTVProgress` call with the result. The non-cinemaos path keeps today's additive math unchanged. Add `provider` to the callback's deps.

- [ ] **Step 4: Add the origin-checked message listener**

```ts
// Cinemaos real-time tracking — origin-checked PLAYER_EVENT listener.
useEffect(() => {
  if (!open || provider !== 'cinemaos') return;
  const onMessage = (ev: MessageEvent) => {
    const pe = parseCinemaosPlayerEvent({ origin: ev.origin, data: ev.data }, tmdbId);
    if (!pe) return;
    trackedRef.current = { secs: pe.currentTime, duration: pe.duration || trackedRef.current?.duration ?? 0 };
    if (pe.event === 'pause' || pe.event === 'seeked') {
      flushProgress(season, episode);
      lastSaveAtRef.current = Date.now();
    } else if (pe.event === 'ended') {
      flushProgress(season, episode);          // duration>0 & ≥90% ⇒ auto-watched locally
      if (mediaType === 'tv') onEpisodeLeft?.(season, episode);
    } else if (pe.event === 'timeupdate' || pe.event === 'play') {
      if (Date.now() - lastSaveAtRef.current >= 10_000) {
        flushProgress(season, episode);
        lastSaveAtRef.current = Date.now();
      }
    }
    // 'playerstatus' → tracked position only, no save
  };
  window.addEventListener('message', onMessage);
  return () => window.removeEventListener('message', onMessage);
}, [open, provider, tmdbId, mediaType, season, episode, flushProgress, onEpisodeLeft]);
```

- [ ] **Step 5: Start-over sends the seek-0 command for Cinemaos**

In the resume overlay's "Start over" button (after the existing `saveMovieProgress(..., 0, 0)` / `saveTVProgress(..., 0, 0)` clears — do NOT touch `startAtSecs` state there, that would remount the iframe):

```ts
if (provider === 'cinemaos') {
  iframeRef.current?.contentWindow?.postMessage({ command: 'seek', time: 0 }, CINEMAOS_EMBED_ORIGIN);
}
```

- [ ] **Step 6: Update the stale comment**

`MediaPlayerModal.tsx:97` comment ("no postMessage API") becomes: estimate is the fallback; Cinemaos reports real position via PLAYER_EVENT.

- [ ] **Step 7: Verify**

Run: `npx tsc -b && npx vitest run`
Expected: typecheck clean; all suites pass. Manual smoke (dev server, optional): Cinemaos selected → open a movie, iframe `src` contains `theme=0e7490`; play past 10s → close → reopen → `startTime` present; console shows no cross-origin errors.

- [ ] **Step 8: Commit**

```bash
git add src/components/movie/MediaPlayerModal.tsx
git commit -m "feat: real playback tracking for Cinemaos via PLAYER_EVENT"
```

---

### Task 4: Full verification + docs

**Files:**
- Commit only: `docs/superpowers/specs/2026-11-17-cinemaos-provider-design.md`, `docs/superpowers/plans/2026-11-17-cinemaos-provider.md`

- [ ] **Step 1: Full gate**

Run: `npx vitest run && npx tsc -b`
Expected: all suites pass, typecheck clean. Pre-existing failures in files this plan doesn't touch are out of scope — confirm they reproduce on the base commit before investigating.

- [ ] **Step 2: Lint the touched files**

Run: `npx biome lint src/lib/embed-providers.ts src/components/movie/MediaPlayerModal.tsx tests/embed-providers.test.ts`
Expected: no new errors (pre-existing warnings elsewhere are out of scope).

- [ ] **Step 3: Smoke checklist against Review Focus** (dev server `pnpm dev`; items 5–6 manual)

1. Switcher shows `Cinemaos`, selection persists across reload.
2. Fresh movie (no progress): iframe URL has `theme=0e7490&nextButton=false&autoNext=false`, **no** `startTime`.
3. Watch > 10s, close, reopen: resume label appears, iframe URL has `startTime`; Start over → player seeks to 0, progress cleared.
4. TV: ENDED → green tick on the episode (grid refresh), no console errors.
5. Finish episode with Cinemaos, then click Next → single tick only (no duplicate).
6. Switch to NxSha/ScreenScape mid-session → old provider still loads and saves as before (additive estimate).

- [ ] **Step 4: Commit docs**

```bash
git add docs/superpowers
git commit -m "docs: cinemaos provider design and plan"
```
