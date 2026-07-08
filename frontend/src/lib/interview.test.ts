import { describe, expect, it } from 'vitest'
import {
  candidateLinkPath,
  encodeIdentity,
  makeAdmitMessage,
  parseControlMessage,
  parseIdentity,
} from './interview'

describe('encodeIdentity / parseIdentity', () => {
  it('round-trips an interviewer', () => {
    expect(parseIdentity(encodeIdentity('interviewer', 'Alice'))).toEqual({
      role: 'interviewer',
      name: 'Alice',
    })
  })

  it('round-trips a candidate', () => {
    expect(parseIdentity(encodeIdentity('candidate', 'Jane'))).toEqual({
      role: 'candidate',
      name: 'Jane',
    })
  })

  it('keeps names containing the separator intact', () => {
    expect(parseIdentity(encodeIdentity('candidate', 'C::3PO'))).toEqual({
      role: 'candidate',
      name: 'C::3PO',
    })
  })

  it('treats a legacy identity without a role prefix as an interviewer', () => {
    expect(parseIdentity('Ada')).toEqual({ role: 'interviewer', name: 'Ada' })
  })
})

describe('control messages', () => {
  it('round-trips an admit message', () => {
    expect(parseControlMessage(makeAdmitMessage('PA123'))).toEqual({
      type: 'admit',
      targetSid: 'PA123',
    })
  })

  it('returns null for plain chat text', () => {
    expect(parseControlMessage('hello there')).toBeNull()
  })

  it('returns null for JSON that is not a control message', () => {
    expect(parseControlMessage('{"foo":"bar"}')).toBeNull()
  })

  it('returns null for a control message missing its target', () => {
    expect(parseControlMessage('{"__control":"admit"}')).toBeNull()
  })
})

describe('candidateLinkPath', () => {
  it('builds a room + role query string', () => {
    expect(candidateLinkPath('Frontend Round 1')).toBe(
      '?room=Frontend%20Round%201&role=candidate',
    )
  })
})
