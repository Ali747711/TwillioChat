# Tier-1 Call Features + Grid/Screen Fixes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add active-speaker highlight, remote mute/camera indicators, network-quality bars, a reconnecting banner, and a room header (count + copy-link), and fix local screen-share preview + the responsive grid.

**Architecture:** All work is in `frontend/`. Room-level state (dominant speaker, connection state, the local screen track) lives in the `useRoom` hook and flows down through `App → Room → grid/tiles`. Per-tile status (mute state, network level) is read via small focused hooks subscribed to Twilio `Participant` events. One pure helper (`gridColsForCount`) is unit-tested; the SDK-event-driven UI is verified manually with two tabs.

**Tech Stack:** React 19, Vite, Tailwind v4, shadcn/ui, `twilio-video`, Vitest.

**Conventions:**
- Run all commands from `frontend/`.
- **Type-check with `npm run build`**, not `npm run typecheck` — the references-root `typecheck` script does not deep-check `src` (it missed a real error before); `tsc -b` inside `build` does.
- Per-task automated gate: `npm run build && npm test && npm run lint` must all pass before the commit step.
- Type-only imports must use `import type` (`verbatimModuleSyntax` is on). No `enum`s.
- "Manual check" steps are for the user with live credentials later; implementers rely on the automated gate.

---

## File Structure

```
frontend/src/
  lib/
    grid.ts            (new) gridColsForCount(n) — pure column chooser
    grid.test.ts       (new) unit tests
  hooks/
    useNetworkLevel.ts (new) network quality level for any participant
    useRemoteMediaState.ts (new) audio/video enabled state for a remote participant
    useRoom.ts         (modify) + screenTrack/toggleScreenShare, dominantSpeakerSid,
                       connectionState, connect() options
  components/
    NetworkBars.tsx    (new) presentational signal bars
    LocalScreen.tsx    (new) tile that attaches the local screen track
    Participant.tsx    (modify) bars + mute/camera badges + dominant ring
    LocalVideo.tsx     (modify) bars
    ParticipantGrid.tsx(modify) responsive columns + screen tile + dominant sid
    ControlBar.tsx     (modify) screen share via props (state moved to useRoom)
    Room.tsx           (modify) header (count + copy-link), reconnecting banner, threading
    Lobby.tsx          (modify) pre-fill room from ?room=
  App.tsx              (modify) thread new useRoom values; set ?room= on join
```

---

## Task 1: Responsive grid (`gridColsForCount`)

**Files:**
- Create: `frontend/src/lib/grid.ts`, `frontend/src/lib/grid.test.ts`
- Modify: `frontend/src/components/ParticipantGrid.tsx`

- [ ] **Step 1: Write the failing test**

Create `frontend/src/lib/grid.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { gridColsForCount } from './grid'

describe('gridColsForCount', () => {
  it('1 tile → 1 column', () => expect(gridColsForCount(1)).toBe(1))
  it('2 tiles → 2 columns', () => expect(gridColsForCount(2)).toBe(2))
  it('4 tiles → 2 columns', () => expect(gridColsForCount(4)).toBe(2))
  it('5 tiles → 3 columns', () => expect(gridColsForCount(5)).toBe(3))
  it('9 tiles → 3 columns', () => expect(gridColsForCount(9)).toBe(3))
  it('10 tiles → 4 columns', () => expect(gridColsForCount(10)).toBe(4))
  it('0 tiles → 1 column (no crash)', () => expect(gridColsForCount(0)).toBe(1))
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/grid.test.ts`
Expected: FAIL — cannot find module `./grid`.

- [ ] **Step 3: Write minimal implementation**

Create `frontend/src/lib/grid.ts`:
```ts
// Choose a column count that keeps tiles reasonably sized as the room grows.
export function gridColsForCount(count: number): number {
  if (count <= 1) return 1
  if (count <= 4) return 2
  if (count <= 9) return 3
  return 4
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/grid.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Apply the responsive grid**

Replace the entire contents of `frontend/src/components/ParticipantGrid.tsx`:
```tsx
import type { RemoteParticipant, Room } from 'twilio-video'
import { gridColsForCount } from '@/lib/grid'
import { LocalVideo } from './LocalVideo'
import { Participant } from './Participant'

interface ParticipantGridProps {
  room: Room
  identity: string
  participants: RemoteParticipant[]
}

export function ParticipantGrid({ room, identity, participants }: ParticipantGridProps) {
  const tileCount = 1 + participants.length
  const cols = gridColsForCount(tileCount)
  return (
    <div
      className="mx-auto grid w-full max-w-5xl gap-4"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      <LocalVideo room={room} identity={identity} />
      {participants.map((p) => (
        <Participant key={p.sid} participant={p} />
      ))}
    </div>
  )
}
```

- [ ] **Step 6: Verify build/test/lint**

Run: `npm run build && npm test && npm run lint`
Expected: build succeeds, all tests pass, lint clean.

- [ ] **Step 7: Commit**

```bash
git add src/lib/grid.ts src/lib/grid.test.ts src/components/ParticipantGrid.tsx
git commit -m "feat(frontend): responsive participant grid via gridColsForCount"
```

---

## Task 2: Move screen share into `useRoom` + local screen tile

**Files:**
- Modify: `frontend/src/hooks/useRoom.ts`, `frontend/src/components/ControlBar.tsx`, `frontend/src/components/Room.tsx`, `frontend/src/components/ParticipantGrid.tsx`, `frontend/src/App.tsx`
- Create: `frontend/src/components/LocalScreen.tsx`

- [ ] **Step 1: Add screen-share state to `useRoom`**

In `frontend/src/hooks/useRoom.ts`, update the imports to include `LocalVideoTrack` and the local-media helpers. Change the top import block to:
```ts
import { useCallback, useReducer, useRef, useState } from "react"
import {
  connect,
  LocalDataTrack,
  type LocalVideoTrack,
  type RemoteParticipant,
  type RemoteTrack,
  type Room,
} from "twilio-video"
import { fetchToken } from "@/lib/twilioClient"
import { startScreenShare, stopScreenShare } from "@/lib/localMedia"
import { participantsReducer } from "./participants"
```

Add state + ref alongside the existing `dataTrackRef`/`teardownsRef` declarations:
```ts
  const screenTrackRef = useRef<LocalVideoTrack | null>(null)
  const [screenTrack, setScreenTrack] = useState<LocalVideoTrack | null>(null)
```

- [ ] **Step 2: Add `toggleScreenShare` and clean it up on disconnect**

In `useRoom.ts`, add this callback after the `leave` callback:
```ts
  const toggleScreenShare = useCallback(async () => {
    if (!room) return
    if (screenTrackRef.current) {
      stopScreenShare(room, screenTrackRef.current)
      screenTrackRef.current = null
      setScreenTrack(null)
      return
    }
    try {
      const track = await startScreenShare(room)
      screenTrackRef.current = track
      setScreenTrack(track)
      track.mediaStreamTrack.addEventListener(
        "ended",
        () => {
          if (screenTrackRef.current) {
            stopScreenShare(room, screenTrackRef.current)
            screenTrackRef.current = null
            setScreenTrack(null)
          }
        },
        { once: true },
      )
    } catch {
      // User dismissed the screen picker; leave state unchanged.
    }
  }, [room])
```

In the existing `handleDisconnected` function inside `join`, add screen cleanup at the top of the handler (before `dispatch({ type: "clear" })`):
```ts
          if (screenTrackRef.current) {
            screenTrackRef.current.stop()
            screenTrackRef.current = null
            setScreenTrack(null)
          }
```

Add `screenTrack` and `toggleScreenShare` to the returned object:
```ts
  return {
    room,
    participants,
    messages,
    status,
    error,
    join,
    leave,
    sendMessage,
    screenTrack,
    toggleScreenShare,
  }
```

- [ ] **Step 3: Create the local screen tile**

Create `frontend/src/components/LocalScreen.tsx`:
```tsx
import { useEffect, useRef } from 'react'
import type { LocalVideoTrack } from 'twilio-video'

interface LocalScreenProps {
  track: LocalVideoTrack
}

export function LocalScreen({ track }: LocalScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const el = track.attach()
    el.className = 'h-full w-full bg-black object-contain'
    container.appendChild(el)
    return () => {
      el.remove()
    }
  }, [track])

  return (
    <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
      <div ref={containerRef} className="h-full w-full" />
      <span className="absolute bottom-1 left-1 rounded bg-black/50 px-1.5 py-0.5 text-xs text-white">
        You (screen)
      </span>
    </div>
  )
}
```

- [ ] **Step 4: Render the screen tile in the grid**

Replace the entire contents of `frontend/src/components/ParticipantGrid.tsx`:
```tsx
import type { LocalVideoTrack, RemoteParticipant, Room } from 'twilio-video'
import { gridColsForCount } from '@/lib/grid'
import { LocalScreen } from './LocalScreen'
import { LocalVideo } from './LocalVideo'
import { Participant } from './Participant'

interface ParticipantGridProps {
  room: Room
  identity: string
  participants: RemoteParticipant[]
  screenTrack: LocalVideoTrack | null
}

export function ParticipantGrid({
  room,
  identity,
  participants,
  screenTrack,
}: ParticipantGridProps) {
  const tileCount = 1 + (screenTrack ? 1 : 0) + participants.length
  const cols = gridColsForCount(tileCount)
  return (
    <div
      className="mx-auto grid w-full max-w-5xl gap-4"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      <LocalVideo room={room} identity={identity} />
      {screenTrack && <LocalScreen track={screenTrack} />}
      {participants.map((p) => (
        <Participant key={p.sid} participant={p} />
      ))}
    </div>
  )
}
```

- [ ] **Step 5: Change `ControlBar` to use screen-share props**

Replace the entire contents of `frontend/src/components/ControlBar.tsx`:
```tsx
import { useState } from "react"
import {
  MessageSquare,
  Mic,
  MicOff,
  MonitorUp,
  PhoneOff,
  Video as VideoIcon,
  VideoOff,
} from "lucide-react"
import type { Room } from "twilio-video"
import { Button } from "@/components/ui/button"
import { setAudioEnabled, setVideoEnabled } from "@/lib/localMedia"

interface ControlBarProps {
  room: Room
  chatOpen: boolean
  sharing: boolean
  onToggleChat: () => void
  onToggleShare: () => void
  onLeave: () => void
}

export function ControlBar({
  room,
  chatOpen,
  sharing,
  onToggleChat,
  onToggleShare,
  onLeave,
}: ControlBarProps) {
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)

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

  return (
    <div className="flex items-center justify-center gap-2 border-t bg-background p-3">
      <Button
        variant={micOn ? "secondary" : "destructive"}
        size="icon"
        onClick={toggleMic}
      >
        {micOn ? <Mic /> : <MicOff />}
      </Button>
      <Button
        variant={camOn ? "secondary" : "destructive"}
        size="icon"
        onClick={toggleCam}
      >
        {camOn ? <VideoIcon /> : <VideoOff />}
      </Button>
      <Button
        variant={sharing ? "default" : "secondary"}
        size="icon"
        onClick={onToggleShare}
      >
        <MonitorUp />
      </Button>
      <Button
        variant={chatOpen ? "default" : "secondary"}
        size="icon"
        onClick={onToggleChat}
      >
        <MessageSquare />
      </Button>
      <Button variant="destructive" size="icon" onClick={onLeave}>
        <PhoneOff />
      </Button>
    </div>
  )
}
```

- [ ] **Step 6: Thread screen props through `Room`**

Replace the entire contents of `frontend/src/components/Room.tsx`:
```tsx
import { useState } from 'react'
import type { LocalVideoTrack, RemoteParticipant, Room as TwilioRoom } from 'twilio-video'
import type { ChatMessage } from '@/hooks/useRoom'
import { ChatPanel } from './ChatPanel'
import { ControlBar } from './ControlBar'
import { ParticipantGrid } from './ParticipantGrid'

interface RoomProps {
  room: TwilioRoom
  identity: string
  participants: RemoteParticipant[]
  messages: ChatMessage[]
  screenTrack: LocalVideoTrack | null
  onSend: (text: string) => void
  onToggleShare: () => void
  onLeave: () => void
}

export function Room({
  room,
  identity,
  participants,
  messages,
  screenTrack,
  onSend,
  onToggleShare,
  onLeave,
}: RoomProps) {
  const [chatOpen, setChatOpen] = useState(false)

  return (
    <div className="flex h-svh flex-col">
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto p-4">
          <ParticipantGrid
            room={room}
            identity={identity}
            participants={participants}
            screenTrack={screenTrack}
          />
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
        sharing={screenTrack !== null}
        onToggleChat={() => setChatOpen((open) => !open)}
        onToggleShare={onToggleShare}
        onLeave={onLeave}
      />
    </div>
  )
}
```

- [ ] **Step 7: Wire `App` to the new `useRoom` values**

Replace the entire contents of `frontend/src/App.tsx`:
```tsx
import { useState } from 'react'
import { Lobby } from '@/components/Lobby'
import { Room } from '@/components/Room'
import { useRoom } from '@/hooks/useRoom'

export function App() {
  const {
    room,
    participants,
    messages,
    status,
    error,
    join,
    leave,
    sendMessage,
    screenTrack,
    toggleScreenShare,
  } = useRoom()
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
        screenTrack={screenTrack}
        onSend={(text) => sendMessage(text, identity)}
        onToggleShare={toggleScreenShare}
        onLeave={leave}
      />
    )
  }

  return <Lobby onJoin={handleJoin} connecting={status === 'connecting'} error={error} />
}

export default App
```

- [ ] **Step 8: Verify build/test/lint**

Run: `npm run build && npm test && npm run lint`
Expected: build succeeds, tests pass, lint clean.

- [ ] **Step 9: Commit**

```bash
git add src/hooks/useRoom.ts src/components/LocalScreen.tsx src/components/ParticipantGrid.tsx src/components/ControlBar.tsx src/components/Room.tsx src/App.tsx
git commit -m "feat(frontend): own screen share in useRoom and show local screen tile"
```

---

## Task 3: Network-quality bars

**Files:**
- Create: `frontend/src/hooks/useNetworkLevel.ts`, `frontend/src/components/NetworkBars.tsx`
- Modify: `frontend/src/hooks/useRoom.ts`, `frontend/src/components/Participant.tsx`, `frontend/src/components/LocalVideo.tsx`

- [ ] **Step 1: Request network quality from Twilio**

In `frontend/src/hooks/useRoom.ts`, find the `connect()` call:
```ts
        const connected = await connect(token, {
          name: roomName,
          audio: true,
          video: withVideo ? { width: 640 } : false,
        })
```
and add the `networkQuality` option:
```ts
        const connected = await connect(token, {
          name: roomName,
          audio: true,
          video: withVideo ? { width: 640 } : false,
          networkQuality: { local: 1, remote: 1 },
        })
```

- [ ] **Step 2: Create the network-level hook**

Create `frontend/src/hooks/useNetworkLevel.ts`:
```ts
import { useEffect, useState } from 'react'
import type { LocalParticipant, RemoteParticipant } from 'twilio-video'

// Twilio reports network quality as 0 (worst) to 5 (best), or null before the
// first measurement. Works for the local participant and remote participants.
export function useNetworkLevel(
  participant: LocalParticipant | RemoteParticipant,
): number | null {
  const [level, setLevel] = useState<number | null>(
    participant.networkQualityLevel ?? null,
  )

  useEffect(() => {
    setLevel(participant.networkQualityLevel ?? null)
    const handler = (newLevel: number | null) => setLevel(newLevel)
    participant.on('networkQualityLevelChanged', handler)
    return () => {
      participant.removeListener('networkQualityLevelChanged', handler)
    }
  }, [participant])

  return level
}
```

- [ ] **Step 3: Create the bars component**

Create `frontend/src/components/NetworkBars.tsx`:
```tsx
interface NetworkBarsProps {
  level: number | null
}

// Five bars of increasing height; the first `level` are highlighted.
export function NetworkBars({ level }: NetworkBarsProps) {
  const active = level ?? 0
  return (
    <div
      className="flex items-end gap-0.5"
      title={`Network quality: ${level ?? 'unknown'}/5`}
    >
      {[1, 2, 3, 4, 5].map((bar) => (
        <span
          key={bar}
          className={`w-0.5 rounded-sm ${bar <= active ? 'bg-green-400' : 'bg-white/40'}`}
          style={{ height: `${bar * 2 + 2}px` }}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Show bars on remote tiles**

In `frontend/src/components/Participant.tsx`, add these imports at the top (below the existing imports):
```ts
import { useNetworkLevel } from '@/hooks/useNetworkLevel'
import { NetworkBars } from './NetworkBars'
```
Inside the component body, after the `useState`/`useRef` lines, add:
```ts
  const networkLevel = useNetworkLevel(participant)
```
Then add a bars overlay in the returned JSX, immediately after the identity `<span>`:
```tsx
      <div className="absolute top-1 right-1 rounded bg-black/50 px-1 py-0.5">
        <NetworkBars level={networkLevel} />
      </div>
```

- [ ] **Step 5: Show bars on your own tile**

In `frontend/src/components/LocalVideo.tsx`, add imports at the top (below existing):
```ts
import { useNetworkLevel } from '@/hooks/useNetworkLevel'
import { NetworkBars } from './NetworkBars'
```
Inside the component body (after the `useRef` line), add:
```ts
  const networkLevel = useNetworkLevel(room.localParticipant)
```
Add the bars overlay in the returned JSX, immediately after the identity `<span>`:
```tsx
      <div className="absolute top-1 right-1 rounded bg-black/50 px-1 py-0.5">
        <NetworkBars level={networkLevel} />
      </div>
```

- [ ] **Step 6: Verify build/test/lint**

Run: `npm run build && npm test && npm run lint`
Expected: build succeeds, tests pass, lint clean.

- [ ] **Step 7: Commit**

```bash
git add src/hooks/useRoom.ts src/hooks/useNetworkLevel.ts src/components/NetworkBars.tsx src/components/Participant.tsx src/components/LocalVideo.tsx
git commit -m "feat(frontend): per-participant network quality bars"
```

---

## Task 4: Remote mute/camera indicators

**Files:**
- Create: `frontend/src/hooks/useRemoteMediaState.ts`
- Modify: `frontend/src/components/Participant.tsx`

- [ ] **Step 1: Create the remote media-state hook**

Create `frontend/src/hooks/useRemoteMediaState.ts`:
```ts
import { useEffect, useState } from 'react'
import type { RemoteParticipant } from 'twilio-video'

export interface RemoteMediaState {
  audioEnabled: boolean
  videoEnabled: boolean
}

// True when the participant currently publishes an enabled track of that kind.
function snapshot(participant: RemoteParticipant): RemoteMediaState {
  let audioEnabled = false
  let videoEnabled = false
  participant.audioTracks.forEach((pub) => {
    if (pub.isTrackEnabled) audioEnabled = true
  })
  participant.videoTracks.forEach((pub) => {
    if (pub.isTrackEnabled) videoEnabled = true
  })
  return { audioEnabled, videoEnabled }
}

export function useRemoteMediaState(participant: RemoteParticipant): RemoteMediaState {
  const [state, setState] = useState<RemoteMediaState>(() => snapshot(participant))

  useEffect(() => {
    const update = () => setState(snapshot(participant))
    update()
    participant.on('trackEnabled', update)
    participant.on('trackDisabled', update)
    participant.on('trackSubscribed', update)
    participant.on('trackUnsubscribed', update)
    return () => {
      participant.removeListener('trackEnabled', update)
      participant.removeListener('trackDisabled', update)
      participant.removeListener('trackSubscribed', update)
      participant.removeListener('trackUnsubscribed', update)
    }
  }, [participant])

  return state
}
```

- [ ] **Step 2: Render the badges (full rewrite of `Participant.tsx`)**

Replace the entire contents of `frontend/src/components/Participant.tsx`:
```tsx
import { useEffect, useRef } from "react"
import { MicOff, VideoOff } from "lucide-react"
import type { RemoteParticipant, RemoteTrack } from "twilio-video"
import { useNetworkLevel } from "@/hooks/useNetworkLevel"
import { useRemoteMediaState } from "@/hooks/useRemoteMediaState"
import { NetworkBars } from "./NetworkBars"

interface ParticipantProps {
  participant: RemoteParticipant
}

export function Participant({ participant }: ParticipantProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const networkLevel = useNetworkLevel(participant)
  const { audioEnabled, videoEnabled } = useRemoteMediaState(participant)

  useEffect(() => {
    const attach = (track: RemoteTrack) => {
      if (track.kind === "video" && videoRef.current) {
        track.attach(videoRef.current)
      } else if (track.kind === "audio" && audioRef.current) {
        track.attach(audioRef.current)
      }
    }
    const detach = (track: RemoteTrack) => {
      if (track.kind === "video" || track.kind === "audio") {
        track.detach().forEach((el) => el.remove())
      }
    }

    participant.tracks.forEach((pub) => {
      if (pub.track) attach(pub.track)
    })
    participant.on("trackSubscribed", attach)
    participant.on("trackUnsubscribed", detach)
    return () => {
      participant.removeListener("trackSubscribed", attach)
      participant.removeListener("trackUnsubscribed", detach)
    }
  }, [participant])

  return (
    <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="h-full w-full object-cover"
      />
      <audio ref={audioRef} autoPlay />
      {!videoEnabled && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          {participant.identity}
        </div>
      )}
      <span className="absolute bottom-1 left-1 flex items-center gap-1 rounded bg-black/50 px-1.5 py-0.5 text-xs text-white">
        {!audioEnabled && <MicOff className="h-3 w-3" />}
        {participant.identity}
      </span>
      <div className="absolute top-1 right-1 flex items-center gap-1 rounded bg-black/50 px-1 py-0.5">
        {!videoEnabled && <VideoOff className="h-3 w-3 text-white" />}
        <NetworkBars level={networkLevel} />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify build/test/lint**

Run: `npm run build && npm test && npm run lint`
Expected: build succeeds, tests pass, lint clean.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useRemoteMediaState.ts src/components/Participant.tsx
git commit -m "feat(frontend): remote mute/camera indicators on tiles"
```

---

## Task 5: Active-speaker highlight

**Files:**
- Modify: `frontend/src/hooks/useRoom.ts`, `frontend/src/components/ParticipantGrid.tsx`, `frontend/src/components/Participant.tsx`, `frontend/src/components/Room.tsx`, `frontend/src/App.tsx`

- [ ] **Step 1: Enable dominant speaker + track it in `useRoom`**

In `frontend/src/hooks/useRoom.ts`, add `dominantSpeaker: true` to the `connect()` options (alongside `networkQuality`):
```ts
        const connected = await connect(token, {
          name: roomName,
          audio: true,
          video: withVideo ? { width: 640 } : false,
          networkQuality: { local: 1, remote: 1 },
          dominantSpeaker: true,
        })
```

Add state near the other `useState` declarations:
```ts
  const [dominantSpeakerSid, setDominantSpeakerSid] = useState<string | null>(null)
```

Inside `join`, register a handler and clean it up. Add after the `handleParticipantLeft` declaration:
```ts
        const handleDominantSpeaker = (participant: RemoteParticipant | null) =>
          setDominantSpeakerSid(participant?.sid ?? null)
```
Register it with the other `connected.on(...)` calls:
```ts
        connected.on("dominantSpeakerChanged", handleDominantSpeaker)
```
In `handleDisconnected`, remove the listener and reset (add alongside the other `removeListener` calls and resets):
```ts
          connected.removeListener("dominantSpeakerChanged", handleDominantSpeaker)
          setDominantSpeakerSid(null)
```

Add `dominantSpeakerSid` to the returned object:
```ts
    dominantSpeakerSid,
```

- [ ] **Step 2: Pass the dominant sid through the grid**

Replace the entire contents of `frontend/src/components/ParticipantGrid.tsx`:
```tsx
import type { LocalVideoTrack, RemoteParticipant, Room } from 'twilio-video'
import { gridColsForCount } from '@/lib/grid'
import { LocalScreen } from './LocalScreen'
import { LocalVideo } from './LocalVideo'
import { Participant } from './Participant'

interface ParticipantGridProps {
  room: Room
  identity: string
  participants: RemoteParticipant[]
  screenTrack: LocalVideoTrack | null
  dominantSpeakerSid: string | null
}

export function ParticipantGrid({
  room,
  identity,
  participants,
  screenTrack,
  dominantSpeakerSid,
}: ParticipantGridProps) {
  const tileCount = 1 + (screenTrack ? 1 : 0) + participants.length
  const cols = gridColsForCount(tileCount)
  return (
    <div
      className="mx-auto grid w-full max-w-5xl gap-4"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      <LocalVideo room={room} identity={identity} />
      {screenTrack && <LocalScreen track={screenTrack} />}
      {participants.map((p) => (
        <Participant
          key={p.sid}
          participant={p}
          isDominant={p.sid === dominantSpeakerSid}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Add the highlight ring to `Participant`**

In `frontend/src/components/Participant.tsx`, change the props interface and signature to accept `isDominant`:
```tsx
interface ParticipantProps {
  participant: RemoteParticipant
  isDominant: boolean
}

export function Participant({ participant, isDominant }: ParticipantProps) {
```
Change the outer tile `<div>` className to add a ring when dominant:
```tsx
    <div
      className={`relative aspect-video overflow-hidden rounded-lg bg-muted ${
        isDominant ? "ring-2 ring-green-400" : ""
      }`}
    >
```

- [ ] **Step 4: Thread `dominantSpeakerSid` through `Room`**

In `frontend/src/components/Room.tsx`, add `dominantSpeakerSid: string | null` to `RoomProps`, destructure it, and pass it to `ParticipantGrid`. The updated interface and the grid usage:
```tsx
interface RoomProps {
  room: TwilioRoom
  identity: string
  participants: RemoteParticipant[]
  messages: ChatMessage[]
  screenTrack: LocalVideoTrack | null
  dominantSpeakerSid: string | null
  onSend: (text: string) => void
  onToggleShare: () => void
  onLeave: () => void
}
```
Add `dominantSpeakerSid` to the destructured params, and update the grid element:
```tsx
          <ParticipantGrid
            room={room}
            identity={identity}
            participants={participants}
            screenTrack={screenTrack}
            dominantSpeakerSid={dominantSpeakerSid}
          />
```

- [ ] **Step 5: Pass `dominantSpeakerSid` from `App`**

In `frontend/src/App.tsx`, add `dominantSpeakerSid` to the `useRoom()` destructure and pass it to `<Room>`:
```tsx
  const {
    room,
    participants,
    messages,
    status,
    error,
    join,
    leave,
    sendMessage,
    screenTrack,
    toggleScreenShare,
    dominantSpeakerSid,
  } = useRoom()
```
and in the `<Room ... />` element add:
```tsx
        dominantSpeakerSid={dominantSpeakerSid}
```

- [ ] **Step 6: Verify build/test/lint**

Run: `npm run build && npm test && npm run lint`
Expected: build succeeds, tests pass, lint clean.

- [ ] **Step 7: Commit**

```bash
git add src/hooks/useRoom.ts src/components/ParticipantGrid.tsx src/components/Participant.tsx src/components/Room.tsx src/App.tsx
git commit -m "feat(frontend): active-speaker highlight via dominant speaker"
```

---

## Task 6: Reconnecting banner

**Files:**
- Modify: `frontend/src/hooks/useRoom.ts`, `frontend/src/components/Room.tsx`, `frontend/src/App.tsx`

- [ ] **Step 1: Track connection state in `useRoom`**

In `frontend/src/hooks/useRoom.ts`, add a type alias near `RoomStatus`:
```ts
export type ConnectionState = "connected" | "reconnecting"
```
Add state near the other `useState` declarations:
```ts
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("connected")
```
Inside `join`, after `setRoom(connected)` set it to connected and register handlers. Add handler declarations alongside the others:
```ts
        const handleReconnecting = () => setConnectionState("reconnecting")
        const handleReconnected = () => setConnectionState("connected")
```
Register with the other `connected.on(...)` calls:
```ts
        connected.on("reconnecting", handleReconnecting)
        connected.on("reconnected", handleReconnected)
```
In `handleDisconnected`, remove the listeners (alongside the other `removeListener` calls):
```ts
          connected.removeListener("reconnecting", handleReconnecting)
          connected.removeListener("reconnected", handleReconnected)
          setConnectionState("connected")
```
Add `connectionState` to the returned object:
```ts
    connectionState,
```

- [ ] **Step 2: Show the banner in `Room`**

In `frontend/src/components/Room.tsx`, import the type and add the prop. Add `ConnectionState` to the type import from `@/hooks/useRoom`:
```tsx
import type { ChatMessage, ConnectionState } from '@/hooks/useRoom'
```
Add `connectionState: ConnectionState` to `RoomProps`, destructure it, and render a banner above the content area. The banner goes as the first child inside the outer `<div className="flex h-svh flex-col">`:
```tsx
      {connectionState === 'reconnecting' && (
        <div className="bg-yellow-500/90 py-1 text-center text-sm text-black">
          Reconnecting…
        </div>
      )}
```

- [ ] **Step 3: Pass `connectionState` from `App`**

In `frontend/src/App.tsx`, add `connectionState` to the `useRoom()` destructure and pass it to `<Room>`:
```tsx
    connectionState,
```
and in the `<Room ... />` element:
```tsx
        connectionState={connectionState}
```

- [ ] **Step 4: Verify build/test/lint**

Run: `npm run build && npm test && npm run lint`
Expected: build succeeds, tests pass, lint clean.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useRoom.ts src/components/Room.tsx src/App.tsx
git commit -m "feat(frontend): reconnecting banner on connection drops"
```

---

## Task 7: Room header (count + copy-link) and ?room= prefill

**Files:**
- Modify: `frontend/src/components/Room.tsx`, `frontend/src/App.tsx`, `frontend/src/components/Lobby.tsx`

- [ ] **Step 1: Add the header to `Room`**

In `frontend/src/components/Room.tsx`, add these imports (below the existing imports):
```tsx
import { useState } from 'react'
import { Link as LinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
```
(Note: `useState` is already imported — do not duplicate it; only add `LinkIcon` and `Button`.)

Inside the component, add a copy handler (after the existing `useState` for `chatOpen`):
```tsx
  const [copied, setCopied] = useState(false)
  const copyLink = async () => {
    const link = `${location.origin}${location.pathname}?room=${encodeURIComponent(room.name)}`
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard unavailable (e.g. insecure context); ignore.
    }
  }
```

Render a header bar as the first child inside the outer `<div className="flex h-svh flex-col">` (above the reconnecting banner):
```tsx
      <header className="flex items-center justify-between border-b px-4 py-2">
        <div className="text-sm">
          <span className="font-medium">{room.name}</span>
          <span className="ml-2 text-muted-foreground">
            {participants.length + 1} in call
          </span>
        </div>
        <Button variant="secondary" size="sm" onClick={copyLink}>
          <LinkIcon className="mr-1 h-4 w-4" />
          {copied ? 'Copied!' : 'Copy link'}
        </Button>
      </header>
```

- [ ] **Step 2: Set the URL on join in `App`**

In `frontend/src/App.tsx`, update `handleJoin` to record the room in the URL:
```tsx
  const handleJoin = (name: string, roomName: string, withVideo: boolean) => {
    setIdentity(name)
    window.history.replaceState(null, '', `?room=${encodeURIComponent(roomName)}`)
    join(name, roomName, withVideo)
  }
```

- [ ] **Step 3: Pre-fill the room field in `Lobby`**

In `frontend/src/components/Lobby.tsx`, change the `room` state initializer to read `?room=`:
```tsx
  const [room, setRoom] = useState(
    () => new URLSearchParams(window.location.search).get('room') ?? '',
  )
```
(Leave the `identity` state and everything else unchanged.)

- [ ] **Step 4: Verify build/test/lint**

Run: `npm run build && npm test && npm run lint`
Expected: build succeeds, tests pass, lint clean.

- [ ] **Step 5: Commit**

```bash
git add src/components/Room.tsx src/App.tsx src/components/Lobby.tsx
git commit -m "feat(frontend): room header with count and copy-link, ?room= prefill"
```

---

## Task 8: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Automated gate**

Run (from `frontend/`): `npm run build && npm test && npm run lint`
Expected: build succeeds, all tests pass, lint clean.

- [ ] **Step 2: Manual two-tab check (user, with credentials)**

Start backend (`npm run dev` in `backend/`) and frontend (`npm run dev` in `frontend/`). Open two tabs, join the same room with different names. Verify:
- Grid reflows as people join (1→1 col, 2→2 cols).
- Network bars show on every tile.
- Muting mic in one tab → mic-off badge appears on that person's tile in the other tab.
- Turning off camera → camera-off overlay + the person's name placeholder.
- Talking → the speaker's tile gets a green ring in the other tab (your own never rings — expected).
- Sharing your screen → a "You (screen)" tile appears in your own grid and a tile in the other tab.
- Header shows the room name and "2 in call"; "Copy link" copies a `…?room=` URL; opening it pre-fills the room field.
- Briefly disabling wifi shows the "Reconnecting…" banner, then it clears on recovery.

- [ ] **Step 3: Final commit**

```bash
git commit --allow-empty -m "chore: verify Tier-1 features end-to-end"
```

---

## Notes for the engineer

- **`networkQualityLevel` may be `null`** until the first measurement arrives; `NetworkBars` renders an empty (neutral) state for `null` — don't treat `null` as an error.
- **Dominant speaker is remote-only:** Twilio never reports the local participant as dominant, so your own tile never gets the ring. This is expected, not a bug.
- **Type-check via `npm run build`** every task — the `typecheck` script alone won't catch errors in `src`.
- Keep every Twilio event listener paired with a `removeListener` in cleanup, matching the existing pattern in `useRoom`/`Participant`.
