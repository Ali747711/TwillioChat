import { useEffect, useRef } from 'react'
import type { Room } from 'twilio-video'
import { useNetworkLevel } from '@/hooks/useNetworkLevel'
import { NetworkBars } from './NetworkBars'

interface LocalVideoProps {
  room: Room
  identity: string
}

export function LocalVideo({ room, identity }: LocalVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const networkLevel = useNetworkLevel(room.localParticipant)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const elements: HTMLElement[] = []
    room.localParticipant.videoTracks.forEach((pub) => {
      if (pub.track) {
        const el = pub.track.attach()
        el.className = 'h-full w-full object-cover'
        container.appendChild(el)
        elements.push(el)
      }
    })
    return () => {
      elements.forEach((el) => el.remove())
    }
  }, [room])

  return (
    <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
      <div ref={containerRef} className="h-full w-full" />
      <span className="absolute bottom-1 left-1 rounded bg-black/50 px-1.5 py-0.5 text-xs text-white">
        {identity} (you)
      </span>
      <div className="absolute top-1 right-1 rounded bg-black/50 px-1 py-0.5">
        <NetworkBars level={networkLevel} />
      </div>
    </div>
  )
}
