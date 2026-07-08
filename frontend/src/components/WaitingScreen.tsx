import { useEffect, useRef } from "react"
import { motion } from "motion/react"
import type { LocalVideoTrack } from "twilio-video"
import { PopButton } from "./pop/PopButton"
import { ShapeAccent } from "./pop/ShapeAccent"
import { popContainer, popItem } from "./pop/motion"

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
    <main className="relative flex min-h-svh flex-col items-center justify-center gap-6 overflow-hidden bg-pop-orange p-6 font-sans text-pop-brown">
      <ShapeAccent kind="blob" tone="cream" size={110} className="left-[6%] top-[10%] hidden sm:block" />
      <ShapeAccent kind="circle" tone="yellow" size={70} delay={0.8} className="bottom-[12%] right-[8%] hidden sm:block" />

      <motion.div
        variants={popContainer}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-md"
      >
        <motion.div
          variants={popItem}
          className="relative aspect-video overflow-hidden rounded-3xl border-[3px] border-pop-brown bg-pop-brown shadow-[8px_8px_0_0_var(--color-pop-brown)]"
        >
          <div ref={containerRef} className="h-full w-full" />
          {!previewTrack && (
            <div className="absolute inset-0 flex items-center justify-center text-sm font-bold uppercase tracking-[0.15em] text-pop-cream/70">
              {identityName} (audio-only)
            </div>
          )}
          <span className="absolute bottom-3 left-3 rounded-full border-2 border-pop-cream/40 bg-pop-brown/80 px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] text-pop-cream">
            {identityName} (you)
          </span>
        </motion.div>

        <motion.div
          variants={popItem}
          className="mt-6 flex items-center justify-between gap-4 rounded-full border-[3px] border-pop-brown bg-pop-cream px-5 py-3 shadow-[6px_6px_0_0_var(--color-pop-brown)]"
        >
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-pop-orange" />
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-pop-brown/80">
              Waiting for the interviewer to admit you…
            </span>
          </div>
          <PopButton size="md" className="px-4 py-2 text-xs" onClick={onLeave}>
            Leave
          </PopButton>
        </motion.div>
      </motion.div>
    </main>
  )
}
