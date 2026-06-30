import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { createApp } from './app'

const config = { accountSid: 'ACtest', apiKeySid: 'SKtest', apiKeySecret: 'secret' }
const app = createApp(config)

describe('POST /api/token', () => {
  it('returns a token for valid input', async () => {
    const res = await request(app).post('/api/token').send({ identity: 'alice', room: 'demo' })
    expect(res.status).toBe(200)
    expect(typeof res.body.token).toBe('string')
    expect(res.body.token.length).toBeGreaterThan(0)
  })

  it('returns 400 when identity or room is empty', async () => {
    const res = await request(app).post('/api/token').send({ identity: '', room: '' })
    expect(res.status).toBe(400)
    expect(res.body.error).toBeTruthy()
  })
})
