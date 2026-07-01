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
      className="absolute left-1/2 top-1/2 w-[70%] max-w-[480px] -translate-x-1/2 -translate-y-[30%] rotate-[-2deg] opacity-80 pointer-events-none"
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

// Service tags separated by orange slashes
const SERVICE_TAGS = ['VIDEO', 'SCREEN SHARE', 'CHAT'] as const

export function StudioHero() {
  return (
    <section className="px-6 pb-0 pt-28 md:pt-32">
      {/* Framed container */}
      <div className="relative mx-auto w-full max-w-6xl border border-studio-border bg-studio-bg/80 p-8 backdrop-blur-sm md:p-12">
        {/* Corner markers */}
        <Corner position="tl" />
        <Corner position="tr" />
        <Corner position="bl" />
        <Corner position="br" />

        {/* Top row meta */}
        <div className="mb-8 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-studio-muted">
            (EST. 2026)
          </span>
          {/* Status glyph — outlined circle with inner orange dot */}
          <span aria-label="System live" className="flex items-center gap-2">
            <span className="flex h-3 w-3 items-center justify-center rounded-full border border-studio-border">
              <span className="h-1.5 w-1.5 rounded-full bg-studio-orange" />
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-studio-muted">
              LIVE
            </span>
          </span>
        </div>

        {/* Display wordmark + signature overlay */}
        <div className="relative mb-8 text-center">
          <h1
            className="relative z-10 font-extrabold uppercase leading-none tracking-[-0.04em] text-white"
            style={{ fontSize: 'clamp(48px, 8vw, 110px)' }}
          >
            TWILIOMEET®
          </h1>
          {/* Original squiggle signature — hand-authored path */}
          <SignatureStroke />
        </div>

        {/* Product copy + CTA row */}
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:items-end md:justify-between md:text-left">
          <p className="max-w-md text-base leading-relaxed text-studio-muted">
            Instant video rooms. Share your screen without setup. Built-in chat
            that keeps the thread after the call ends.
          </p>
          <StudioButton
            onClick={() => { window.location.href = '/app' }}
            className="shrink-0"
          >
            Launch App
          </StudioButton>
        </div>

        {/* Service loop footer */}
        <div className="mt-10 flex items-center gap-3 border-t border-studio-border pt-6">
          {SERVICE_TAGS.map((tag, i) => (
            <span key={tag} className="flex items-center gap-3">
              {i > 0 && (
                <span className="text-studio-orange" aria-hidden>
                  /
                </span>
              )}
              <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-studio-muted">
                {tag}
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
