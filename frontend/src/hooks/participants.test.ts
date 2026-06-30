import { describe, expect, it } from 'vitest'
import type { RemoteParticipant } from 'twilio-video'
import { participantsReducer } from './participants'

// Minimal stub — the reducer only reads `sid`.
const p = (sid: string) => ({ sid }) as unknown as RemoteParticipant

describe('participantsReducer', () => {
  it('adds a participant', () => {
    const state = participantsReducer([], { type: 'add', participant: p('A') })
    expect(state.map((x) => x.sid)).toEqual(['A'])
  })

  it('ignores duplicate adds', () => {
    const start = [p('A')]
    const state = participantsReducer(start, { type: 'add', participant: p('A') })
    expect(state.map((x) => x.sid)).toEqual(['A'])
  })

  it('removes a participant', () => {
    const state = participantsReducer([p('A'), p('B')], { type: 'remove', participant: p('A') })
    expect(state.map((x) => x.sid)).toEqual(['B'])
  })

  it('clears all participants', () => {
    expect(participantsReducer([p('A')], { type: 'clear' })).toEqual([])
  })
})
