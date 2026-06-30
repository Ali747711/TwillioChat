import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
            {connecting ? "Joining…" : "Join"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
