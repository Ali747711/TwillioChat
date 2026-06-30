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
