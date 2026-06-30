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
  const [dominantSpeakerSid, setDominantSpeakerSid] = useState<string | null>(
    null
  )
  const dataTrackRef = useRef<LocalDataTrack | null>(null)
  const teardownsRef = useRef<Array<() => void>>([])
  const screenTrackRef = useRef<LocalVideoTrack | null>(null)
  const [screenTrack, setScreenTrack] = useState<LocalVideoTrack | null>(null)

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
        participant.removeListener("trackSubscribed", listenForData)
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
          networkQuality: { local: 1, remote: 1 },
          dominantSpeaker: true,
        })

        const dataTrack = new LocalDataTrack()
        dataTrackRef.current = dataTrack
        await connected.localParticipant.publishTrack(dataTrack)

        teardownsRef.current = []

        const handleParticipantLeft = (p: RemoteParticipant) =>
          dispatch({ type: "remove", participant: p })

        const handleDominantSpeaker = (participant: RemoteParticipant | null) =>
          setDominantSpeakerSid(participant?.sid ?? null)

        const handleDisconnected = () => {
          if (screenTrackRef.current) {
            screenTrackRef.current.stop()
            screenTrackRef.current = null
            setScreenTrack(null)
          }
          connected.removeListener("participantConnected", watchParticipant)
          connected.removeListener(
            "participantDisconnected",
            handleParticipantLeft
          )
          connected.removeListener("disconnected", handleDisconnected)
          connected.removeListener(
            "dominantSpeakerChanged",
            handleDominantSpeaker
          )
          setDominantSpeakerSid(null)
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
        connected.on("dominantSpeakerChanged", handleDominantSpeaker)

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
        { once: true }
      )
    } catch {
      // User dismissed the screen picker; leave state unchanged.
    }
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
    screenTrack,
    toggleScreenShare,
    dominantSpeakerSid,
  }
}
