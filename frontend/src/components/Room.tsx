import { useState } from "react"
import { Link as LinkIcon } from "lucide-react"
import type {
  LocalVideoTrack,
  RemoteParticipant,
  Room as TwilioRoom,
} from "twilio-video"
import type { ChatMessage, ConnectionState } from "@/hooks/useRoom"
import { StudioButton } from "./studio/StudioButton"
import { ChatPanel } from "./ChatPanel"
import { ControlBar } from "./ControlBar"
import { ParticipantGrid } from "./ParticipantGrid"

interface RoomProps {
  room: TwilioRoom
  identity: string
  participants: RemoteParticipant[]
  messages: ChatMessage[]
  screenTrack: LocalVideoTrack | null
  dominantSpeakerSid: string | null
  connectionState: ConnectionState
  onSend: (text: string) => void
  onToggleShare: () => void
  onLeave: () => void
}

export function Room({
  room,
  identity,
  participants,
  messages,
  screenTrack,
  dominantSpeakerSid,
  connectionState,
  onSend,
  onToggleShare,
  onLeave,
}: RoomProps) {
  const [chatOpen, setChatOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyLink = async () => {
    const link = `${location.origin}${location.pathname}?room=${encodeURIComponent(room.name)}`
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard unavailable (e.g. insecure context); ignore.
    }
  }

  return (
    <div className="flex h-svh flex-col bg-studio-bg text-white">
      {connectionState === "reconnecting" && (
        <div className="bg-studio-orange py-1 text-center text-[11px] font-semibold uppercase tracking-[0.15em] text-black">
          Reconnecting…
        </div>
      )}
      <header className="flex items-center justify-between border-b border-studio-border px-4 py-3">
        <div className="flex items-baseline gap-3">
          <span className="text-sm font-bold uppercase tracking-[-0.02em]">
            {room.name}
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-studio-muted">
            {participants.length + 1} in call
          </span>
        </div>
        <StudioButton className="px-3 py-2" onClick={copyLink}>
          <span className="flex items-center gap-1">
            <LinkIcon className="h-3 w-3" />
            {copied ? "Copied!" : "Copy link"}
          </span>
        </StudioButton>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto p-4">
          <ParticipantGrid
            room={room}
            identity={identity}
            participants={participants}
            screenTrack={screenTrack}
            dominantSpeakerSid={dominantSpeakerSid}
          />
        </div>
        {chatOpen && (
          <aside className="w-80 border-l border-studio-border">
            <ChatPanel messages={messages} identity={identity} onSend={onSend} />
          </aside>
        )}
      </div>
      <ControlBar
        room={room}
        chatOpen={chatOpen}
        sharing={screenTrack !== null}
        onToggleChat={() => setChatOpen((open) => !open)}
        onToggleShare={onToggleShare}
        onLeave={onLeave}
      />
    </div>
  )
}
