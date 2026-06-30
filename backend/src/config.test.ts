import { describe, expect, it } from 'vitest'
import { loadConfig } from './config'

const full = {
  TWILIO_ACCOUNT_SID: 'ACtest',
  TWILIO_API_KEY_SID: 'SKtest',
  TWILIO_API_KEY_SECRET: 'secret',
}

describe('loadConfig', () => {
  it('returns config when all vars are present', () => {
    expect(loadConfig(full)).toEqual({
      accountSid: 'ACtest',
      apiKeySid: 'SKtest',
      apiKeySecret: 'secret',
    })
  })

  it('throws listing every missing var', () => {
    expect(() => loadConfig({})).toThrow(
      /TWILIO_ACCOUNT_SID.*TWILIO_API_KEY_SID.*TWILIO_API_KEY_SECRET/,
    )
  })
})
