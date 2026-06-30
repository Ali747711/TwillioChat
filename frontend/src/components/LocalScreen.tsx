import { useEffect, useRef } from 'react'
import type { LocalVideoTrack } from 'twilio-video'

interface LocalScreenProps {
  track: LocalVideoTrack
}

export function LocalScreen({ track }: LocalScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const el = track.attach()
    el.className = 'h-full w-full bg-black object-contain'
    container.appendChild(el)
    return () => {
      el.remove()
    }
  }, [track])

  return (
    <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
      <div ref={containerRef} className="h-full w-full" />
      <span className="absolute bottom-1 left-1 rounded bg-black/50 px-1.5 py-0.5 text-xs text-white">
        You (screen)
      </span>
    </div>
  )
}
