import { useCallback, useReducer, useRef, useState } from "react"
import {
  connect,
  LocalDataTrack,
  type RemoteParticipant,
  type RemoteTrack,
  type Room,
} from "twilio-video"
import { fetchToken } from "@/lib/twilioClient"
import { participantsReducer } from "./participants"

export interface ChatMessage {
  from: string
  text: string
  at: number
}

export type RoomStatus = "idle" | "connecting" | "connected" | "error"

export function useRoom() {
  const [room, setRoom] = useState<Room | null>(null)
  const [participants, dispatch] = useReducer(participantsReducer, [])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [status, setStatus] = useState<RoomStatus>("idle")
  const [error, setError] = useState<string | null>(null)
  const dataTrackRef = useRef<LocalDataTrack | null>(null)
  const teardownsRef = useRef<Array<() => void>>([])

  const addMessage = useCallback((from: string, text: string) => {
    setMessages((prev) => [...prev, { from, text, at: Date.now() }])
  }, [])

  const watchParticipant = useCallback(
    (participant: RemoteParticipant) => {
      dispatch({ type: "add", participant })
      const listenForData = (track: RemoteTrack) => {
        if (track.kind !== "data") return
        track.on("message", (data) => {
          if (typeof data === "string") addMessage(participant.identity, data)
        })
      }
      participant.tracks.forEach((pub) => {
        if (pub.track) listenForData(pub.track)
      })
      participant.on("trackSubscribed", listenForData)
      teardownsRef.current.push(() =>
        participant.off("trackSubscribed", listenForData)
      )
    },
    [addMessage]
  )

  const join = useCallback(
    async (identity: string, roomName: string, withVideo: boolean) => {
      setStatus("connecting")
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

        teardownsRef.current = []

        const handleParticipantLeft = (p: RemoteParticipant) =>
          dispatch({ type: "remove", participant: p })

        const handleDisconnected = () => {
          connected.off("participantConnected", watchParticipant)
          connected.off("participantDisconnected", handleParticipantLeft)
          connected.off("disconnected", handleDisconnected)
          teardownsRef.current.forEach((fn) => fn())
          teardownsRef.current = []
          dispatch({ type: "clear" })
          setMessages([])
          setRoom(null)
          setStatus("idle")
        }

        connected.participants.forEach(watchParticipant)
        connected.on("participantConnected", watchParticipant)
        connected.on("participantDisconnected", handleParticipantLeft)
        connected.on("disconnected", handleDisconnected)

        setRoom(connected)
        setStatus("connected")
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to join the room")
        setStatus("error")
      }
    },
    [watchParticipant]
  )

  const leave = useCallback(() => {
    room?.disconnect()
  }, [room])

  const sendMessage = useCallback(
    (text: string, from: string) => {
      dataTrackRef.current?.send(text)
      addMessage(from, text)
    },
    [addMessage]
  )

  return {
    room,
    participants,
    messages,
    status,
    error,
    join,
    leave,
    sendMessage,
  }
}
