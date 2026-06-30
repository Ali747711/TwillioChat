import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchToken } from './twilioClient'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('fetchToken', () => {
  it('returns the token string on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ token: 'jwt-123' }), { status: 200 })),
    )
    const token = await fetchToken({ identity: 'alice', room: 'demo' })
    expect(token).toBe('jwt-123')
  })

  it('throws with the server error message on failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ error: 'nope' }), { status: 400 })),
    )
    await expect(fetchToken({ identity: '', room: '' })).rejects.toThrow('nope')
  })
})
