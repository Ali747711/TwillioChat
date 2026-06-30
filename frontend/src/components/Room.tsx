import { useState } from "react"
import type {
  LocalVideoTrack,
  RemoteParticipant,
  Room as TwilioRoom,
} from "twilio-video"
import { Link as LinkIcon } from "lucide-react"
import type { ChatMessage, ConnectionState } from "@/hooks/useRoom"
import { Button } from "@/components/ui/button"
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
    <div className="flex h-svh flex-col">
      <header className="flex items-center justify-between border-b px-4 py-2">
        <div className="text-sm">
          <span className="font-medium">{room.name}</span>
          <span className="ml-2 text-muted-foreground">
            {participants.length + 1} in call
          </span>
        </div>
        <Button variant="secondary" size="sm" onClick={copyLink}>
          <LinkIcon className="mr-1 h-4 w-4" />
          {copied ? "Copied!" : "Copy link"}
        </Button>
      </header>
      {connectionState === "reconnecting" && (
        <div className="bg-yellow-500/90 py-1 text-center text-sm text-black">
          Reconnecting…
        </div>
      )}
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
          <aside className="w-80 border-l">
            <ChatPanel
              messages={messages}
              identity={identity}
              onSend={onSend}
            />
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
