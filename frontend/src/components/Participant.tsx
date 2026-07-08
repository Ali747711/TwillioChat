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
      className={`relative aspect-video overflow-hidden rounded-none border bg-studio-bg ${
        isDominant ? "border-studio-orange ring-2 ring-studio-orange" : "border-studio-border"
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
        <div className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold uppercase tracking-[0.15em] text-studio-muted">
          {displayName}
        </div>
      )}
      <span className="absolute bottom-1 left-1 flex items-center gap-1 bg-black/60 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-white">
        {!audioEnabled && <MicOff className="h-3 w-3 text-studio-orange" />}
        {displayName}
      </span>
      <div className="absolute top-1 right-1 flex items-center gap-1 bg-black/60 px-1 py-0.5">
        {!videoEnabled && <VideoOff className="h-3 w-3 text-studio-orange" />}
        <NetworkBars level={networkLevel} />
      </div>
    </div>
  )
}
