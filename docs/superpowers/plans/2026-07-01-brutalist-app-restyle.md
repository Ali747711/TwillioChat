# Brutalist Restyle of the Call App — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the `/app` Lobby and in-call Room into the neo-brutalist design system, changing only presentation — Twilio logic, state, handlers, refs, and props stay identical.

**Architecture:** Two new brutalist primitives (`StudioInput`, `StudioIconButton`) plus a `disabled` prop on the existing `StudioButton`. Each call component is rewritten preserving its logic exactly, swapping shadcn primitives + classes for the studio tokens. No hook, `lib/`, or prop-signature changes.

**Tech Stack:** React 19, Vite, Tailwind v4, lucide-react, twilio-video, Vitest.

**Conventions:**
- Run npm/git from `/Users/mac/Desktop/Projects/twilio/frontend`.
- Type-check with `npm run build` (NOT `npm run typecheck`).
- Per-task gate before commit: `npm run build && npm test && npm run lint` all pass. The existing 16 tests must stay green (this is a pure restyle).
- Type-only imports use `import type` (`verbatimModuleSyntax` on). A formatter hook may reformat after edits.
- **Do NOT change any logic:** keep every `onClick`, `useState`, `useEffect`, ref, `track.attach()`, hook call, and prop signature exactly as shown. Only classes/markup/primitives change.
- Studio tokens already exist in `index.css`: `bg-studio-bg`, `border-studio-border`, `text-studio-muted`, `bg-studio-orange`/`text-studio-orange`.

---

## Task 1: Brutalist primitives

**Files:** modify `src/components/studio/StudioButton.tsx`; create `src/components/studio/StudioInput.tsx`, `src/components/studio/StudioIconButton.tsx`.

- [ ] **Step 1: Add a `disabled` prop to `StudioButton`.** Replace the entire contents of `src/components/studio/StudioButton.tsx`:
```tsx
import type { ReactNode } from 'react'

interface StudioButtonProps {
  children: ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
}

// Solid safety-orange, black uppercase bold, square edges; inverts to white on
// hover; dimmed + non-interactive when disabled.
export function StudioButton({
  children,
  onClick,
  className = '',
  disabled = false,
}: StudioButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-none bg-studio-orange px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] text-black transition-colors duration-200 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-studio-orange ${className}`}
    >
      {children}
    </button>
  )
}
```

- [ ] **Step 2: Create `src/components/studio/StudioInput.tsx`:**
```tsx
import type { InputHTMLAttributes } from 'react'

// Brutalist input: transparent, bottom rule only, orange focus underline.
// Forwards all native input props (value, onChange, onKeyDown, id, disabled, …).
export function StudioInput({
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-none border-0 border-b border-studio-border bg-transparent px-0 py-2 text-white placeholder:text-studio-muted placeholder:uppercase placeholder:tracking-[0.15em] focus:border-studio-orange focus:outline-none ${className}`}
    />
  )
}
```

- [ ] **Step 3: Create `src/components/studio/StudioIconButton.tsx`:**
```tsx
import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface StudioIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  active?: boolean
  variant?: 'default' | 'danger'
}

// Square icon button. default: bordered/transparent (hover invert). active:
// solid orange. danger: solid orange (used for the leave button).
export function StudioIconButton({
  children,
  active = false,
  variant = 'default',
  className = '',
  ...props
}: StudioIconButtonProps) {
  const base =
    'flex h-10 w-10 items-center justify-center rounded-none border transition-colors duration-200'
  const state =
    variant === 'danger'
      ? 'border-studio-orange bg-studio-orange text-black hover:border-white hover:bg-white'
      : active
        ? 'border-studio-orange bg-studio-orange text-black'
        : 'border-studio-border bg-transparent text-white hover:border-white'
  return (
    <button type="button" className={`${base} ${state} ${className}`} {...props}>
      {children}
    </button>
  )
}
```

- [ ] **Step 4: Verify** — `npm run build && npm test && npm run lint`.
- [ ] **Step 5: Commit**
```bash
git add src/components/studio/StudioButton.tsx src/components/studio/StudioInput.tsx src/components/studio/StudioIconButton.tsx
git commit -m "feat(studio): add StudioInput + StudioIconButton, disabled StudioButton"
```

---

## Task 2: Lobby restyle

**Files:** modify `src/components/Lobby.tsx` (full rewrite; logic identical).

- [ ] **Step 1: Replace the entire contents of `src/components/Lobby.tsx`:**
```tsx
import { useState } from "react"
import { GrainOverlay } from "./studio/GrainOverlay"
import { StudioButton } from "./studio/StudioButton"
import { StudioInput } from "./studio/StudioInput"

interface LobbyProps {
  onJoin: (identity: string, room: string, withVideo: boolean) => void
  connecting: boolean
  error: string | null
}

export function Lobby({ onJoin, connecting, error }: LobbyProps) {
  const [identity, setIdentity] = useState("")
  const [room, setRoom] = useState(
    () => new URLSearchParams(window.location.search).get("room") ?? ""
  )
  const [audioOnly, setAudioOnly] = useState(false)
  const canJoin = identity.trim() !== "" && room.trim() !== "" && !connecting

  const labelClass =
    "text-[11px] font-semibold uppercase tracking-[0.15em] text-studio-muted"

  return (
    <main className="relative flex min-h-svh items-center justify-center bg-studio-bg p-6 text-white">
      <GrainOverlay />
      <div className="relative z-10 w-full max-w-sm border border-studio-border bg-studio-bg/80 p-8">
        <h1 className="mb-8 text-2xl font-bold uppercase tracking-[-0.02em]">
          Join a Call
        </h1>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className={labelClass}>
              Your name
            </label>
            <StudioInput
              id="name"
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
              placeholder="Ada"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="room" className={labelClass}>
              Room name
            </label>
            <StudioInput
              id="room"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="Standup"
            />
          </div>
          <label className={`flex cursor-pointer items-center gap-2 ${labelClass}`}>
            <input
              type="checkbox"
              checked={audioOnly}
              onChange={(e) => setAudioOnly(e.target.checked)}
              className="h-4 w-4 rounded-none accent-studio-orange"
            />
            Audio-only (no camera)
          </label>
          {error && (
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-studio-orange">
              {error}
            </p>
          )}
          <StudioButton
            className="w-full"
            disabled={!canJoin}
            onClick={() => onJoin(identity.trim(), room.trim(), !audioOnly)}
          >
            {connecting ? "Joining…" : "Join"}
          </StudioButton>
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Verify** — `npm run build && npm test && npm run lint`.
- [ ] **Step 3: Commit**
```bash
git add src/components/Lobby.tsx
git commit -m "feat(app): brutalist lobby restyle"
```

---

## Task 3: Video tiles + network bars

**Files:** full rewrites of `src/components/NetworkBars.tsx`, `src/components/Participant.tsx`, `src/components/LocalVideo.tsx`, `src/components/LocalScreen.tsx` (logic identical; classes only).

- [ ] **Step 1: Replace `src/components/NetworkBars.tsx`:**
```tsx
interface NetworkBarsProps {
  level: number | null
}

// Five square bars of increasing height; the first `level` are highlighted orange.
export function NetworkBars({ level }: NetworkBarsProps) {
  const active = level ?? 0
  return (
    <div
      className="flex items-end gap-0.5"
      title={`Network quality: ${level ?? "unknown"}/5`}
    >
      {[1, 2, 3, 4, 5].map((bar) => (
        <span
          key={bar}
          className={`w-0.5 rounded-none ${bar <= active ? "bg-studio-orange" : "bg-white/25"}`}
          style={{ height: `${bar * 2 + 2}px` }}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Replace `src/components/Participant.tsx`** (only the outer tile classes, ring color, and label styles change — the effect + hooks are byte-for-byte the same):
```tsx
import { useEffect, useRef } from "react"
import { MicOff, VideoOff } from "lucide-react"
import type { RemoteParticipant, RemoteTrack } from "twilio-video"
import { useNetworkLevel } from "@/hooks/useNetworkLevel"
import { useRemoteMediaState } from "@/hooks/useRemoteMediaState"
import { NetworkBars } from "./NetworkBars"

interface ParticipantProps {
  participant: RemoteParticipant
  isDominant: boolean
}

export function Participant({ participant, isDominant }: ParticipantProps) {
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
    <div
      className={`relative aspect-video overflow-hidden rounded-none border bg-studio-bg ${
        isDominant ? "border-studio-orange ring-2 ring-studio-orange" : "border-studio-border"
      }`}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="h-full w-full object-cover"
      />
      <audio ref={audioRef} autoPlay />
      {!videoEnabled && (
        <div className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold uppercase tracking-[0.15em] text-studio-muted">
          {participant.identity}
        </div>
      )}
      <span className="absolute bottom-1 left-1 flex items-center gap-1 bg-black/60 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-white">
        {!audioEnabled && <MicOff className="h-3 w-3 text-studio-orange" />}
        {participant.identity}
      </span>
      <div className="absolute top-1 right-1 flex items-center gap-1 bg-black/60 px-1 py-0.5">
        {!videoEnabled && <VideoOff className="h-3 w-3 text-studio-orange" />}
        <NetworkBars level={networkLevel} />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Replace `src/components/LocalVideo.tsx`** (effect identical; classes only):
```tsx
import { useEffect, useRef } from "react"
import type { Room } from "twilio-video"
import { useNetworkLevel } from "@/hooks/useNetworkLevel"
import { NetworkBars } from "./NetworkBars"

interface LocalVideoProps {
  room: Room
  identity: string
}

export function LocalVideo({ room, identity }: LocalVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const networkLevel = useNetworkLevel(room.localParticipant)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const elements: HTMLElement[] = []
    room.localParticipant.videoTracks.forEach((pub) => {
      if (pub.track) {
        const el = pub.track.attach()
        el.className = "h-full w-full object-cover"
        container.appendChild(el)
        elements.push(el)
      }
    })
    return () => {
      elements.forEach((el) => el.remove())
    }
  }, [room])

  return (
    <div className="relative aspect-video overflow-hidden rounded-none border border-studio-border bg-studio-bg">
      <div ref={containerRef} className="h-full w-full" />
      <span className="absolute bottom-1 left-1 bg-black/60 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-white">
        {identity} (you)
      </span>
      <div className="absolute top-1 right-1 bg-black/60 px-1 py-0.5">
        <NetworkBars level={networkLevel} />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Replace `src/components/LocalScreen.tsx`** (effect identical; classes only):
```tsx
import { useEffect, useRef } from "react"
import type { LocalVideoTrack } from "twilio-video"

interface LocalScreenProps {
  track: LocalVideoTrack
}

export function LocalScreen({ track }: LocalScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const el = track.attach()
    el.className = "h-full w-full bg-black object-contain"
    container.appendChild(el)
    return () => {
      el.remove()
    }
  }, [track])

  return (
    <div className="relative aspect-video overflow-hidden rounded-none border border-studio-border bg-studio-bg">
      <div ref={containerRef} className="h-full w-full" />
      <span className="absolute bottom-1 left-1 bg-black/60 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-white">
        You (screen)
      </span>
    </div>
  )
}
```

- [ ] **Step 5: Verify** — `npm run build && npm test && npm run lint`.
- [ ] **Step 6: Commit**
```bash
git add src/components/NetworkBars.tsx src/components/Participant.tsx src/components/LocalVideo.tsx src/components/LocalScreen.tsx
git commit -m "feat(app): brutalist video tiles + orange network bars"
```

---

## Task 4: Control bar

**Files:** full rewrite of `src/components/ControlBar.tsx` (handlers identical).

- [ ] **Step 1: Replace the entire contents of `src/components/ControlBar.tsx`:**
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
import { StudioIconButton } from "./studio/StudioIconButton"
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
    <div className="flex items-center justify-center gap-2 border-t border-studio-border bg-studio-bg p-3">
      <StudioIconButton
        aria-label="Toggle microphone"
        variant={micOn ? "default" : "danger"}
        onClick={toggleMic}
      >
        {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
      </StudioIconButton>
      <StudioIconButton
        aria-label="Toggle camera"
        variant={camOn ? "default" : "danger"}
        onClick={toggleCam}
      >
        {camOn ? <VideoIcon className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
      </StudioIconButton>
      <StudioIconButton
        aria-label="Share screen"
        active={sharing}
        onClick={onToggleShare}
      >
        <MonitorUp className="h-4 w-4" />
      </StudioIconButton>
      <StudioIconButton
        aria-label="Toggle chat"
        active={chatOpen}
        onClick={onToggleChat}
      >
        <MessageSquare className="h-4 w-4" />
      </StudioIconButton>
      <StudioIconButton aria-label="Leave call" variant="danger" onClick={onLeave}>
        <PhoneOff className="h-4 w-4" />
      </StudioIconButton>
    </div>
  )
}
```

- [ ] **Step 2: Verify** — `npm run build && npm test && npm run lint`.
- [ ] **Step 3: Commit**
```bash
git add src/components/ControlBar.tsx
git commit -m "feat(app): brutalist control bar"
```

---

## Task 5: Chat panel

**Files:** full rewrite of `src/components/ChatPanel.tsx` (submit logic identical).

- [ ] **Step 1: Replace the entire contents of `src/components/ChatPanel.tsx`:**
```tsx
import { useState } from "react"
import { StudioButton } from "./studio/StudioButton"
import { StudioInput } from "./studio/StudioInput"
import type { ChatMessage } from "@/hooks/useRoom"

interface ChatPanelProps {
  messages: ChatMessage[]
  identity: string
  onSend: (text: string) => void
}

export function ChatPanel({ messages, identity, onSend }: ChatPanelProps) {
  const [text, setText] = useState("")

  const submit = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    onSend(trimmed)
    setText("")
  }

  return (
    <div className="flex h-full flex-col bg-studio-bg">
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {messages.map((m, i) => (
          <div key={`${m.at}-${i}`} className="text-sm">
            <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-studio-orange">
              {m.from === identity ? "You" : m.from}
            </span>
            <span className="ml-2 text-white">{m.text}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 border-t border-studio-border p-3">
        <StudioInput
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit()
          }}
          placeholder="Message"
        />
        <StudioButton onClick={submit}>Send</StudioButton>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify** — `npm run build && npm test && npm run lint`.
- [ ] **Step 3: Commit**
```bash
git add src/components/ChatPanel.tsx
git commit -m "feat(app): brutalist chat panel"
```

---

## Task 6: Room chrome + final verification

**Files:** full rewrite of `src/components/Room.tsx` (layout + props identical; header/banner/aside restyled).

- [ ] **Step 1: Replace the entire contents of `src/components/Room.tsx`:**
```tsx
import { useState } from "react"
import { Link as LinkIcon } from "lucide-react"
import type {
  LocalVideoTrack,
  RemoteParticipant,
  Room as TwilioRoom,
} from "twilio-video"
import type { ChatMessage, ConnectionState } from "@/hooks/useRoom"
import { StudioButton } from "./studio/StudioButton"
import { ChatPanel } from "./ChatPanel"
import { ControlBar } from "./ControlBar"
import { ParticipantGrid } from "./ParticipantGrid"

interface RoomProps {
  room: TwilioRoom
  identity: string
  participants: RemoteParticipant[]
  messages: ChatMessage[]
  screenTrack: LocalVideoTrack | null
  dominantSpeakerSid: string | null
  connectionState: ConnectionState
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
  dominantSpeakerSid,
  connectionState,
  onSend,
  onToggleShare,
  onLeave,
}: RoomProps) {
  const [chatOpen, setChatOpen] = useState(false)
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

  return (
    <div className="flex h-svh flex-col bg-studio-bg text-white">
      {connectionState === "reconnecting" && (
        <div className="bg-studio-orange py-1 text-center text-[11px] font-semibold uppercase tracking-[0.15em] text-black">
          Reconnecting…
        </div>
      )}
      <header className="flex items-center justify-between border-b border-studio-border px-4 py-3">
        <div className="flex items-baseline gap-3">
          <span className="text-sm font-bold uppercase tracking-[-0.02em]">
            {room.name}
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-studio-muted">
            {participants.length + 1} in call
          </span>
        </div>
        <StudioButton className="px-3 py-2" onClick={copyLink}>
          <span className="flex items-center gap-1">
            <LinkIcon className="h-3 w-3" />
            {copied ? "Copied!" : "Copy link"}
          </span>
        </StudioButton>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto p-4">
          <ParticipantGrid
            room={room}
            identity={identity}
            participants={participants}
            screenTrack={screenTrack}
            dominantSpeakerSid={dominantSpeakerSid}
          />
        </div>
        {chatOpen && (
          <aside className="w-80 border-l border-studio-border">
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

- [ ] **Step 2: Verify** — `npm run build && npm test && npm run lint` (16 tests pass).
- [ ] **Step 3: Commit**
```bash
git add src/components/Room.tsx
git commit -m "feat(app): brutalist room chrome (header, banner, chat divider)"
```

- [ ] **Step 4: Manual (preview) check** — Lobby at `/app` renders brutalist (dark, bordered frame, orange Join, bottom-border inputs). Two-tab in-call: hard-edged tiles with `studio-border`, orange dominant ring, orange network bars, square control-bar buttons (orange for muted/active/leave), brutalist chat. All controls work (mute, camera, share, chat, leave). The `/` landing is unaffected.

---

## Notes for the engineer

- **No logic changes anywhere.** If a `npm run build` type error appears, it is a styling/prop-forwarding mistake — fix the classes/types, never the behavior.
- `ParticipantGrid.tsx` is intentionally NOT modified — it only lays out tiles; the brutalist look comes from the tile components it renders.
- The 16 existing tests (`participants`, `twilioClient`, `grid`, `clock`) are logic-only and must remain green untouched.
