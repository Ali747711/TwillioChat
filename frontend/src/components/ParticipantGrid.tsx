import type { RemoteParticipant, Room } from 'twilio-video'
import { gridColsForCount } from '@/lib/grid'
import { LocalVideo } from './LocalVideo'
import { Participant } from './Participant'

interface ParticipantGridProps {
  room: Room
  identity: string
  participants: RemoteParticipant[]
}

export function ParticipantGrid({ room, identity, participants }: ParticipantGridProps) {
  const tileCount = 1 + participants.length
  const cols = gridColsForCount(tileCount)
  return (
    <div
      className="mx-auto grid w-full max-w-5xl gap-4"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      <LocalVideo room={room} identity={identity} />
      {participants.map((p) => (
        <Participant key={p.sid} participant={p} />
      ))}
    </div>
  )
}
