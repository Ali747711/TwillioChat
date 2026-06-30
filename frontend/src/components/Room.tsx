import { useState } from "react"
import type {
  LocalVideoTrack,
  RemoteParticipant,
  Room as TwilioRoom,
} from "twilio-video"
import type { ChatMessage } from "@/hooks/useRoom"
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
  onSend,
  onToggleShare,
  onLeave,
}: RoomProps) {
  const [chatOpen, setChatOpen] = useState(false)

  return (
    <div className="flex h-svh flex-col">
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
