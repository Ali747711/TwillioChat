import { useEffect, useRef } from "react"
import { MicOff, VideoOff } from "lucide-react"
import type { RemoteParticipant, RemoteTrack } from "twilio-video"
import { useNetworkLevel } from "@/hooks/useNetworkLevel"
import { parseIdentity } from "@/lib/interview"
import { useRemoteMediaState } from "@/hooks/useRemoteMediaState"
import { NetworkBars } from "./NetworkBars"

interface ParticipantProps {
  participant: RemoteParticipant
  isDominant: boolean
}

export function Participant({ participant, isDominant }: ParticipantProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const networkLevel = useNetworkLevel(participant)
  const displayName = parseIdentity(participant.identity).name
  const { audioEnabled, videoEnabled } = useRemoteMediaState(participant)

  useEffect(() => {
    const attach = (track: RemoteTrack) => {
      if (track.kind === "video" && videoRef.current) {
        track.attach(videoRef.current)
      } else if (track.kind === "audio" && audioRef.current) {
        track.attach(audioRef.current)
      }
    }
    const detach = (track: RemoteTrack) => {
      if (track.kind === "video" || track.kind === "audio") {
        track.detach().forEach((el) => el.remove())
      }
    }

    participant.tracks.forEach((pub) => {
      if (pub.track) attach(pub.track)
    })
    participant.on("trackSubscribed", attach)
    participant.on("trackUnsubscribed", detach)
    return () => {
      participant.removeListener("trackSubscribed", attach)
      participant.removeListener("trackUnsubscribed", detach)
    }
  }, [participant])

  return (
    <div
      className={`relative aspect-video overflow-hidden rounded-2xl border-[3px] bg-pop-brown/60 transition-colors duration-200 ${
        isDominant
          ? "border-pop-yellow shadow-[0_0_0_4px_var(--color-pop-yellow)]"
          : "border-pop-cream/15"
      }`}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="h-full w-full object-cover"
      />
      <audio ref={audioRef} autoPlay />
      {!videoEnabled && (
        <div className="absolute inset-0 flex items-center justify-center font-pop text-sm font-semibold text-pop-cream/60">
          {displayName}
        </div>
      )}
      <span className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-full border border-pop-cream/15 bg-pop-brown/85 px-2.5 py-1 font-pop text-xs font-semibold text-pop-cream">
        {!audioEnabled && <MicOff className="h-3 w-3 text-pop-orange" />}
        {displayName}
      </span>
      <div className="absolute top-2 right-2 flex items-center gap-1.5 rounded-full border border-pop-cream/15 bg-pop-brown/85 px-2 py-1">
        {!videoEnabled && <VideoOff className="h-3 w-3 text-pop-orange" />}
        <NetworkBars level={networkLevel} />
      </div>
    </div>
  )
}
