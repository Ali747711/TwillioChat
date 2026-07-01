# Neo-Brutalist Landing Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the RIVR landing at `/` with a neo-brutalist, product-themed (TwilioMeet®) landing — fixed header, framed hero, live metric bar, and three feature rows — with both CTAs launching the call app at `/app`.

**Architecture:** New brutalist components under `src/components/studio/`, composed by `Landing.tsx`. Dark background + film-grain are scoped to the landing (not global `body`) so `/app` is untouched. Design tokens added to the existing `@theme` in `index.css` alongside shadcn's. Only one dynamic piece (a live clock) — its formatting is a pure, unit-tested helper.

**Tech Stack:** React 19, Vite, Tailwind v4 (CSS-first `@theme`), lucide-react, Vitest.

**Conventions:**
- Run npm/git from `/Users/mac/Desktop/Projects/twilio/frontend`.
- Type-check with `npm run build` (NOT `npm run typecheck`).
- Per-task gate before commit: `npm run build && npm test && npm run lint` all pass.
- Type-only imports use `import type` (`verbatimModuleSyntax` on). No enums. A formatter hook may reformat after edits.
- **Design intent:** recreate the aesthetic with taste — do NOT clone any third-party site. Use the tokens/type scale below; exact markup is yours within that system. Write all product copy fresh; do not reproduce any third-party brand's text or assets.
- **All studio components use named exports** (e.g. `export function StudioHeader`) to match the named imports in `Landing.tsx`.
- **Do NOT touch the call app:** `App.tsx`, `hooks/*`, `lib/twilioClient.ts`, `lib/localMedia.ts`, `lib/grid.ts`, `Room/Lobby/Participant/LocalVideo/LocalScreen/ParticipantGrid/ControlBar/ChatPanel/NetworkBars/theme-provider`, `components/ui/*`, `Root.tsx`, `main.tsx`.

## Design tokens (reference for all tasks)

| Token (Tailwind v4) | Value | Utilities |
|---|---|---|
| `--color-studio-bg` | `#0D0D0D` | `bg-studio-bg` |
| `--color-studio-border` | `#222222` | `border-studio-border` |
| `--color-studio-muted` | `#999999` | `text-studio-muted` |
| `--color-studio-orange` | `#FF3B00` | `bg-studio-orange`, `text-studio-orange` |

Type scale: display `clamp(48px,8vw,110px)` weight 800 uppercase `tracking-[-0.04em]`; section header `clamp(28px,4vw,48px)` weight 700 uppercase `tracking-[-0.02em]`; body `text-base leading-relaxed text-studio-muted`; micro tag `text-[11px] font-semibold uppercase tracking-[0.15em]`. Hard edges (`rounded-none`), 1px `border-studio-border`, instant hovers (`transition-colors duration-200`).

---

## File Structure

```
frontend/src/
  lib/clock.ts            (new) formatClock(date) → "HH:MM:SS" (pure)
  lib/clock.test.ts       (new) unit tests
  components/studio/
    GrainOverlay.tsx      (new) fixed low-opacity noise overlay, scoped
    StudioButton.tsx      (new) orange→white square CTA
    StudioHeader.tsx      (new) fixed top bar; CTA → /app
    StudioHero.tsx        (new) framed hero: corners, wordmark, signature, loop
    MetricBar.tsx         (new) SLOTS LEFT + live LOCAL TIME
    FeaturesSection.tsx   (new) three bordered data rows
  Landing.tsx             (modify) compose brutalist page; drop font-helvetica
  index.css               (modify) add studio tokens; remove RIVR Helvetica
  components/Hero.tsx, Navbar.tsx, HeroBadge.tsx, BottomLeftCard.tsx,
    BottomRightCorner.tsx (DELETE)
```

---

## Task 1: Tokens, cleanup, grain overlay, landing shell

**Files:** modify `src/index.css`; delete 5 RIVR components; create `src/components/studio/GrainOverlay.tsx`; modify `src/Landing.tsx`.

- [ ] **Step 1: Edit `src/index.css`** — remove the RIVR Helvetica `@font-face` block entirely (the `@font-face { font-family: "Helvetica Regular"; … }` block near the top), and remove the `--font-helvetica: …;` line inside `@theme inline`. Then, inside the same `@theme inline { … }` block, add the four studio tokens:
```css
    --color-studio-bg: #0D0D0D;
    --color-studio-border: #222222;
    --color-studio-muted: #999999;
    --color-studio-orange: #FF3B00;
```
Do not touch any other `@theme`/`:root`/`.dark`/`@layer base` content.

- [ ] **Step 2: Delete the RIVR components**
```bash
git rm src/components/Hero.tsx src/components/Navbar.tsx src/components/HeroBadge.tsx src/components/BottomLeftCard.tsx src/components/BottomRightCorner.tsx
```

- [ ] **Step 3: Create `src/components/studio/GrainOverlay.tsx`** — a fixed, non-interactive film-grain layer (fractal-noise SVG, standard technique):
```tsx
// Fixed, pointer-events-none film-grain layer. Scoped to the landing (rendered
// by Landing), so it never overlays the call app at /app.
export function GrainOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-50 opacity-[0.05]"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      }}
    />
  )
}
```

- [ ] **Step 4: Replace `src/Landing.tsx`** with a temporary shell (full page composed in Task 6):
```tsx
import { GrainOverlay } from './components/studio/GrainOverlay'

export default function Landing() {
  return (
    <main className="relative min-h-screen bg-studio-bg text-white">
      <GrainOverlay />
      <div className="px-6 py-24 text-center text-studio-muted">
        TwilioMeet® — landing under construction
      </div>
    </main>
  )
}
```

- [ ] **Step 5: Verify** — `npm run build && npm test && npm run lint` all pass (no dangling imports to the deleted components).

- [ ] **Step 6: Commit**
```bash
git add -A
git commit -m "feat(landing): studio tokens, grain overlay, remove RIVR landing"
```

---

## Task 2: StudioButton + StudioHeader

**Files:** create `src/components/studio/StudioButton.tsx`, `src/components/studio/StudioHeader.tsx`.

- [ ] **Step 1: Create `StudioButton.tsx`** — the primary CTA primitive:
```tsx
import type { ReactNode } from 'react'

interface StudioButtonProps {
  children: ReactNode
  onClick?: () => void
  className?: string
}

// Solid safety-orange, black uppercase bold, square edges; inverts to white
// instantly on hover.
export function StudioButton({ children, onClick, className = '' }: StudioButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-none bg-studio-orange px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] text-black transition-colors duration-200 hover:bg-white ${className}`}
    >
      {children}
    </button>
  )
}
```

- [ ] **Step 2: Create `StudioHeader.tsx`** — a fixed top bar. Requirements (exact markup is yours within the tokens):
  - `fixed top-0 inset-x-0 z-40`, `flex items-center justify-between`, `border-b border-studio-border`, `px-6 py-4`, background `bg-studio-bg`.
  - Left: wordmark `TwilioMeet®` — bold, uppercase, `tracking-[-0.02em]`, white.
  - Center (hidden below `md`): nav labels `WORKS`, `PROCESS`, `PRICING`, `CONTACT` as `text-[11px] font-semibold uppercase tracking-[0.15em] text-studio-muted`, separated by `/` glyphs in `text-studio-orange`; each label `hover:text-white transition-colors`. These are decorative anchors (`href="#"`), not routes.
  - Right: `<StudioButton onClick={() => { window.location.href = '/app' }}>Start a Call</StudioButton>`.

- [ ] **Step 3: Verify** — `npm run build && npm test && npm run lint`.

- [ ] **Step 4: Commit**
```bash
git add src/components/studio/StudioButton.tsx src/components/studio/StudioHeader.tsx
git commit -m "feat(landing): studio button + fixed header with launch CTA"
```

---

## Task 3: StudioHero

**Files:** create `src/components/studio/StudioHero.tsx`.

- [ ] **Step 1: Create `StudioHero.tsx`.** Requirements (recreate the aesthetic; markup is yours):
  - Outer: centered, generous top padding to clear the fixed header (`pt-28`+), `px-6`.
  - Framed container: `relative w-full max-w-6xl mx-auto border border-studio-border bg-studio-bg/80 p-8 md:p-12 backdrop-blur-sm`.
  - **Four corner markers**: small L-shaped brackets at each corner of the frame (absolutely positioned `div`s using two `border-studio-orange` edges, ~16–20px). Purely decorative.
  - Top row inside the frame: left micro tag `(EST. 2026)`; right a small circular status glyph (an outlined circle, `border-studio-border`, ~12px, with an orange dot).
  - Display wordmark: `TWILIOMEET®` at the display type scale (`clamp(48px,8vw,110px)`, weight 800, uppercase, `tracking-[-0.04em]`, white), centered.
  - **Signature overlay**: an ORIGINAL orange handwritten-style stroke drawn as an inline `<svg>` (a single freehand `path` in `stroke-[color:var(--color-studio-orange)]`, ~2–3px stroke, no fill), absolutely positioned to slice across/under the wordmark at a slight rotation. Do not copy any existing signature — hand-author a simple squiggle path.
  - Copy block: 1–2 sentences of original product copy about video calls (e.g. rooms, screen share, chat — no marketing clichés), `text-studio-muted`, `max-w-md`.
  - A hero `<StudioButton onClick={() => { window.location.href = '/app' }}>Launch App</StudioButton>`.
  - Service loop footer (inside the frame, bottom): `VIDEO / SCREEN SHARE / CHAT` as micro tags separated by orange `/`.
  - Import `StudioButton` from `./StudioButton`.

- [ ] **Step 2: Verify** — `npm run build && npm test && npm run lint`.

- [ ] **Step 3: Commit**
```bash
git add src/components/studio/StudioHero.tsx
git commit -m "feat(landing): framed brutalist hero with signature overlay"
```

---

## Task 4: Live metric bar (TDD helper)

**Files:** create `src/lib/clock.ts`, `src/lib/clock.test.ts`, `src/components/studio/MetricBar.tsx`.

- [ ] **Step 1: Write the failing test** — `src/lib/clock.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { formatClock } from './clock'

describe('formatClock', () => {
  it('zero-pads single digits', () =>
    expect(formatClock(new Date(2026, 0, 1, 9, 5, 3))).toBe('09:05:03'))
  it('handles midnight', () =>
    expect(formatClock(new Date(2026, 0, 1, 0, 0, 0))).toBe('00:00:00'))
  it('uses 24-hour time', () =>
    expect(formatClock(new Date(2026, 0, 1, 13, 7, 42))).toBe('13:07:42'))
})
```

- [ ] **Step 2: Run it, confirm FAIL** — `npx vitest run src/lib/clock.test.ts` (module not found).

- [ ] **Step 3: Implement `src/lib/clock.ts`:**
```ts
// Format a Date as zero-padded 24-hour HH:MM:SS (local time).
export function formatClock(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}
```

- [ ] **Step 4: Run it, confirm PASS** — `npx vitest run src/lib/clock.test.ts` (3 tests).

- [ ] **Step 5: Create `MetricBar.tsx`:**
```tsx
import { useEffect, useState } from 'react'
import { formatClock } from '@/lib/clock'

// Split metric bar: static slots-left on the left, a live local clock on the
// right. The interval is cleared on unmount.
export function MetricBar() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const tag = 'text-[11px] font-semibold uppercase tracking-[0.15em] text-studio-muted'

  return (
    <div className="flex items-center justify-between border-t border-studio-border px-6 py-3">
      <span className={tag}>
        SLOTS LEFT: <span className="text-studio-orange">|||||</span> 2
      </span>
      <span className={tag}>
        LOCAL TIME: <span className="text-white">{formatClock(now)}</span>
      </span>
    </div>
  )
}
```

- [ ] **Step 6: Verify** — `npm run build && npm test && npm run lint`.

- [ ] **Step 7: Commit**
```bash
git add src/lib/clock.ts src/lib/clock.test.ts src/components/studio/MetricBar.tsx
git commit -m "feat(landing): live metric bar with tested clock formatter"
```

---

## Task 5: Features section

**Files:** create `src/components/studio/FeaturesSection.tsx`.

- [ ] **Step 1: Create `FeaturesSection.tsx`.** Requirements:
  - A `<section className="border-t border-studio-border py-24 md:py-32">` wrapper with a section header at the display-section scale: `HOW IT WORKS` (or similar), uppercase.
  - Three data rows, each a full-bleed row with `border-b border-studio-border`, `py-6`, laid out `flex flex-col md:flex-row md:items-baseline gap-2 md:gap-8`:
    - a monospace-ish index `01` / `02` / `03` (`text-studio-orange font-bold`),
    - a title (`VIDEO ROOMS`, `SCREEN SHARE`, `LIVE CHAT`) uppercase bold white, expanding full-bleed on desktop,
    - a muted one-line description (original copy) `text-studio-muted md:ml-auto md:max-w-sm`.
  - Define the rows as a local array of `{ index, title, description }` and `.map` them (keys = `index`).

- [ ] **Step 2: Verify** — `npm run build && npm test && npm run lint`.

- [ ] **Step 3: Commit**
```bash
git add src/components/studio/FeaturesSection.tsx
git commit -m "feat(landing): brutalist feature rows"
```

---

## Task 6: Compose the landing + verify

**Files:** modify `src/Landing.tsx`.

- [ ] **Step 1: Replace `src/Landing.tsx`** with the full composition:
```tsx
import { GrainOverlay } from './components/studio/GrainOverlay'
import { StudioHeader } from './components/studio/StudioHeader'
import { StudioHero } from './components/studio/StudioHero'
import { MetricBar } from './components/studio/MetricBar'
import { FeaturesSection } from './components/studio/FeaturesSection'

export default function Landing() {
  return (
    <main className="relative min-h-screen bg-studio-bg text-white">
      <GrainOverlay />
      <StudioHeader />
      <StudioHero />
      <MetricBar />
      <FeaturesSection />
    </main>
  )
}
```

- [ ] **Step 2: Verify** — `npm run build && npm test && npm run lint` all pass.

- [ ] **Step 3: Commit**
```bash
git add src/Landing.tsx
git commit -m "feat(landing): compose neo-brutalist landing page"
```

- [ ] **Step 4: Manual (preview) check** — start a preview, confirm: the landing renders in the brutalist style (dark, orange accents, grain, framed hero, live clock ticking) at mobile + desktop widths; the header and hero CTAs navigate to `/app`; `/app` still renders the call app unchanged.

---

## Notes for the engineer

- **All studio components import tokens via Tailwind utilities** (`bg-studio-bg`, `text-studio-orange`, etc.) generated from the `@theme` tokens added in Task 1 — no hardcoded hex in components (except the grain data-URI).
- The grain and dark background are rendered by `Landing` only, so `/app` keeps its own shadcn theme.
- Keep original copy and the original signature stroke — do not reproduce third-party brand text or assets.
