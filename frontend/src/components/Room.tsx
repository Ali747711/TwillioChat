import { useState } from "react"
import { Link as LinkIcon } from "lucide-react"
import type {
  LocalVideoTrack,
  RemoteParticipant,
  Room as TwilioRoom,
} from "twilio-video"
import type { ChatMessage, ConnectionState } from "@/hooks/useRoom"
import { candidateLinkPath, parseIdentity, type Role } from "@/lib/interview"
import { StudioButton } from "./studio/StudioButton"
import { ChatPanel } from "./ChatPanel"
import { ControlBar } from "./ControlBar"
import { NotesPanel } from "./NotesPanel"
import { ParticipantGrid } from "./ParticipantGrid"

interface RoomProps {
  room: TwilioRoom
  identity: string
  role: Role
  participants: RemoteParticipant[]
  admittedSids: ReadonlySet<string>
  messages: ChatMessage[]
  screenTrack: LocalVideoTrack | null
  dominantSpeakerSid: string | null
  connectionState: ConnectionState
  onAdmit: (sid: string) => void
  onSend: (text: string) => void
  onToggleShare: () => void
  onLeave: () => void
}

export function Room({
  room,
  identity,
  role,
  participants,
  admittedSids,
  messages,
  screenTrack,
  dominantSpeakerSid,
  connectionState,
  onAdmit,
  onSend,
  onToggleShare,
  onLeave,
}: RoomProps) {
  const [chatOpen, setChatOpen] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const isInterviewer = role === "interviewer"

  // Candidates who connected but haven't been admitted: shown in the banner,
  // hidden from the grid. Only the interviewer gates; everyone else sees all.
  const waiting = isInterviewer
    ? participants.filter(
        (p) =>
          parseIdentity(p.identity).role === "candidate" &&
          !admittedSids.has(p.sid)
      )
    : []
  const visibleParticipants = participants.filter(
    (p) => !waiting.includes(p)
  )

  const copyCandidateLink = async () => {
    const link = `${location.origin}${location.pathname}${candidateLinkPath(room.name)}`
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
            {visibleParticipants.length + 1} in interview
          </span>
        </div>
        {isInterviewer && (
          <StudioButton className="px-3 py-2" onClick={copyCandidateLink}>
            <span className="flex items-center gap-1">
              <LinkIcon className="h-3 w-3" />
              {copied ? "Copied!" : "Copy candidate link"}
            </span>
          </StudioButton>
        )}
      </header>
      {waiting.map((candidate) => (
        <div
          key={candidate.sid}
          className="flex items-center justify-between border-b border-studio-border bg-studio-bg px-4 py-2"
        >
          <span className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-studio-muted">
            <span className="h-2 w-2 animate-pulse rounded-full bg-studio-orange" />
            {parseIdentity(candidate.identity).name} is in the waiting room
          </span>
          <StudioButton
            className="px-3 py-2"
            onClick={() => onAdmit(candidate.sid)}
          >
            Admit
          </StudioButton>
        </div>
      ))}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto p-4">
          <ParticipantGrid
            room={room}
            identity={identity}
            participants={visibleParticipants}
            screenTrack={screenTrack}
            dominantSpeakerSid={dominantSpeakerSid}
          />
        </div>
        {chatOpen && (
          <aside className="w-80 border-l border-studio-border">
            <ChatPanel messages={messages} identity={identity} onSend={onSend} />
          </aside>
        )}
        {notesOpen && (
          <aside className="w-80 border-l border-studio-border">
            <NotesPanel roomName={room.name} />
          </aside>
        )}
      </div>
      <ControlBar
        room={room}
        chatOpen={chatOpen}
        sharing={screenTrack !== null}
        onToggleChat={() => {
          setChatOpen((open) => !open)
          setNotesOpen(false)
        }}
        onToggleShare={onToggleShare}
        onLeave={onLeave}
        notesOpen={notesOpen}
        onToggleNotes={
          isInterviewer
            ? () => {
                setNotesOpen((open) => !open)
                setChatOpen(false)
              }
            : undefined
        }
      />
    </div>
  )
}
