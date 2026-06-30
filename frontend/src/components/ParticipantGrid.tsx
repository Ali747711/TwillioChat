import type { RemoteParticipant, Room } from 'twilio-video'
import { LocalVideo } from './LocalVideo'
import { Participant } from './Participant'

interface ParticipantGridProps {
  room: Room
  identity: string
  participants: RemoteParticipant[]
}

export function ParticipantGrid({ room, identity, participants }: ParticipantGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <LocalVideo room={room} identity={identity} />
      {participants.map((p) => (
        <Participant key={p.sid} participant={p} />
      ))}
    </div>
  )
}
