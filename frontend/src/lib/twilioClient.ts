import type { JoinParams, TokenResponse } from "./types"

// Default to same-origin (''), so requests hit `/api/token` and are routed to
// the backend by the Vite dev proxy. This keeps the backend private and makes
// the app work unchanged behind a tunnel. Override with VITE_API_BASE if needed.
const API_BASE = import.meta.env.VITE_API_BASE ?? ""

export async function fetchToken({
  identity,
  room,
}: JoinParams): Promise<string> {
  const res = await fetch(`${API_BASE}/api/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identity, room }),
  })
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(data.error ?? `Token request failed (${res.status})`)
  }
  const data = (await res.json()) as TokenResponse
  return data.token
}
