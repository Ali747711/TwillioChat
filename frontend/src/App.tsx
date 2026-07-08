import { useState } from "react"
import { Lobby } from "@/components/Lobby"
import { Room } from "@/components/Room"
import { WaitingScreen } from "@/components/WaitingScreen"
import { useRoom } from "@/hooks/useRoom"
import { encodeIdentity, parseIdentity, type Role } from "@/lib/interview"

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
    dominantSpeakerSid,
    connectionState,
    admitted,
    admittedSids,
    admitCandidate,
    previewTrack,
  } = useRoom()
  const [identity, setIdentity] = useState("")
  const [role, setRole] = useState<Role>("interviewer")

  const handleJoin = (
    name: string,
    roomName: string,
    withVideo: boolean,
    joinRole: Role
  ) => {
    const encoded = encodeIdentity(joinRole, name)
    setIdentity(encoded)
    setRole(joinRole)
    const params = new URLSearchParams({ room: roomName })
    if (joinRole === "candidate") params.set("role", "candidate")
    window.history.replaceState(null, "", `?${params.toString()}`)
    join(encoded, roomName, withVideo, joinRole)
  }

  if (room && status === "connected") {
    if (role === "candidate" && !admitted) {
      return (
        <WaitingScreen
          identityName={parseIdentity(identity).name}
          previewTrack={previewTrack}
          onLeave={leave}
        />
      )
    }
    return (
      <Room
        room={room}
        identity={identity}
        role={role}
        participants={participants}
        admittedSids={admittedSids}
        messages={messages}
        screenTrack={screenTrack}
        dominantSpeakerSid={dominantSpeakerSid}
        connectionState={connectionState}
        onAdmit={admitCandidate}
        onSend={(text) => sendMessage(text, identity)}
        onToggleShare={toggleScreenShare}
        onLeave={leave}
      />
    )
  }

  return (
    <Lobby
      onJoin={handleJoin}
      connecting={status === "connecting"}
      error={error}
    />
  )
}

export default App
