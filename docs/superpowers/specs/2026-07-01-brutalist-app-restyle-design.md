# Brutalist Restyle of the Call App — Design

**Date:** 2026-07-01
**Status:** Approved design, ready for implementation planning
**Builds on:** the brutalist landing (`docs/superpowers/specs/2026-07-01-brutalist-landing-design.md`)

## Purpose

Extend the neo-brutalist design system from the landing into the actual product
UI (`/app`) — the Lobby and the in-call Room — so the whole app is visually
cohesive. **Restyle only:** no change to Twilio logic, state, or behavior.

## Guiding constraint: restyle-only

Only classNames/markup and UI primitives change. Do NOT change:
- `useRoom` and the participant/network hooks (logic, effects, event wiring).
- Any `onClick`/handler, controlled-input state, refs, `track.attach()` calls,
  effect dependencies, or component props/signatures.
- `lib/*` (twilioClient, localMedia, grid, clock), `Root.tsx`, `main.tsx`,
  `theme-provider.tsx`.

The 16 existing tests are pure logic (participants reducer, `fetchToken`,
`formatClock`) and must remain green untouched.

## Design tokens (already defined in `index.css`)

`--color-studio-bg #0D0D0D`, `--color-studio-border #222222`,
`--color-studio-muted #999999`, `--color-studio-orange #FF3B00`, white text.
Hard edges (`rounded-none`), 1px borders, uppercase micro labels
(`text-[11px] font-semibold uppercase tracking-[0.15em]`), instant hovers.

## Confirmed choices

- Dominant-speaker ring and active network bars switch **green → orange**.
- **No film grain over the in-call video area** (clean video). Grain stays on the
  Lobby only (subtle).
- `theme-provider` stays (moot under a dark brutalist scheme; harmless).

## New shared primitives (`src/components/studio/`)

- `StudioInput.tsx` — transparent background, bottom rule only
  (`border-b border-studio-border`), white text, muted placeholder; border turns
  `studio-orange` on focus. Forwards standard input props
  (`value`, `onChange`, `onKeyDown`, `placeholder`, `id`, `type`).
- `StudioIconButton.tsx` — square (`rounded-none`) icon button. Props:
  `active?: boolean`, `variant?: 'default' | 'danger'`, `onClick`, `children`
  (the icon), `aria-label`. Default: transparent + `border-studio-border`, white
  icon, hover invert. `active`: solid `studio-orange`, black icon. `danger`
  (leave): solid orange with a distinct emphasis. Instant transitions.
- `StudioButton` (exists) — reused for the Lobby Join action.

## Per-component restyle

- **`Lobby.tsx`** — dark `studio-bg` page with a subtle grain layer
  (reuse `GrainOverlay`), a bordered (not rounded) frame, `(JOIN A CALL)` micro
  heading, uppercase labels, two `StudioInput`s, a native brutalist checkbox for
  "AUDIO-ONLY", and an orange `StudioButton` **JOIN** (full-width, disabled when
  `!canJoin`). Error text in `text-studio-orange`. Preserves all state/handlers.
- **`Room.tsx`** — outer `bg-studio-bg text-white`; header becomes a bordered bar
  (`border-b border-studio-border`) with the room name as an uppercase wordmark,
  an `N IN CALL` micro tag, and a `StudioIconButton` copy-link; reconnecting
  banner → solid `studio-orange` with black uppercase text; chat aside gets
  `border-l border-studio-border`. Layout/props unchanged.
- **`ParticipantGrid.tsx`** — unchanged logic; tiles inherit the tile restyle.
  Keep the `gridColsForCount` sizing.
- **`Participant.tsx` / `LocalVideo.tsx` / `LocalScreen.tsx`** — tiles become
  `rounded-none border border-studio-border bg-studio-bg`; name labels → uppercase
  micro tags on a translucent black chip; the dominant ring on `Participant`
  becomes `ring-2 ring-studio-orange`; keep all refs/attach logic and the
  `isDominant`/status props.
- **`ControlBar.tsx`** — replace the shadcn `Button`s with `StudioIconButton`s;
  mic/camera "on" = default, "off" = orange/danger emphasis; screen-share and chat
  "active" = orange; leave = `danger`. All five `onClick`s unchanged.
- **`ChatPanel.tsx`** — bordered panel; message rows in a muted uppercase-name /
  white-text style; the input becomes a `StudioInput` with an uppercase "SEND"
  `StudioButton`; keep the `submit`/Enter logic.
- **`NetworkBars.tsx`** — active bars `bg-studio-orange`, inactive `bg-white/25`.

## Error handling / edge cases

- `StudioInput` and `StudioIconButton` are thin wrappers; they must forward
  `disabled`, `aria-label`, and keyboard focusability so accessibility and the
  `canJoin` disable behavior are preserved.
- Grain overlay stays `pointer-events-none` (never blocks the Join button).
- No new async paths; nothing new to fail.

## Testing

- **Automated:** the existing 16 tests must pass unchanged (`npm run build && npm
  test && npm run lint`). No new unit tests (pure restyle; no new logic).
- **Manual (preview screenshots):** Lobby renders brutalist; two-tab in-call view
  shows brutalist tiles, orange dominant ring, orange network bars, brutalist
  control bar and chat; all controls still work; `/` landing unaffected.

## Build order (incremental)

1. `StudioInput` + `StudioIconButton` primitives.
2. `Lobby` restyle.
3. Tiles: `Participant`, `LocalVideo`, `LocalScreen` + `NetworkBars` (orange).
4. `ControlBar` restyle.
5. `ChatPanel` restyle.
6. `Room` chrome (header, banner, aside) + final verify.
