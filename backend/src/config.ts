export interface TwilioConfig {
  accountSid: string
  apiKeySid: string
  apiKeySecret: string
}

export function loadConfig(env: NodeJS.ProcessEnv): TwilioConfig {
  const entries: Array<[string, string | undefined]> = [
    ['TWILIO_ACCOUNT_SID', env.TWILIO_ACCOUNT_SID],
    ['TWILIO_API_KEY_SID', env.TWILIO_API_KEY_SID],
    ['TWILIO_API_KEY_SECRET', env.TWILIO_API_KEY_SECRET],
  ]
  const missing = entries.filter(([, value]) => !value).map(([key]) => key)
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`)
  }
  const [accountSid, apiKeySid, apiKeySecret] = entries.map(([, value]) => value as string)
  return { accountSid, apiKeySid, apiKeySecret }
}
