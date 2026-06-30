import { useRef, useState } from "react"
import {
  MessageSquare,
  Mic,
  MicOff,
  MonitorUp,
  PhoneOff,
  Video as VideoIcon,
  VideoOff,
} from "lucide-react"
import type { LocalVideoTrack, Room } from "twilio-video"
import { Button } from "@/components/ui/button"
import {
  setAudioEnabled,
  setVideoEnabled,
  startScreenShare,
  stopScreenShare,
} from "@/lib/localMedia"

interface ControlBarProps {
  room: Room
  chatOpen: boolean
  onToggleChat: () => void
  onLeave: () => void
}

export function ControlBar({
  room,
  chatOpen,
  onToggleChat,
  onLeave,
}: ControlBarProps) {
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [sharing, setSharing] = useState(false)
  const screenTrackRef = useRef<LocalVideoTrack | null>(null)

  const toggleMic = () => {
    const next = !micOn
    setAudioEnabled(room, next)
    setMicOn(next)
  }

  const toggleCam = () => {
    const next = !camOn
    setVideoEnabled(room, next)
    setCamOn(next)
  }

  const toggleShare = async () => {
    if (sharing && screenTrackRef.current) {
      stopScreenShare(room, screenTrackRef.current)
      screenTrackRef.current = null
      setSharing(false)
      return
    }
    try {
      const track = await startScreenShare(room)
      screenTrackRef.current = track
      setSharing(true)
      track.mediaStreamTrack.addEventListener(
        "ended",
        () => {
          if (screenTrackRef.current) {
            stopScreenShare(room, screenTrackRef.current)
            screenTrackRef.current = null
            setSharing(false)
          }
        },
        { once: true }
      )
    } catch {
      // User dismissed the screen-picker; leave state unchanged.
    }
  }

  return (
    <div className="flex items-center justify-center gap-2 border-t bg-background p-3">
      <Button
        variant={micOn ? "secondary" : "destructive"}
        size="icon"
        onClick={toggleMic}
      >
        {micOn ? <Mic /> : <MicOff />}
      </Button>
      <Button
        variant={camOn ? "secondary" : "destructive"}
        size="icon"
        onClick={toggleCam}
      >
        {camOn ? <VideoIcon /> : <VideoOff />}
      </Button>
      <Button
        variant={sharing ? "default" : "secondary"}
        size="icon"
        onClick={toggleShare}
      >
        <MonitorUp />
      </Button>
      <Button
        variant={chatOpen ? "default" : "secondary"}
        size="icon"
        onClick={onToggleChat}
      >
        <MessageSquare />
      </Button>
      <Button variant="destructive" size="icon" onClick={onLeave}>
        <PhoneOff />
      </Button>
    </div>
  )
}
