import { useEffect, useRef } from "react"
import type { LocalVideoTrack } from "twilio-video"

interface LocalScreenProps {
  track: LocalVideoTrack
}

export function LocalScreen({ track }: LocalScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const el = track.attach()
    el.className = "h-full w-full bg-black object-contain"
    container.appendChild(el)
    return () => {
      el.remove()
    }
  }, [track])

  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl border-[3px] border-pop-cream/15 bg-pop-brown/60">
      <div ref={containerRef} className="h-full w-full" />
      <span className="absolute bottom-2 left-2 rounded-full border border-pop-cream/15 bg-pop-brown/85 px-2.5 py-1 font-pop text-xs font-semibold text-pop-cream">
        You (screen)
      </span>
    </div>
  )
}
