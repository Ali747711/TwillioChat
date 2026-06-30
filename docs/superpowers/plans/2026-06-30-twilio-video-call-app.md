# TwilioMeet Video Call App — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a browser video-call app (lobby → room with mic/camera toggle, participant grid, screen share, and text chat) using Twilio Video, to learn the API hands-on.

**Architecture:** A stateless Node/Express/TypeScript backend mints short-lived Twilio access tokens (the only place the Twilio secret lives). A React 19 + Vite + shadcn frontend fetches a token, connects to a Twilio Video room with the `twilio-video` SDK, and renders participants/controls/chat from SDK events.

**Tech Stack:** Backend — Node, Express 5, TypeScript, `twilio`, `dotenv`, Vitest, Supertest. Frontend — React 19, Vite 8, Tailwind v4, shadcn/ui, `twilio-video`, Vitest.

**Paths:** Project root `/Users/mac/Desktop/Projects/twilio`. Backend in `backend/`, frontend (already scaffolded) in `frontend/`. Single git repo at the project root (created in Task 0). All `git`/`npm` commands assume you are `cd`'d into the directory named in each task.

---

## File Structure

```
backend/
  package.json          # scripts + deps
  tsconfig.json
  .env.example          # documents required vars (committed)
  .env                  # real secrets (gitignored)
  src/
    config.ts           # loadConfig(env): validates + returns TwilioConfig
    config.test.ts
    twilio.ts           # createVideoToken(config, identity, room): string
    twilio.test.ts
    app.ts              # createApp(config): Express app with POST /api/token
    app.test.ts
    index.ts            # entry: load env, start server (loud failure on bad config)

frontend/src/
  lib/
    types.ts            # shared TS types (JoinParams, TokenResponse)
    twilioClient.ts     # fetchToken(params): Promise<string>
    twilioClient.test.ts
    localMedia.ts       # setAudioEnabled / setVideoEnabled / start|stopScreenShare
  hooks/
    participants.ts     # pure participantsReducer
    participants.test.ts
    useRoom.ts          # owns Room object, participants, chat, join/leave/send
  components/
    Lobby.tsx           # name + room form
    Room.tsx            # layout: grid + control bar + chat panel
    ParticipantGrid.tsx
    Participant.tsx     # one remote participant tile (attaches tracks)
    LocalVideo.tsx      # your own camera tile
    ControlBar.tsx      # mic / camera / screen / chat / leave
    ChatPanel.tsx       # DataTrack text chat UI
    ui/                 # shadcn components (button exists; add input/card/label)
  App.tsx               # routes between Lobby and Room
```

---

## Task 0: Initialize git repo at project root

**Files:**
- Create: `/Users/mac/Desktop/Projects/twilio/.gitignore`

- [ ] **Step 1: Init repo**

Run (from `/Users/mac/Desktop/Projects/twilio`):
```bash
git init
```
Expected: "Initialized empty Git repository".

- [ ] **Step 2: Create root `.gitignore`**

Create `/Users/mac/Desktop/Projects/twilio/.gitignore`:
```gitignore
node_modules/
dist/
.env
.env.local
*.log
.DS_Store
node_modules/.tmp/
```

- [ ] **Step 3: Commit existing work (spec, scaffold)**

```bash
git add .gitignore docs frontend backend skills-lock.json .agents
git commit -m "chore: initialize repo with spec and frontend scaffold"
```
Expected: a commit is created. (The frontend `node_modules` is ignored.)

---

## Task 1: Backend project scaffold

**Files:**
- Create: `backend/package.json`, `backend/tsconfig.json`, `backend/.env.example`

- [ ] **Step 1: Create `backend/package.json`**

```json
{
  "name": "twilio-backend",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "start": "tsx src/index.ts",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  }
}
```

- [ ] **Step 2: Create `backend/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "types": ["node"],
    "noEmit": true
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Install dependencies**

Run (from `backend/`):
```bash
npm install express cors twilio dotenv
npm install -D typescript tsx vitest supertest @types/express @types/cors @types/supertest @types/node
```
Expected: a `node_modules/` and `package-lock.json` appear, no errors.

- [ ] **Step 4: Create `backend/.env.example`**

```
# From the Twilio Console (https://console.twilio.com)
# Account SID: dashboard home
# API Key SID + Secret: Account > API keys & tokens > Create API key
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_KEY_SID=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_KEY_SECRET=your_api_key_secret
PORT=3001
```

- [ ] **Step 5: Commit**

```bash
git add backend/package.json backend/tsconfig.json backend/.env.example backend/package-lock.json
git commit -m "chore(backend): scaffold express + typescript project"
```

---

## Task 2: Config loader (`loadConfig`)

**Files:**
- Create: `backend/src/config.ts`
- Test: `backend/src/config.test.ts`

- [ ] **Step 1: Write the failing test**

Create `backend/src/config.test.ts`:
```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run (from `backend/`): `npx vitest run src/config.test.ts`
Expected: FAIL — cannot find module `./config`.

- [ ] **Step 3: Write minimal implementation**

Create `backend/src/config.ts`:
```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/config.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add backend/src/config.ts backend/src/config.test.ts
git commit -m "feat(backend): add validated config loader"
```

---

## Task 3: Token minting (`createVideoToken`)

**Files:**
- Create: `backend/src/twilio.ts`
- Test: `backend/src/twilio.test.ts`

- [ ] **Step 1: Write the failing test**

Create `backend/src/twilio.test.ts`:
```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/twilio.test.ts`
Expected: FAIL — cannot find module `./twilio`.

- [ ] **Step 3: Write minimal implementation**

Create `backend/src/twilio.ts`:
```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/twilio.test.ts`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add backend/src/twilio.ts backend/src/twilio.test.ts
git commit -m "feat(backend): mint twilio video access tokens"
```

---

## Task 4: Express app + `/api/token` route + server entry

**Files:**
- Create: `backend/src/app.ts`, `backend/src/index.ts`
- Test: `backend/src/app.test.ts`

- [ ] **Step 1: Write the failing test**

Create `backend/src/app.test.ts`:
```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/app.test.ts`
Expected: FAIL — cannot find module `./app`.

- [ ] **Step 3: Write minimal implementation**

Create `backend/src/app.ts`:
```ts
import cors from 'cors'
import express from 'express'
import type { TwilioConfig } from './config'
import { createVideoToken } from './twilio'

export function createApp(config: TwilioConfig) {
  const app = express()
  app.use(cors())
  app.use(express.json())

  app.post('/api/token', (req, res) => {
    const { identity, room } = req.body ?? {}
    const validIdentity = typeof identity === 'string' && identity.trim() !== ''
    const validRoom = typeof room === 'string' && room.trim() !== ''
    if (!validIdentity || !validRoom) {
      res.status(400).json({ error: 'identity and room are required' })
      return
    }
    const token = createVideoToken(config, identity.trim(), room.trim())
    res.json({ token })
  })

  return app
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/app.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Create the server entry**

Create `backend/src/index.ts`:
```ts
import 'dotenv/config'
import { createApp } from './app'
import { loadConfig } from './config'

// Validate config at startup so misconfiguration fails loudly here,
// not as a vague 500 on the first request.
const config = loadConfig(process.env)
const app = createApp(config)
const port = Number(process.env.PORT ?? 3001)

app.listen(port, () => {
  console.log(`Token server listening on http://localhost:${port}`)
})
```

- [ ] **Step 6: Manual smoke test**

Create `backend/.env` from `.env.example` with your real Twilio credentials, then run (from `backend/`):
```bash
npm run dev
```
In another terminal:
```bash
curl -s -X POST http://localhost:3001/api/token \
  -H 'Content-Type: application/json' \
  -d '{"identity":"alice","room":"demo"}'
```
Expected: `{"token":"<a long JWT>"}`. Stop the server with Ctrl+C.

- [ ] **Step 7: Run full backend test suite + typecheck**

```bash
npm test
npm run typecheck
```
Expected: all tests pass; typecheck reports no errors.

- [ ] **Step 8: Commit**

```bash
git add backend/src/app.ts backend/src/app.test.ts backend/src/index.ts
git commit -m "feat(backend): add /api/token endpoint and server entry"
```

---

## Task 5: Frontend dependencies, test setup, and UI components

**Files:**
- Create: `frontend/vitest.config.ts`, `frontend/.env.example`
- Modify: `frontend/package.json` (adds `test` script + deps)

- [ ] **Step 1: Install the Twilio SDK and Vitest**

Run (from `frontend/`):
```bash
npm install twilio-video
npm install -D vitest
```
Expected: installs succeed. (`twilio-video` ships its own TypeScript types.)

- [ ] **Step 2: Add shadcn UI components used by the app**

Run (from `frontend/`):
```bash
npx shadcn@latest add input card label
```
Expected: creates `src/components/ui/input.tsx`, `card.tsx`, `label.tsx`. (If the CLI prompts, accept defaults — the project's `components.json` already configures style/aliases.)

- [ ] **Step 3: Add a `test` script to `frontend/package.json`**

In `frontend/package.json`, add this line to the `"scripts"` object (after `"preview"`):
```json
    "test": "vitest run"
```

- [ ] **Step 4: Create `frontend/vitest.config.ts`**

```ts
import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: {
    environment: 'node',
  },
})
```

- [ ] **Step 5: Create `frontend/.env.example`**

```
# Optional. Defaults to http://localhost:3001 if unset.
VITE_API_BASE=http://localhost:3001
```

- [ ] **Step 6: Commit**

```bash
git add frontend/package.json frontend/package-lock.json frontend/vitest.config.ts frontend/.env.example frontend/src/components/ui
git commit -m "chore(frontend): add twilio-video, vitest, and shadcn input/card/label"
```

---

## Task 6: Shared types + token-fetch helper

**Files:**
- Create: `frontend/src/lib/types.ts`, `frontend/src/lib/twilioClient.ts`
- Test: `frontend/src/lib/twilioClient.test.ts`

- [ ] **Step 1: Create the shared types**

Create `frontend/src/lib/types.ts`:
```ts
export interface JoinParams {
  identity: string
  room: string
}

export interface TokenResponse {
  token: string
}
```

- [ ] **Step 2: Write the failing test**

Create `frontend/src/lib/twilioClient.test.ts`:
```ts
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
```

- [ ] **Step 3: Run test to verify it fails**

Run (from `frontend/`): `npx vitest run src/lib/twilioClient.test.ts`
Expected: FAIL — cannot find module `./twilioClient`.

- [ ] **Step 4: Write minimal implementation**

Create `frontend/src/lib/twilioClient.ts`:
```ts
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
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/lib/twilioClient.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add frontend/src/lib/types.ts frontend/src/lib/twilioClient.ts frontend/src/lib/twilioClient.test.ts
git commit -m "feat(frontend): add token fetch helper and shared types"
```

---

## Task 7: Participants reducer (pure)

**Files:**
- Create: `frontend/src/hooks/participants.ts`
- Test: `frontend/src/hooks/participants.test.ts`

- [ ] **Step 1: Write the failing test**

Create `frontend/src/hooks/participants.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import type { RemoteParticipant } from 'twilio-video'
import { participantsReducer } from './participants'

// Minimal stub — the reducer only reads `sid`.
const p = (sid: string) => ({ sid }) as unknown as RemoteParticipant

describe('participantsReducer', () => {
  it('adds a participant', () => {
    const state = participantsReducer([], { type: 'add', participant: p('A') })
    expect(state.map((x) => x.sid)).toEqual(['A'])
  })

  it('ignores duplicate adds', () => {
    const start = [p('A')]
    const state = participantsReducer(start, { type: 'add', participant: p('A') })
    expect(state.map((x) => x.sid)).toEqual(['A'])
  })

  it('removes a participant', () => {
    const state = participantsReducer([p('A'), p('B')], { type: 'remove', participant: p('A') })
    expect(state.map((x) => x.sid)).toEqual(['B'])
  })

  it('clears all participants', () => {
    expect(participantsReducer([p('A')], { type: 'clear' })).toEqual([])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run (from `frontend/`): `npx vitest run src/hooks/participants.test.ts`
Expected: FAIL — cannot find module `./participants`.

- [ ] **Step 3: Write minimal implementation**

Create `frontend/src/hooks/participants.ts`:
```ts
import type { RemoteParticipant } from 'twilio-video'

export type ParticipantsAction =
  | { type: 'add'; participant: RemoteParticipant }
  | { type: 'remove'; participant: RemoteParticipant }
  | { type: 'clear' }

export function participantsReducer(
  state: RemoteParticipant[],
  action: ParticipantsAction,
): RemoteParticipant[] {
  switch (action.type) {
    case 'add':
      if (state.some((p) => p.sid === action.participant.sid)) return state
      return [...state, action.participant]
    case 'remove':
      return state.filter((p) => p.sid !== action.participant.sid)
    case 'clear':
      return []
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/hooks/participants.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/hooks/participants.ts frontend/src/hooks/participants.test.ts
git commit -m "feat(frontend): add pure participants reducer"
```

---

## Task 8: Local media helpers

**Files:**
- Create: `frontend/src/lib/localMedia.ts`

(These functions wrap the Twilio SDK and the browser screen-capture API; they are exercised by manual testing in later tasks, not unit tests.)

- [ ] **Step 1: Write the implementation**

Create `frontend/src/lib/localMedia.ts`:
```ts
import { LocalVideoTrack, type Room } from 'twilio-video'

export function setAudioEnabled(room: Room, enabled: boolean): void {
  room.localParticipant.audioTracks.forEach((pub) => {
    if (enabled) pub.track.enable()
    else pub.track.disable()
  })
}

export function setVideoEnabled(room: Room, enabled: boolean): void {
  room.localParticipant.videoTracks.forEach((pub) => {
    if (enabled) pub.track.enable()
    else pub.track.disable()
  })
}

export async function startScreenShare(room: Room): Promise<LocalVideoTrack> {
  const stream = await navigator.mediaDevices.getDisplayMedia({ video: true })
  const track = new LocalVideoTrack(stream.getVideoTracks()[0], { name: 'screen' })
  await room.localParticipant.publishTrack(track)
  return track
}

export function stopScreenShare(room: Room, track: LocalVideoTrack): void {
  room.localParticipant.unpublishTrack(track)
  track.stop()
}
```

- [ ] **Step 2: Typecheck**

Run (from `frontend/`): `npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/lib/localMedia.ts
git commit -m "feat(frontend): add local media (mic/camera/screen) helpers"
```

---

## Task 9: `useRoom` hook

**Files:**
- Create: `frontend/src/hooks/useRoom.ts`

(Connection orchestration; verified via the manual two-tab test in Task 14.)

- [ ] **Step 1: Write the implementation**

Create `frontend/src/hooks/useRoom.ts`:
```ts
import { useCallback, useReducer, useRef, useState } from 'react'
import {
  connect,
  LocalDataTrack,
  type RemoteParticipant,
  type RemoteTrack,
  type Room,
} from 'twilio-video'
import { fetchToken } from '@/lib/twilioClient'
import { participantsReducer } from './participants'

export interface ChatMessage {
  from: string
  text: string
  at: number
}

export type RoomStatus = 'idle' | 'connecting' | 'connected' | 'error'

export function useRoom() {
  const [room, setRoom] = useState<Room | null>(null)
  const [participants, dispatch] = useReducer(participantsReducer, [])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [status, setStatus] = useState<RoomStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const dataTrackRef = useRef<LocalDataTrack | null>(null)

  const addMessage = useCallback((from: string, text: string) => {
    setMessages((prev) => [...prev, { from, text, at: Date.now() }])
  }, [])

  const watchParticipant = useCallback(
    (participant: RemoteParticipant) => {
      dispatch({ type: 'add', participant })
      const listenForData = (track: RemoteTrack) => {
        if (track.kind !== 'data') return
        track.on('message', (data) => {
          if (typeof data === 'string') addMessage(participant.identity, data)
        })
      }
      participant.tracks.forEach((pub) => {
        if (pub.track) listenForData(pub.track)
      })
      participant.on('trackSubscribed', listenForData)
    },
    [addMessage],
  )

  const join = useCallback(
    async (identity: string, roomName: string, withVideo: boolean) => {
      setStatus('connecting')
      setError(null)
      try {
        const token = await fetchToken({ identity, room: roomName })
        const connected = await connect(token, {
          name: roomName,
          audio: true,
          video: withVideo ? { width: 640 } : false,
        })

        const dataTrack = new LocalDataTrack()
        dataTrackRef.current = dataTrack
        await connected.localParticipant.publishTrack(dataTrack)

        connected.participants.forEach(watchParticipant)
        connected.on('participantConnected', watchParticipant)
        connected.on('participantDisconnected', (p) =>
          dispatch({ type: 'remove', participant: p }),
        )
        connected.on('disconnected', () => {
          dispatch({ type: 'clear' })
          setMessages([])
          setRoom(null)
          setStatus('idle')
        })

        setRoom(connected)
        setStatus('connected')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to join the room')
        setStatus('error')
      }
    },
    [watchParticipant],
  )

  const leave = useCallback(() => {
    room?.disconnect()
  }, [room])

  const sendMessage = useCallback(
    (text: string, from: string) => {
      dataTrackRef.current?.send(text)
      addMessage(from, text)
    },
    [addMessage],
  )

  return { room, participants, messages, status, error, join, leave, sendMessage }
}
```

- [ ] **Step 2: Typecheck**

Run (from `frontend/`): `npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/hooks/useRoom.ts
git commit -m "feat(frontend): add useRoom connection + chat hook"
```

---

## Task 10: Lobby component + App wiring (first runnable UI)

**Files:**
- Create: `frontend/src/components/Lobby.tsx`
- Modify: `frontend/src/App.tsx` (replace scaffold contents)

- [ ] **Step 1: Create `frontend/src/components/Lobby.tsx`**

```tsx
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface LobbyProps {
  onJoin: (identity: string, room: string, withVideo: boolean) => void
  connecting: boolean
  error: string | null
}

export function Lobby({ onJoin, connecting, error }: LobbyProps) {
  const [identity, setIdentity] = useState('')
  const [room, setRoom] = useState('')
  const [audioOnly, setAudioOnly] = useState(false)
  const canJoin = identity.trim() !== '' && room.trim() !== '' && !connecting

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Join a call</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Your name</Label>
            <Input
              id="name"
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
              placeholder="Ada"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="room">Room name</Label>
            <Input
              id="room"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="standup"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={audioOnly}
              onChange={(e) => setAudioOnly(e.target.checked)}
            />
            Join audio-only (no camera)
          </label>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            disabled={!canJoin}
            onClick={() => onJoin(identity.trim(), room.trim(), !audioOnly)}
          >
            {connecting ? 'Joining…' : 'Join'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 2: Replace `frontend/src/App.tsx`**

```tsx
import { useState } from 'react'
import { Lobby } from '@/components/Lobby'
import { useRoom } from '@/hooks/useRoom'

export function App() {
  const { status, error, join } = useRoom()
  const [identity, setIdentity] = useState('')

  const handleJoin = (name: string, roomName: string, withVideo: boolean) => {
    setIdentity(name)
    join(name, roomName, withVideo)
  }

  // Temporary: log who is joining until the Room screen exists (Task 13).
  if (status === 'connected') {
    return <div className="p-6">Connected as {identity}. Room UI arrives in Task 13.</div>
  }

  return <Lobby onJoin={handleJoin} connecting={status === 'connecting'} error={error} />
}

export default App
```

- [ ] **Step 3: Run the app and verify the lobby**

Start the backend (from `backend/`): `npm run dev`. In another terminal start the frontend (from `frontend/`): `npm run dev`. Open the printed URL. Enter a name and room, click **Join**, and allow camera/mic when prompted.
Expected: the form is disabled until both fields are filled; after Join you see "Connected as …". If the backend is down, an error message appears under the form.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/Lobby.tsx frontend/src/App.tsx
git commit -m "feat(frontend): add lobby screen and app wiring"
```

---

## Task 11: Participant tiles + grid (see yourself and others)

**Files:**
- Create: `frontend/src/components/LocalVideo.tsx`, `frontend/src/components/Participant.tsx`, `frontend/src/components/ParticipantGrid.tsx`

- [ ] **Step 1: Create `frontend/src/components/LocalVideo.tsx`**

```tsx
import { useEffect, useRef } from 'react'
import type { Room } from 'twilio-video'

interface LocalVideoProps {
  room: Room
  identity: string
}

export function LocalVideo({ room, identity }: LocalVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const elements: HTMLElement[] = []
    room.localParticipant.videoTracks.forEach((pub) => {
      if (pub.track) {
        const el = pub.track.attach()
        el.className = 'h-full w-full object-cover'
        container.appendChild(el)
        elements.push(el)
      }
    })
    return () => {
      elements.forEach((el) => el.remove())
    }
  }, [room])

  return (
    <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
      <div ref={containerRef} className="h-full w-full" />
      <span className="absolute bottom-1 left-1 rounded bg-black/50 px-1.5 py-0.5 text-xs text-white">
        {identity} (you)
      </span>
    </div>
  )
}
```

- [ ] **Step 2: Create `frontend/src/components/Participant.tsx`**

```tsx
import { useEffect, useRef, useState } from 'react'
import type { RemoteParticipant, RemoteTrack } from 'twilio-video'

interface ParticipantProps {
  participant: RemoteParticipant
}

export function Participant({ participant }: ParticipantProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [hasVideo, setHasVideo] = useState(false)

  useEffect(() => {
    const attach = (track: RemoteTrack) => {
      if (track.kind === 'video' && videoRef.current) {
        track.attach(videoRef.current)
        setHasVideo(true)
      } else if (track.kind === 'audio' && audioRef.current) {
        track.attach(audioRef.current)
      }
    }
    const detach = (track: RemoteTrack) => {
      if (track.kind === 'video') setHasVideo(false)
      if (track.kind === 'video' || track.kind === 'audio') {
        track.detach().forEach((el) => el.remove())
      }
    }

    participant.tracks.forEach((pub) => {
      if (pub.track) attach(pub.track)
    })
    participant.on('trackSubscribed', attach)
    participant.on('trackUnsubscribed', detach)
    return () => {
      participant.off('trackSubscribed', attach)
      participant.off('trackUnsubscribed', detach)
    }
  }, [participant])

  return (
    <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
      <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover" />
      <audio ref={audioRef} autoPlay />
      {!hasVideo && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          {participant.identity}
        </div>
      )}
      <span className="absolute bottom-1 left-1 rounded bg-black/50 px-1.5 py-0.5 text-xs text-white">
        {participant.identity}
      </span>
    </div>
  )
}
```

- [ ] **Step 3: Create `frontend/src/components/ParticipantGrid.tsx`**

```tsx
import type { RemoteParticipant, Room } from 'twilio-video'
import { LocalVideo } from './LocalVideo'
import { Participant } from './Participant'

interface ParticipantGridProps {
  room: Room
  identity: string
  participants: RemoteParticipant[]
}

export function ParticipantGrid({ room, identity, participants }: ParticipantGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <LocalVideo room={room} identity={identity} />
      {participants.map((p) => (
        <Participant key={p.sid} participant={p} />
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Typecheck**

Run (from `frontend/`): `npm run typecheck`
Expected: no errors. (Grid is wired into the Room screen in Task 13.)

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/LocalVideo.tsx frontend/src/components/Participant.tsx frontend/src/components/ParticipantGrid.tsx
git commit -m "feat(frontend): add participant tiles and grid"
```

---

## Task 12: Control bar (mic / camera / screen share / chat / leave)

**Files:**
- Create: `frontend/src/components/ControlBar.tsx`

- [ ] **Step 1: Create `frontend/src/components/ControlBar.tsx`**

```tsx
import { useRef, useState } from 'react'
import {
  MessageSquare,
  Mic,
  MicOff,
  MonitorUp,
  PhoneOff,
  Video as VideoIcon,
  VideoOff,
} from 'lucide-react'
import type { LocalVideoTrack, Room } from 'twilio-video'
import { Button } from '@/components/ui/button'
import {
  setAudioEnabled,
  setVideoEnabled,
  startScreenShare,
  stopScreenShare,
} from '@/lib/localMedia'

interface ControlBarProps {
  room: Room
  chatOpen: boolean
  onToggleChat: () => void
  onLeave: () => void
}

export function ControlBar({ room, chatOpen, onToggleChat, onLeave }: ControlBarProps) {
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [sharing, setSharing] = useState(false)
  const screenTrackRef = useRef<LocalVideoTrack | null>(null)

  const toggleMic = () => {
    const next = !micOn
    setAudioEnabled(room, next)
    setMicOn(next)
  }

  const toggleCam = () => {
    const next = !camOn
    setVideoEnabled(room, next)
    setCamOn(next)
  }

  const toggleShare = async () => {
    if (sharing && screenTrackRef.current) {
      stopScreenShare(room, screenTrackRef.current)
      screenTrackRef.current = null
      setSharing(false)
      return
    }
    try {
      screenTrackRef.current = await startScreenShare(room)
      setSharing(true)
    } catch {
      // User dismissed the screen-picker; leave state unchanged.
    }
  }

  return (
    <div className="flex items-center justify-center gap-2 border-t bg-background p-3">
      <Button variant={micOn ? 'secondary' : 'destructive'} size="icon" onClick={toggleMic}>
        {micOn ? <Mic /> : <MicOff />}
      </Button>
      <Button variant={camOn ? 'secondary' : 'destructive'} size="icon" onClick={toggleCam}>
        {camOn ? <VideoIcon /> : <VideoOff />}
      </Button>
      <Button variant={sharing ? 'default' : 'secondary'} size="icon" onClick={toggleShare}>
        <MonitorUp />
      </Button>
      <Button variant={chatOpen ? 'default' : 'secondary'} size="icon" onClick={onToggleChat}>
        <MessageSquare />
      </Button>
      <Button variant="destructive" size="icon" onClick={onLeave}>
        <PhoneOff />
      </Button>
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run (from `frontend/`): `npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/ControlBar.tsx
git commit -m "feat(frontend): add in-call control bar"
```

---

## Task 13: Chat panel + Room layout + final App wiring

**Files:**
- Create: `frontend/src/components/ChatPanel.tsx`, `frontend/src/components/Room.tsx`
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Create `frontend/src/components/ChatPanel.tsx`**

```tsx
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ChatMessage } from '@/hooks/useRoom'

interface ChatPanelProps {
  messages: ChatMessage[]
  identity: string
  onSend: (text: string) => void
}

export function ChatPanel({ messages, identity, onSend }: ChatPanelProps) {
  const [text, setText] = useState('')

  const submit = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    onSend(trimmed)
    setText('')
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {messages.map((m, i) => (
          <div key={i} className="text-sm">
            <span className="font-medium">{m.from === identity ? 'You' : m.from}: </span>
            <span>{m.text}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2 border-t p-3">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit()
          }}
          placeholder="Message"
        />
        <Button onClick={submit}>Send</Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `frontend/src/components/Room.tsx`**

```tsx
import { useState } from 'react'
import type { RemoteParticipant, Room as TwilioRoom } from 'twilio-video'
import type { ChatMessage } from '@/hooks/useRoom'
import { ChatPanel } from './ChatPanel'
import { ControlBar } from './ControlBar'
import { ParticipantGrid } from './ParticipantGrid'

interface RoomProps {
  room: TwilioRoom
  identity: string
  participants: RemoteParticipant[]
  messages: ChatMessage[]
  onSend: (text: string) => void
  onLeave: () => void
}

export function Room({ room, identity, participants, messages, onSend, onLeave }: RoomProps) {
  const [chatOpen, setChatOpen] = useState(false)

  return (
    <div className="flex h-svh flex-col">
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto p-4">
          <ParticipantGrid room={room} identity={identity} participants={participants} />
        </div>
        {chatOpen && (
          <aside className="w-80 border-l">
            <ChatPanel messages={messages} identity={identity} onSend={onSend} />
          </aside>
        )}
      </div>
      <ControlBar
        room={room}
        chatOpen={chatOpen}
        onToggleChat={() => setChatOpen((open) => !open)}
        onLeave={onLeave}
      />
    </div>
  )
}
```

- [ ] **Step 3: Replace `frontend/src/App.tsx`**

```tsx
import { useState } from 'react'
import { Lobby } from '@/components/Lobby'
import { Room } from '@/components/Room'
import { useRoom } from '@/hooks/useRoom'

export function App() {
  const { room, participants, messages, status, error, join, leave, sendMessage } = useRoom()
  const [identity, setIdentity] = useState('')

  const handleJoin = (name: string, roomName: string, withVideo: boolean) => {
    setIdentity(name)
    join(name, roomName, withVideo)
  }

  if (room && status === 'connected') {
    return (
      <Room
        room={room}
        identity={identity}
        participants={participants}
        messages={messages}
        onSend={(text) => sendMessage(text, identity)}
        onLeave={leave}
      />
    )
  }

  return <Lobby onJoin={handleJoin} connecting={status === 'connecting'} error={error} />
}

export default App
```

- [ ] **Step 4: Typecheck**

Run (from `frontend/`): `npm run typecheck`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/ChatPanel.tsx frontend/src/components/Room.tsx frontend/src/App.tsx
git commit -m "feat(frontend): add chat panel, room layout, and final wiring"
```

---

## Task 14: Full verification (two-tab end-to-end)

**Files:** none (verification only)

- [ ] **Step 1: Run all automated checks**

Backend (from `backend/`):
```bash
npm test
npm run typecheck
```
Frontend (from `frontend/`):
```bash
npm test
npm run typecheck
npm run lint
```
Expected: all tests pass; typecheck and lint report no errors.

- [ ] **Step 2: Two-tab manual test**

Start the backend (`npm run dev` in `backend/`) and frontend (`npm run dev` in `frontend/`). Open the frontend URL in **two browser tabs**. In both, join the **same room name** with different display names (allow camera/mic).

Verify each feature:
- Both tiles appear in each tab's grid (you + the other participant).
- Mic button toggles; the other tab's audio mutes/unmutes.
- Camera button toggles; your tile goes black and the other tab sees it.
- Screen-share button publishes your screen; the other tab sees it as a new tile. Toggling again stops it.
- Chat button opens the panel; a message sent in one tab appears in the other.
- Leave (red phone) returns you to the lobby.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "chore: verify full video-call flow end-to-end" --allow-empty
```

---

## Notes for the engineer

- **Twilio credentials:** create a free account, then **Account → API keys & tokens → Create API key** to get the API Key SID + Secret. The Account SID is on the console home. Put all three in `backend/.env`.
- **Localhost is fine** for two tabs on one machine — browsers allow camera/mic on `http://localhost`. To test across two physical devices you need HTTPS (e.g. a free `ngrok`/`cloudflared` tunnel to both servers); not built here.
- **`erasableSyntaxOnly` + `verbatimModuleSyntax`** are on in the frontend tsconfig: always use `import type { ... }` for type-only imports (the plan already does), and don't introduce `enum`s.
- **Programmable Video is on a deprecation path** — fine for learning, not for a new production app.
