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
