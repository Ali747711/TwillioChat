import { StudioButton } from './StudioButton'

// Small L-bracket corner marker component — two edges, orange, ~18px
function Corner({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  const base = 'absolute w-[18px] h-[18px]'
  const styles: Record<typeof position, string> = {
    tl: 'top-0 left-0 border-t-2 border-l-2',
    tr: 'top-0 right-0 border-t-2 border-r-2',
    bl: 'bottom-0 left-0 border-b-2 border-l-2',
    br: 'bottom-0 right-0 border-b-2 border-r-2',
  }
  return (
    <div
      aria-hidden
      className={`${base} ${styles[position]} border-studio-orange`}
    />
  )
}

// Original hand-authored SVG signature stroke — a single freehand squiggle
// drawn for this project. Not copied from any source.
function SignatureStroke() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 420 60"
      xmlns="http://www.w3.org/2000/svg"
      className="pointer-events-none absolute bottom-[-6px] left-0 w-[65%] max-w-[440px] rotate-[-2deg] opacity-80"
      style={{ zIndex: 2 }}
    >
      <path
        d="M 12 38 C 40 10, 70 52, 105 28 C 135 8, 158 46, 195 30 C 228 16, 255 44, 295 22 C 330 4, 360 48, 408 26"
        fill="none"
        stroke="var(--color-studio-orange)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Capability tags separated by orange slashes
const SERVICE_TAGS = [
  'WAITING ROOM',
  'SCREEN SHARE',
  'LIVE CHAT',
  'PRIVATE NOTES',
] as const

export function StudioHero() {
  return (
    <section className="px-6 pb-0 pt-28 md:pt-32">
      {/* Framed container — a single left-aligned editorial column, so the
          eye travels meta → wordmark → pitch → CTA without dead air. */}
      <div className="relative mx-auto w-full max-w-6xl border border-studio-border bg-studio-bg/80 p-8 backdrop-blur-sm md:p-10">
        <Corner position="tl" />
        <Corner position="tr" />
        <Corner position="bl" />
        <Corner position="br" />

        {/* Meta row */}
        <div className="mb-6 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-studio-muted">
            (EST. 2026) — INTERVIEW SCREENING
          </span>
          <span aria-label="System live" className="flex items-center gap-2">
            <span className="flex h-3 w-3 items-center justify-center rounded-full border border-studio-border">
              <span className="h-1.5 w-1.5 rounded-full bg-studio-orange" />
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-studio-muted">
              LIVE
            </span>
          </span>
        </div>

        {/* Display wordmark, left-anchored, signature slicing beneath it */}
        <div className="relative mb-6">
          <h1
            className="relative z-10 font-extrabold uppercase leading-none tracking-[-0.04em] text-white"
            style={{ fontSize: 'clamp(44px, 7vw, 96px)' }}
          >
            TWILIOMEET®
          </h1>
          <SignatureStroke />
        </div>

        {/* Sub-headline anchors the niche */}
        <p
          className="mb-4 max-w-2xl font-bold uppercase leading-tight tracking-[-0.02em] text-white"
          style={{ fontSize: 'clamp(20px, 2.6vw, 32px)' }}
        >
          Video interviews with a real waiting room.
        </p>

        {/* Pitch + CTA kept together in one reading column */}
        <p className="mb-6 max-w-xl text-base leading-relaxed text-studio-muted">
          Send candidates a link. They hold in a lobby until you admit them —
          then it&apos;s screen share for live coding, chat for links, and a
          private notes panel for your decision. Nothing to install.
        </p>
        <div className="mb-8 flex flex-wrap items-center gap-4">
          <StudioButton
            onClick={() => {
              window.location.href = '/app'
            }}
          >
            Start an Interview
          </StudioButton>
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-studio-muted">
            No account · No download · Free demo
          </span>
        </div>

        {/* Capability loop — full-width rule, tags given real weight */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-studio-border pt-5">
          {SERVICE_TAGS.map((tag, i) => (
            <span key={tag} className="flex items-center gap-4">
              {i > 0 && (
                <span className="text-lg font-bold text-studio-orange" aria-hidden>
                  /
                </span>
              )}
              <span className="text-sm font-bold uppercase tracking-[0.1em] text-white md:text-base">
                {tag}
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
