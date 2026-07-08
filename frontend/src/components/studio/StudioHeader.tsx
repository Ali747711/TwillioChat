import { StudioButton } from "./StudioButton"

const NAV_ITEMS = ["WORKS", "PROCESS", "PRICING", "CONTACT"] as const

export function StudioHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-studio-border bg-studio-bg px-6 py-4">
      {/* Wordmark */}
      <span className="text-sm font-bold tracking-[-0.02em] text-white uppercase">
        TwilioMeet®
      </span>

      {/* Center nav — hidden on mobile */}
      <nav
        className="hidden items-center gap-3 md:flex"
        aria-label="Main navigation"
      >
        {NAV_ITEMS.map((label, i) => (
          <span key={label} className="flex items-center gap-3">
            {i > 0 && (
              <span className="text-studio-orange select-none" aria-hidden>
                /
              </span>
            )}
            <a
              href="#"
              className="text-[11px] font-semibold tracking-[0.15em] text-studio-muted uppercase transition-colors duration-200 hover:text-white"
            >
              {label}
            </a>
          </span>
        ))}
      </nav>

      {/* CTA */}
      <StudioButton
        onClick={() => {
          window.location.href = "/app"
        }}
      >
        Start an Interview
      </StudioButton>
    </header>
  )
}
