import { describe, expect, it } from 'vitest'
import { createVideoToken } from './twilio'

const config = { accountSid: 'ACtest', apiKeySid: 'SKtest', apiKeySecret: 'secret' }

function decodePayload(jwt: string): Record<string, any> {
  const payload = jwt.split('.')[1]
  return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
}

describe('createVideoToken', () => {
  it('mints a JWT carrying the identity and video room grant', () => {
    const token = createVideoToken(config, 'alice', 'demo-room')
    const payload = decodePayload(token)
    expect(payload.grants.identity).toBe('alice')
    expect(payload.grants.video.room).toBe('demo-room')
    expect(payload.iss).toBe('SKtest')
  })
})
