# Tier-1 Call Features + Grid/Screen Fixes — Design

**Date:** 2026-07-01
**Status:** Approved design, ready for implementation planning
**Builds on:** the working TwilioMeet app (`docs/superpowers/specs/2026-06-30-twilio-video-call-app-design.md`)

## Purpose

Add a batch of small, high-value in-call features that exercise the Twilio
`Room`/`Participant` event API we haven't touched yet, and fix two known issues.
Learning-focused: each feature maps to a specific Twilio/web concept.

## Scope

### Features
1. **Active-speaker highlight** — ring the tile of the current dominant speaker.
2. **Remote mute/camera indicators** — show mic-off / camera-off state per tile.
3. **Network-quality bars** — per-participant signal strength (0–5).
4. **Reconnecting banner** — visible state when the connection drops/recovers.
5. **Room link + participant count** — header with `room.name`, live count, and a
   copy-link button that produces a shareable `?room=<name>` URL.

### Fixes
6. **Local screen-share preview** — you currently can't see your own shared screen.
7. **Responsive grid** — tiles adapt to participant count and fit the viewport.

### Out of scope
- Tier 2 (pre-join device preview, reactions, pin/layout, background blur) — a
  separate later batch.
- Any backend change. All work is in `frontend/`.

## Key Architectural Decision

Four features need per-participant subscriptions to SDK events (dominant speaker,
track enabled/disabled, network quality). Instead of expanding `Participant.tsx`'s
existing DOM-attach effect, extract a focused hook:

- **`useParticipantStatus(participant)`** → `{ audioEnabled, videoEnabled, networkLevel }`.
  Works for any `Participant` (local or remote). It subscribes to
  `trackEnabled`/`trackDisabled`/`trackSubscribed`/`trackUnsubscribed` (for
  enabled-state) and `networkQualityLevelChanged` (for level), reads initial state
  from the participant's publications, and cleans up listeners on unmount/change.

`Participant.tsx` keeps its DOM attach/detach effect (it needs refs); it consumes
the hook for badges and bars. `LocalVideo.tsx` consumes the hook for its bars.

## Connect-time options (in `useRoom.join`)

Add to the existing `connect()` call:
```ts
dominantSpeaker: true,
networkQuality: { local: 1, remote: 1 },
```
Everything else (`name`, `audio`, `video`) stays as-is.

## State ownership

**`useRoom`** gains room-level state and exposes it:
- `dominantSpeakerSid: string | null` — updated on `dominantSpeakerChanged`
  (Twilio reports only remote participants; the local tile never highlights).
- `connectionState: 'connected' | 'reconnecting'` — updated on
  `reconnecting`/`reconnected`.
- `screenTrack: LocalVideoTrack | null` and `toggleScreenShare()` — **moved out of
  `ControlBar`** so the grid can render the shared screen. `toggleScreenShare`
  publishes/unpublishes via the existing `localMedia` helpers, manages the
  `screenTrack` state, and handles the native browser "Stop sharing" (`ended`)
  event. Mic/camera toggles remain in `ControlBar` (they don't affect the grid).

The room name comes from `room.name` (already available) — no new state needed.

## Components

**New**
- `lib/grid.ts` — `gridColsForCount(n: number): number` (pure). Mapping:
  `1→1, 2→2, 3→2, 4→2, 5–6→3, 7–9→3, 10+→4` (cap at 4 columns).
- `lib/grid.test.ts` — unit tests for the mapping incl. boundaries and `0`.
- `hooks/useParticipantStatus.ts` — the status hook above.
- `components/NetworkBars.tsx` — presentational; renders 5 bars, `level` of them
  filled (level `null` → render a muted/neutral state).
- `components/LocalScreen.tsx` — a tile that attaches the local screen track,
  labeled "You (screen)". Rendered by the grid only when `screenTrack` is set.

**Modified**
- `useRoom.ts` — connect options; `dominantSpeakerSid`, `connectionState`,
  `screenTrack`, `toggleScreenShare`; new event handlers + cleanup; extended
  return value.
- `Participant.tsx` — consume `useParticipantStatus`; render mic-off badge,
  camera-off overlay, and `NetworkBars`; accept an `isDominant` prop for the ring.
- `LocalVideo.tsx` — consume `useParticipantStatus` for `NetworkBars`.
- `ParticipantGrid.tsx` — apply `gridColsForCount` via inline
  `gridTemplateColumns`; render `LocalVideo`, optional `LocalScreen`, and remote
  `Participant`s; pass `dominantSpeakerSid` so the matching tile gets the ring.
- `ControlBar.tsx` — take `sharing` + `onToggleShare` props (from `useRoom` via
  `Room`) instead of owning screen state; keep mic/camera internal.
- `Room.tsx` — header bar (`room.name`, participant count = `participants.length + 1`,
  copy-link button); reconnecting banner when `connectionState === 'reconnecting'`;
  thread `dominantSpeakerSid`, `screenTrack`, `sharing`, `onToggleShare`.
- `App.tsx` — pass new `useRoom` values through; on join, set
  `history.replaceState` to `?room=<roomName>`.
- `Lobby.tsx` — pre-fill the room field from `?room=` (via `URLSearchParams`).

## Room link behavior

- Joining sets the URL to `${pathname}?room=<encoded room name>` (no router lib;
  `history.replaceState`).
- The header copy-link button copies
  `${location.origin}${location.pathname}?room=${encodeURIComponent(room.name)}`.
- Opening such a link pre-fills the room field in the Lobby; the user still types a
  name and clicks Join (no auto-join).

## Error handling

- Copy-link uses `navigator.clipboard.writeText`; on failure (older browser / no
  permission), fall back to selecting the text — keep it simple, no crash.
- `useParticipantStatus` must remove every listener it adds when the participant
  changes or the component unmounts (no stacking, matching the existing pattern).
- `toggleScreenShare`: if the user dismisses the screen picker, state is unchanged
  (existing behavior); native "Stop sharing" resets `screenTrack` to `null`.
- Network level may be `null` before the first measurement — `NetworkBars` renders
  a neutral state rather than erroring.

## Testing

- **Unit:** `gridColsForCount` (pure) — boundaries and the 0/1/2/4/9/10 cases.
- **Manual (two tabs):** dominant-speaker ring follows the talker; muting mic/camera
  in one tab shows the badge/overlay in the other; network bars render for everyone;
  killing wifi briefly shows the reconnecting banner then recovery; sharing your
  screen now shows a "You (screen)" tile locally and a tile remotely; the grid
  reflows for 1–5 participants; copy-link yields a URL that pre-fills the room.

## Build order (incremental, each runnable)

1. `gridColsForCount` + responsive grid (fix the layout first).
2. Move screen share into `useRoom`; render `LocalScreen` (fix screen preview).
3. `useParticipantStatus` + network-quality connect option + `NetworkBars`.
4. Mute/camera indicators (reuse the hook).
5. Active-speaker highlight (dominant-speaker option + ring).
6. Reconnecting banner.
7. Room header: count + copy-link; URL `?room=` prefill.
