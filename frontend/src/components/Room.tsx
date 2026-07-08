import { useState } from "react"
import { Link as LinkIcon } from "lucide-react"
import type {
  LocalVideoTrack,
  RemoteParticipant,
  Room as TwilioRoom,
} from "twilio-video"
import type { ChatMessage, ConnectionState } from "@/hooks/useRoom"
import { candidateLinkPath, parseIdentity, type Role } from "@/lib/interview"
import { PopButton } from "./pop/PopButton"
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
  const visibleParticipants = participants.filter((p) => !waiting.includes(p))

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
    <div className="flex h-svh flex-col bg-pop-brown font-sans text-pop-cream">
      {connectionState === "reconnecting" && (
        <div className="bg-pop-yellow py-1.5 text-center font-pop text-xs font-bold tracking-[0.1em] text-pop-brown uppercase">
          Reconnecting…
        </div>
      )}
      <header className="flex items-center justify-between border-b-[3px] border-pop-cream/10 px-5 py-3">
        <div className="flex items-baseline gap-3">
          <span className="font-pop text-lg font-bold text-pop-cream">
            {room.name}
          </span>
          <span className="rounded-full border border-pop-cream/20 bg-pop-cream/10 px-3 py-1 text-[11px] font-bold tracking-[0.1em] text-pop-cream/70 uppercase">
            {visibleParticipants.length + 1} in interview
          </span>
        </div>
        {isInterviewer && (
          <PopButton
            variant="cream"
            size="md"
            className="px-4 py-2 text-xs"
            onClick={copyCandidateLink}
          >
            <span className="flex items-center gap-1.5 normal-case">
              <LinkIcon className="h-3.5 w-3.5" />
              {copied ? "Copied!" : "Copy candidate link"}
            </span>
          </PopButton>
        )}
      </header>
      {waiting.map((candidate) => (
        <div
          key={candidate.sid}
          className="flex items-center justify-between border-b-[3px] border-pop-brown bg-pop-cream px-5 py-2.5 text-pop-brown"
        >
          <span className="flex items-center gap-3 text-xs font-bold tracking-[0.08em] uppercase">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-pop-orange" />
            {parseIdentity(candidate.identity).name} is in the waiting room
          </span>
          <PopButton
            size="md"
            className="px-4 py-2 text-xs"
            onClick={() => onAdmit(candidate.sid)}
          >
            Admit
          </PopButton>
        </div>
      ))}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto p-5">
          <ParticipantGrid
            room={room}
            identity={identity}
            participants={visibleParticipants}
            screenTrack={screenTrack}
            dominantSpeakerSid={dominantSpeakerSid}
          />
        </div>
        {chatOpen && (
          <aside className="w-80 border-l-[3px] border-pop-brown bg-pop-cream">
            <ChatPanel
              messages={messages}
              identity={identity}
              onSend={onSend}
            />
          </aside>
        )}
        {notesOpen && (
          <aside className="w-80 border-l-[3px] border-pop-brown bg-pop-cream">
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
