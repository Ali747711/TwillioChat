import { useCallback, useReducer, useRef, useState } from "react"
import {
  connect,
  createLocalAudioTrack,
  createLocalVideoTrack,
  LocalDataTrack,
  type LocalVideoTrack,
  type RemoteParticipant,
  type RemoteTrack,
  type Room,
} from "twilio-video"
import { fetchToken } from "@/lib/twilioClient"
import {
  makeAdmitMessage,
  parseControlMessage,
  type Role,
} from "@/lib/interview"
import { startScreenShare, stopScreenShare } from "@/lib/localMedia"
import { participantsReducer } from "./participants"

export interface ChatMessage {
  from: string
  text: string
  at: number
}

export type RoomStatus = "idle" | "connecting" | "connected" | "error"

export type ConnectionState = "connected" | "reconnecting"

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
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("connected")

  // Interview mode: candidates connect without publishing and wait for the
  // interviewer's admit signal. `previewTrack` is the candidate's local,
  // unpublished camera; `admitted` flips when the admit message arrives.
  const [admitted, setAdmitted] = useState(true)
  const [admittedSids, setAdmittedSids] = useState<ReadonlySet<string>>(
    () => new Set()
  )
  const [previewTrack, setPreviewTrack] = useState<LocalVideoTrack | null>(null)
  const previewTrackRef = useRef<LocalVideoTrack | null>(null)
  const admitSelfRef = useRef<() => void>(() => {})
  const selfSidRef = useRef<string | null>(null)

  const addMessage = useCallback((from: string, text: string) => {
    setMessages((prev) => [...prev, { from, text, at: Date.now() }])
  }, [])

  const watchParticipant = useCallback(
    (participant: RemoteParticipant) => {
      dispatch({ type: "add", participant })
      const listenForData = (track: RemoteTrack) => {
        if (track.kind !== "data") return
        track.on("message", (data) => {
          if (typeof data !== "string") return
          const control = parseControlMessage(data)
          if (control) {
            if (control.targetSid === selfSidRef.current) {
              admitSelfRef.current()
            }
            return
          }
          addMessage(participant.identity, data)
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
    async (
      identity: string,
      roomName: string,
      withVideo: boolean,
      role: Role
    ) => {
      setStatus("connecting")
      setError(null)
      try {
        const token = await fetchToken({ identity, room: roomName })
        const isCandidate = role === "candidate"

        // Candidates join the real room but publish nothing until admitted,
        // so the interviewer sees them arrive without seeing or hearing them.
        const connected = await connect(token, {
          name: roomName,
          audio: !isCandidate,
          video: !isCandidate && withVideo ? { width: 640 } : false,
          networkQuality: { local: 1, remote: 1 },
          dominantSpeaker: true,
        })

        const dataTrack = new LocalDataTrack()
        dataTrackRef.current = dataTrack
        await connected.localParticipant.publishTrack(dataTrack)

        selfSidRef.current = connected.localParticipant.sid
        setAdmitted(!isCandidate)
        setAdmittedSids(new Set())

        if (isCandidate && withVideo) {
          try {
            const preview = await createLocalVideoTrack({ width: 640 })
            previewTrackRef.current = preview
            setPreviewTrack(preview)
          } catch {
            // Camera unavailable or denied — wait (and later join) audio-only.
          }
        }

        // Runs on the candidate when the interviewer's admit message arrives:
        // publish the previewed camera plus a fresh mic track. Idempotent —
        // repeated admits are ignored.
        let published = false
        admitSelfRef.current = () => {
          if (!isCandidate || published) return
          published = true
          const preview = previewTrackRef.current
          if (preview) {
            void connected.localParticipant.publishTrack(preview)
          }
          void createLocalAudioTrack()
            .then((audio) => connected.localParticipant.publishTrack(audio))
            .catch(() => {
              // Mic unavailable — join silently rather than failing the admit.
            })
          setAdmitted(true)
        }

        teardownsRef.current = []

        const handleParticipantLeft = (p: RemoteParticipant) =>
          dispatch({ type: "remove", participant: p })

        const handleReconnecting = () => setConnectionState("reconnecting")
        const handleReconnected = () => setConnectionState("connected")

        const handleDominantSpeaker = (participant: RemoteParticipant | null) =>
          setDominantSpeakerSid(participant?.sid ?? null)

        const handleDisconnected = () => {
          if (screenTrackRef.current) {
            // Null the ref before stop(): stop() fires "ended" synchronously,
            // and the once-listener's guard must see a null ref to skip.
            const track = screenTrackRef.current
            screenTrackRef.current = null
            setScreenTrack(null)
            track.stop()
          }
          if (previewTrackRef.current) {
            previewTrackRef.current.stop()
            previewTrackRef.current = null
            setPreviewTrack(null)
          }
          selfSidRef.current = null
          admitSelfRef.current = () => {}
          setAdmitted(true)
          setAdmittedSids(new Set())
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
          connected.removeListener("reconnecting", handleReconnecting)
          connected.removeListener("reconnected", handleReconnected)
          setConnectionState("connected")
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
        connected.on("reconnecting", handleReconnecting)
        connected.on("reconnected", handleReconnected)

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

  // Interviewer action: broadcast the admit signal and reveal the candidate's
  // tile locally right away (their tracks arrive via trackSubscribed).
  const admitCandidate = useCallback((sid: string) => {
    dataTrackRef.current?.send(makeAdmitMessage(sid))
    setAdmittedSids((prev) => {
      const next = new Set(prev)
      next.add(sid)
      return next
    })
  }, [])

  const toggleScreenShare = useCallback(async () => {
    if (!room) return
    if (screenTrackRef.current) {
      // Null the ref before stopping: stopScreenShare() calls track.stop(),
      // which fires "ended" synchronously; the once-listener's guard must see
      // a null ref so it doesn't run stopScreenShare a second time.
      const track = screenTrackRef.current
      screenTrackRef.current = null
      setScreenTrack(null)
      stopScreenShare(room, track)
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
    connectionState,
    admitted,
    admittedSids,
    admitCandidate,
    previewTrack,
  }
}
