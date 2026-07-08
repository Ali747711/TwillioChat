import { useEffect, useRef } from "react"
import type { LocalVideoTrack } from "twilio-video"
import { GrainOverlay } from "./studio/GrainOverlay"
import { StudioButton } from "./studio/StudioButton"

interface WaitingScreenProps {
  identityName: string
  previewTrack: LocalVideoTrack | null
  onLeave: () => void
}

// The candidate's holding room: they are connected to the interview but
// publish nothing. Their camera renders locally from the unpublished preview
// track so they can check their framing while they wait.
export function WaitingScreen({
  identityName,
  previewTrack,
  onLeave,
}: WaitingScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || !previewTrack) return
    const el = previewTrack.attach()
    el.className = "h-full w-full object-cover"
    container.appendChild(el)
    return () => {
      previewTrack.detach(el)
      el.remove()
    }
  }, [previewTrack])

  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center gap-6 bg-studio-bg p-6 text-white">
      <GrainOverlay />
      <div className="relative z-10 w-full max-w-md">
        <div className="relative aspect-video overflow-hidden rounded-none border border-studio-border bg-studio-bg">
          <div ref={containerRef} className="h-full w-full" />
          {!previewTrack && (
            <div className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold uppercase tracking-[0.15em] text-studio-muted">
              {identityName} (audio-only)
            </div>
          )}
          <span className="absolute bottom-1 left-1 bg-black/60 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-white">
            {identityName} (you)
          </span>
        </div>
        <div className="mt-6 flex items-center justify-between border border-studio-border p-4">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 animate-pulse rounded-full bg-studio-orange" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-studio-muted">
              Waiting for the interviewer to admit you…
            </span>
          </div>
          <StudioButton className="px-3 py-2" onClick={onLeave}>
            Leave
          </StudioButton>
        </div>
      </div>
    </main>
  )
}
