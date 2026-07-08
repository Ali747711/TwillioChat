import { useEffect, useRef } from "react"
import type { Room } from "twilio-video"
import { useNetworkLevel } from "@/hooks/useNetworkLevel"
import { parseIdentity } from "@/lib/interview"
import { NetworkBars } from "./NetworkBars"

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
        el.className = "h-full w-full object-cover"
        container.appendChild(el)
        elements.push(el)
      }
    })
    return () => {
      elements.forEach((el) => el.remove())
    }
  }, [room])

  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl border-[3px] border-pop-cream/15 bg-pop-brown/60">
      <div ref={containerRef} className="h-full w-full" />
      <span className="absolute bottom-2 left-2 rounded-full border border-pop-cream/15 bg-pop-brown/85 px-2.5 py-1 font-pop text-xs font-semibold text-pop-cream">
        {parseIdentity(identity).name} (you)
      </span>
      <div className="absolute top-2 right-2 rounded-full border border-pop-cream/15 bg-pop-brown/85 px-2 py-1">
        <NetworkBars level={networkLevel} />
      </div>
    </div>
  )
}
