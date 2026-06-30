import twilio from 'twilio'
import type { TwilioConfig } from './config'

const { AccessToken } = twilio.jwt
const { VideoGrant } = AccessToken

export function createVideoToken(
  config: TwilioConfig,
  identity: string,
  room: string,
): string {
  const token = new AccessToken(
    config.accountSid,
    config.apiKeySid,
    config.apiKeySecret,
    { identity },
  )
  token.addGrant(new VideoGrant({ room }))
  return token.toJwt()
}
