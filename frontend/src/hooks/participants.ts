import type { RemoteParticipant } from 'twilio-video'

export type ParticipantsAction =
  | { type: 'add'; participant: RemoteParticipant }
  | { type: 'remove'; participant: RemoteParticipant }
  | { type: 'clear' }

export function participantsReducer(
  state: RemoteParticipant[],
  action: ParticipantsAction,
): RemoteParticipant[] {
  switch (action.type) {
    case 'add':
      if (state.some((p) => p.sid === action.participant.sid)) return state
      return [...state, action.participant]
    case 'remove':
      return state.filter((p) => p.sid !== action.participant.sid)
    case 'clear':
      return []
  }
}
