import { useState } from "react"
import { motion } from "motion/react"
import { Video } from "lucide-react"
import type { Role } from "@/lib/interview"
import { PopButton } from "./pop/PopButton"
import { PopInput } from "./pop/PopInput"
import { ShapeAccent } from "./pop/ShapeAccent"
import { popContainer, popItem } from "./pop/motion"

interface LobbyProps {
  onJoin: (identity: string, room: string, withVideo: boolean, role: Role) => void
  connecting: boolean
  error: string | null
}

// Candidates arrive via a link carrying ?role=candidate — their room is fixed
// by the interviewer, so the field is locked. Everyone else is an interviewer.
function roleFromUrl(): Role {
  const role = new URLSearchParams(window.location.search).get("role")
  return role === "candidate" ? "candidate" : "interviewer"
}

export function Lobby({ onJoin, connecting, error }: LobbyProps) {
  const [role] = useState<Role>(() => roleFromUrl())
  const [identity, setIdentity] = useState("")
  const [room, setRoom] = useState(
    () => new URLSearchParams(window.location.search).get("room") ?? ""
  )
  const [audioOnly, setAudioOnly] = useState(false)
  const isCandidate = role === "candidate"
  const canJoin = identity.trim() !== "" && room.trim() !== "" && !connecting

  const labelClass = "mb-1 block text-xs font-bold uppercase tracking-[0.15em] text-pop-brown/70"

  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-pop-blue p-6 font-sans text-pop-brown">
      <ShapeAccent kind="circle" tone="yellow" size={80} className="left-[8%] top-[12%] hidden sm:block" />
      <ShapeAccent kind="triangle" tone="orange" size={64} rotate={-10} delay={1} className="right-[10%] top-[18%] hidden sm:block" />
      <ShapeAccent kind="blob" tone="cream" size={100} delay={0.5} className="bottom-[10%] left-[10%] hidden lg:block" />

      <motion.div
        variants={popContainer}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-md rounded-3xl border-[3px] border-pop-brown bg-pop-cream p-8 shadow-[8px_8px_0_0_var(--color-pop-brown)] sm:p-10"
      >
        <motion.span
          variants={popItem}
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border-[3px] border-pop-brown bg-pop-orange text-pop-cream"
        >
          <Video size={22} strokeWidth={2.5} />
        </motion.span>

        <motion.h1 variants={popItem} className="mb-2 font-pop text-3xl font-bold leading-tight">
          {isCandidate ? "Join your interview" : "Start an interview"}
        </motion.h1>
        <motion.p variants={popItem} className="mb-8 text-sm text-pop-brown/70">
          {isCandidate
            ? "You'll land in a waiting room until the interviewer admits you."
            : "Create a room, then share the candidate link."}
        </motion.p>

        <div className="flex flex-col gap-5">
          <motion.div variants={popItem}>
            <label htmlFor="name" className={labelClass}>
              Your name
            </label>
            <PopInput
              id="name"
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
              placeholder="Ada"
            />
          </motion.div>

          <motion.div variants={popItem}>
            <label htmlFor="room" className={labelClass}>
              {isCandidate ? "Interview room" : "Room name"}
            </label>
            <PopInput
              id="room"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="Frontend Round 1"
              disabled={isCandidate}
            />
          </motion.div>

          <motion.label
            variants={popItem}
            className="flex cursor-pointer items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-pop-brown/70"
          >
            <input
              type="checkbox"
              checked={audioOnly}
              onChange={(e) => setAudioOnly(e.target.checked)}
              className="h-4 w-4 accent-pop-orange"
            />
            Audio-only (no camera)
          </motion.label>

          {error && (
            <motion.p
              variants={popItem}
              className="rounded-2xl border-[3px] border-pop-brown bg-pop-orange px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-pop-cream"
            >
              {error}
            </motion.p>
          )}

          <motion.div variants={popItem}>
            <PopButton
              className="w-full"
              size="lg"
              disabled={!canJoin}
              onClick={() => onJoin(identity.trim(), room.trim(), !audioOnly, role)}
            >
              {connecting ? "Joining…" : isCandidate ? "Join interview" : "Start"}
            </PopButton>
          </motion.div>
        </div>
      </motion.div>
    </main>
  )
}
