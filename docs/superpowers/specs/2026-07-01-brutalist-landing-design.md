# Neo-Brutalist Landing Redesign — Design

**Date:** 2026-07-01
**Status:** Approved design, ready for implementation planning
**Replaces:** the RIVR landing (`docs/superpowers/specs/` RIVR work) at `/`.

## Purpose

Replace the RIVR glassmorphism landing with a neo-brutalist "luxury tech
editorial" aesthetic (recreated from a supplied Mattis-style design-system brief,
not copied), themed to the video-call product. The call app at `/app` is
untouched. Learning-focused, product-marketing landing.

## Scope

### In scope
- Delete the RIVR landing components (`Hero`, `Navbar`, `HeroBadge`,
  `BottomLeftCard`, `BottomRightCorner`) and revert the Helvetica `@font-face`
  added for RIVR (brutalist uses the grotesque system/Inter font already loaded).
- New brutalist landing at `/` with: fixed header, framed hero, split metric bar,
  and a features section.
- Wordmark: **TwilioMeet®**.
- CTA(s) navigate to `/app`.

### Out of scope
- Pricing/accordion matrix and contact-form footer from the full brief (a free
  demo app doesn't need them).
- Any change to the call app (`App.tsx`, hooks, lib, Room/Lobby/etc., `ui/`).
- `Root.tsx` routing (unchanged: `/` → Landing, `/app` → call app).

## Design System (recreated, original implementation)

**Palette** (added to `index.css` `@theme` as scoped tokens; shadcn tokens
untouched):
- `--color-studio-bg: #0D0D0D`
- `--color-studio-border: #222222`
- `--color-studio-muted: #999999`
- `--color-studio-orange: #FF3B00`
- White `#FFFFFF` for primary type.

**Typography** (system/Inter grotesque, already loaded):
- Display wordmark: `clamp(48px, 8vw, 110px)`, weight 800, uppercase,
  `letter-spacing: -0.04em`.
- Section headers: `clamp(28px, 4vw, 48px)`, weight 700, uppercase, `-0.02em`.
- Body: 16px / line-height 1.5 / muted.
- Micro meta tags: 11px, weight 600, uppercase, `letter-spacing: 0.15em`.

**Motifs:** hard edges (`rounded-none`), explicit 1px borders (`#222222`), 8px
spacing rhythm (`gap-2`/`gap-4`, `p-6`/`p-8`, section `py-24`–`py-32`), instant
color-swap hovers (no easing).

**Film grain + dark background are SCOPED to the landing**, not applied to global
`body` — otherwise they would sit over the video call at `/app`. Implemented as a
fixed overlay element rendered inside `Landing`.

## Components (new, under `src/components/studio/`)

- `GrainOverlay.tsx` — a `position: fixed`, `pointer-events-none`, low-opacity
  SVG fractal-noise overlay, scoped to the landing (rendered by `Landing`).
- `StudioButton.tsx` — the primary action: solid `#FF3B00`, black uppercase bold
  text, `rounded-none`, inverts to white background on hover (instant). Accepts
  an `onClick`/`href`; the header + hero CTAs use it to go to `/app`.
- `StudioHeader.tsx` — fixed top bar: `TwilioMeet®` wordmark (left), inline nav
  labels separated by `/` glyphs (center, hidden on mobile), `StudioButton`
  "START A CALL" (right) → `/app`.
- `StudioHero.tsx` — framed container (`border border-studio-border`, subtle
  backdrop) with:
  - four corner vector markers (small L-shaped SVG/border brackets),
  - an `(EST. 2026)` micro tag and a small circular status glyph,
  - the oversized uppercase `TWILIOMEET®` display wordmark,
  - a copy block (original product copy),
  - an **original** orange handwritten-style SVG stroke overlay slicing the text
    (drawn for this project; not copied from any source),
  - an inline service loop footer: `VIDEO / SCREEN SHARE / CHAT`,
  - a hero `StudioButton` → `/app`.
- `MetricBar.tsx` — split bar pinned under the hero: left `SLOTS LEFT: 2`
  (static, with an orange tally glyph), right `LOCAL TIME: HH:MM:SS` that ticks
  live.
- `FeaturesSection.tsx` — three brutalist data-rows, each a full-bleed bordered
  row: `01 / VIDEO ROOMS`, `02 / SCREEN SHARE`, `03 / LIVE CHAT`, with a muted
  one-line description; labels expand full-bleed on desktop, stack on mobile.

**Modified:**
- `src/Landing.tsx` — compose the above; wrap in the scoped dark background +
  `GrainOverlay`; remove the `font-helvetica` class (use default Inter).
- `src/index.css` — add the four `--color-studio-*` tokens to the existing
  `@theme` block; **remove** the RIVR `@font-face` and `--font-helvetica` token.

## Navigation into the app

Both CTAs (`StudioButton` in header and hero) navigate to `/app` via
`window.location.href = '/app'` (full navigation; Vite's SPA fallback serves the
app, `Root` renders it). This finally gives the landing a path into the product.

## Live clock

`lib/clock.ts` exports a pure `formatClock(date: Date): string` → `HH:MM:SS`
(zero-padded, 24h). `MetricBar` uses `useEffect` + `setInterval(1000)` to update
`new Date()` and renders `formatClock`. The interval is cleared on unmount.

## Error handling / edge cases

- `StudioButton` used as a link still works if JS mis-fires: it's a real
  `<button>` with an `onClick` navigation; keyboard-focusable.
- Grain overlay is `pointer-events-none` so it never blocks clicks.
- The live clock cleans up its interval on unmount (no leak).

## Testing

- **Unit:** `formatClock` — pads hours/minutes/seconds, handles midnight/noon.
- **Manual (preview screenshots):** landing renders in the brutalist style at
  mobile + desktop widths; header/hero CTAs navigate to `/app`; the call app at
  `/app` is unchanged; the live clock ticks.

## Build order (incremental)

1. Tokens + `index.css` cleanup (remove Helvetica) + `GrainOverlay` + scoped
   `Landing` shell (dark bg, grain) — delete RIVR components.
2. `StudioButton` + `StudioHeader` (with `/app` navigation).
3. `StudioHero` (frame, corner markers, wordmark, signature stroke, service loop).
4. `formatClock` (unit-tested) + `MetricBar` with live time.
5. `FeaturesSection` (three data rows).
6. Final compose in `Landing`; verify build/test/lint + preview both routes.
