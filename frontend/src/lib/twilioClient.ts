import type { JoinParams, TokenResponse } from './types'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3001'

export async function fetchToken({ identity, room }: JoinParams): Promise<string> {
  const res = await fetch(`${API_BASE}/api/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity, room }),
  })
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(data.error ?? `Token request failed (${res.status})`)
  }
  const data = (await res.json()) as TokenResponse
  return data.token
}
