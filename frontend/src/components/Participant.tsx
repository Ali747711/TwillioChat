import { useEffect, useRef, useState } from "react"
import type { RemoteParticipant, RemoteTrack } from "twilio-video"

interface ParticipantProps {
  participant: RemoteParticipant
}

export function Participant({ participant }: ParticipantProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [hasVideo, setHasVideo] = useState(false)

  useEffect(() => {
    const attach = (track: RemoteTrack) => {
      if (track.kind === "video" && videoRef.current) {
        track.attach(videoRef.current)
        setHasVideo(true)
      } else if (track.kind === "audio" && audioRef.current) {
        track.attach(audioRef.current)
      }
    }
    const detach = (track: RemoteTrack) => {
      if (track.kind === "video") setHasVideo(false)
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
    <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="h-full w-full object-cover"
      />
      <audio ref={audioRef} autoPlay />
      {!hasVideo && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          {participant.identity}
        </div>
      )}
      <span className="absolute bottom-1 left-1 rounded bg-black/50 px-1.5 py-0.5 text-xs text-white">
        {participant.identity}
      </span>
    </div>
  )
}
