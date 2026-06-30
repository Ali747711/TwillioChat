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
