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
    <div className="relative aspect-video overflow-hidden rounded-none border border-studio-border bg-studio-bg">
      <div ref={containerRef} className="h-full w-full" />
      <span className="absolute bottom-1 left-1 bg-black/60 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-white">
        You (screen)
      </span>
    </div>
  )
}
