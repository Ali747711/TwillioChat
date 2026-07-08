// Interview-mode helpers: role-tagged Twilio identities and DataTrack control
// messages. The backend never learns about roles — the role rides inside the
// identity string, and admit signals ride the same DataTrack as chat.

export type Role = 'interviewer' | 'candidate'

export interface ParsedIdentity {
  role: Role
  name: string
}

const SEPARATOR = '::'

export function encodeIdentity(role: Role, name: string): string {
  return `${role}${SEPARATOR}${name}`
}

// Identities without a recognized role prefix (e.g. from older sessions) are
// treated as interviewers so they are never gated behind the waiting room.
export function parseIdentity(identity: string): ParsedIdentity {
  for (const role of ['interviewer', 'candidate'] as const) {
    const prefix = `${role}${SEPARATOR}`
    if (identity.startsWith(prefix)) {
      return { role, name: identity.slice(prefix.length) }
    }
  }
  return { role: 'interviewer', name: identity }
}

export interface AdmitMessage {
  type: 'admit'
  targetSid: string
}

// Control messages share the chat DataTrack; the `__control` key is the
// discriminator that keeps them out of the chat transcript.
export function makeAdmitMessage(targetSid: string): string {
  return JSON.stringify({ __control: 'admit', targetSid })
}

export function parseControlMessage(data: string): AdmitMessage | null {
  if (!data.startsWith('{')) return null
  try {
    const parsed: unknown = JSON.parse(data)
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      (parsed as Record<string, unknown>).__control === 'admit' &&
      typeof (parsed as Record<string, unknown>).targetSid === 'string'
    ) {
      return { type: 'admit', targetSid: (parsed as Record<string, unknown>).targetSid as string }
    }
    return null
  } catch {
    return null
  }
}

// Query string a candidate opens to land in the right interview with the
// right role. Callers prepend location.origin + pathname.
export function candidateLinkPath(roomName: string): string {
  return `?room=${encodeURIComponent(roomName)}&role=candidate`
}
