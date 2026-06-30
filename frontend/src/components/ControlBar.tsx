import { useState } from "react"
import {
  MessageSquare,
  Mic,
  MicOff,
  MonitorUp,
  PhoneOff,
  Video as VideoIcon,
  VideoOff,
} from "lucide-react"
import type { Room } from "twilio-video"
import { Button } from "@/components/ui/button"
import { setAudioEnabled, setVideoEnabled } from "@/lib/localMedia"

interface ControlBarProps {
  room: Room
  chatOpen: boolean
  sharing: boolean
  onToggleChat: () => void
  onToggleShare: () => void
  onLeave: () => void
}

export function ControlBar({
  room,
  chatOpen,
  sharing,
  onToggleChat,
  onToggleShare,
  onLeave,
}: ControlBarProps) {
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)

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
        onClick={onToggleShare}
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
