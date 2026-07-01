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
import { StudioIconButton } from "./studio/StudioIconButton"
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
    <div className="flex items-center justify-center gap-2 border-t border-studio-border bg-studio-bg p-3">
      <StudioIconButton
        aria-label="Toggle microphone"
        variant={micOn ? "default" : "danger"}
        onClick={toggleMic}
      >
        {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
      </StudioIconButton>
      <StudioIconButton
        aria-label="Toggle camera"
        variant={camOn ? "default" : "danger"}
        onClick={toggleCam}
      >
        {camOn ? <VideoIcon className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
      </StudioIconButton>
      <StudioIconButton
        aria-label="Share screen"
        active={sharing}
        onClick={onToggleShare}
      >
        <MonitorUp className="h-4 w-4" />
      </StudioIconButton>
      <StudioIconButton
        aria-label="Toggle chat"
        active={chatOpen}
        onClick={onToggleChat}
      >
        <MessageSquare className="h-4 w-4" />
      </StudioIconButton>
      <StudioIconButton aria-label="Leave call" variant="danger" onClick={onLeave}>
        <PhoneOff className="h-4 w-4" />
      </StudioIconButton>
    </div>
  )
}
