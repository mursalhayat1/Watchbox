# Cinemaos embed provider — design (2026-11-17)

## Intent & why

Add CinemaOS as a third embed player in the Watchbox media player modal, alongside NxSha and ScreenScape, with the same shared config (sandbox, allow list) — plus real playback tracking via CinemaOS's documented PostMessage API, which the current session-length estimate can't do. User request: "Add this media player to my Watchbox app, alongside the two already configured. Apply the same configuration and settings, enable ad-blocking and sandboxing… Use https://cinemaos.tech/embed and name it Cinemaos in the sources switcher." All five proposed ideas were approved ("add all 5").

## Goals

- "Cinemaos" appears in the Source switcher; selection persists in localStorage like the others.
- Movies load `https://cinemaos.tech/player/{tmdbId}`, TV loads `https://cinemaos.tech/player/{tmdbId}/{season}/{episode}` (verified from their live embed docs; `/embed` itself is their docs page, not a player).
- Params on both: `theme=0e7490` (match app teal, mirrors NxSha's `color=#0e7490`), `nextButton=false` (modal has its own Prev/Next), `autoNext=false` (prevent the player silently navigating to the next episode inside the iframe, desyncing modal state). No `title`/`poster`/`autoPlay` params (defaults; no autoplay = parity with the other two providers).
- Real progress tracking for Cinemaos via `PLAYER_EVENT` postMessages (origin-checked against `https://cinemaos.tech`): absolute `currentTime`/`duration` saved (throttled ~10s, always on pause/seek/switch/close), replacing the additive session estimate when real data exists; estimate stays as fallback and for the other two providers.
- `ENDED` → final save (position = duration) + auto-mark the episode watched via the existing `onEpisodeLeft` path (TV).
- Resume: when a meaningful saved position exists (`movieHasResume`/`tvHasResume`), the embed URL gets `startTime={positionSecs}` so the player resumes at load; overlay's "Start over" clears progress and best-effort `seek 0` via postMessage command.
- Same security posture: shared `sandbox` (no `allow-popups`, no `allow-top-navigation` → popup ads and parent-page hijacking are blocked), `referrerPolicy` resolves to `no-referrer` for Cinemaos via the existing ternary (no code change needed). In-iframe ad-blocking is not possible from the parent app; CinemaOS ships a built-in ad toggle.

## Non-goals / anti-goals

- No auto-advance to next episode on `ENDED` (user approved mark-watched only).
- No volume/mute/play/pause/getStatus parent-side controls — only the `seek` command for Start-over.
- `MEDIA_DATA` events ignored; only `PLAYER_EVENT`.
- No changes to NxSha/ScreenScape behavior or their progress estimate.
- No autoplay.

## Constraints

- Watchbox = Vite + React + TS; player lives in `src/components/movie/MediaPlayerModal.tsx`; progress persisted by `src/hooks/usePlaybackProgress.ts` (localStorage; TV auto-marks watched at ≥ 90% but only when `durationSecs > 0` — today's estimate never learns duration, so Cinemaos tracking makes auto-watch and resume actually work).
- `DetailPage.tsx` owns library add (`onPlayStart`) and episode-watched persistence (`onEpisodeLeft`, server + local + grid refresh; idempotent, so double-fire with forward-step is safe).

## Approaches considered

1. **Pure provider add (parity only)** — minimal, but leaves the estimate's blind spots (no duration → resume/auto-watch never trigger). Rejected as the sole scope: user approved the tracking upgrade.
2. **Provider add + PostMessage integration (chosen)** — CinemaOS documents a stable postMessage API; real tracking fixes duration, resume, and auto-watch in one stroke. Extra state (tracked position ref, throttle) is contained in the modal.
3. **Full remote-control UI (play/pause/volume buttons in modal)** — gold-plating; rejected.

## How it's built (decided)

- Extract provider config + `buildEmbedUrl` into a new pure module `src/lib/embed-providers.ts` (mirrors the `lib/episode-nav` pattern; makes the URL logic unit-testable without React). Modal imports from it; `buildEmbedUrl` gains an optional `startAtSecs` arg that appends `startTime` when > 0.
- New vitest file `tests/cinemaos-embed.test.ts` covering URL building for all three providers (endpoints, params, `startTime` included/omitted, existing providers unchanged).
- Modal changes: cinemaos branch in provider validation; `PLAYER_EVENT` window listener (origin check, throttled absolute saves, ENDED handling, tracked-ref fallback to estimate); `startTime` computed from saved progress on open/step; Start-over sends best-effort `seek {time: 0}`; `flushProgress` branches to absolute save when real data exists.

## Left to the builder

- Exact throttle constant, ref naming, effect dependency wiring — builder's judgment within the constraints above.
- The Resume overlay copy stays as-is ("Resume from mm:ss" — with startTime baked in, the player is already at that point; Resume just dismisses).
