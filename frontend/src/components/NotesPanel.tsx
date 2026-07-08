import { useState } from "react"
import { PopButton } from "./pop/PopButton"

interface NotesPanelProps {
  roomName: string
}

const RATINGS = [1, 2, 3, 4, 5] as const

// Private interviewer scratchpad. Nothing here is sent over the network or
// stored on a server — notes live in this tab and leave via copy/download.
export function NotesPanel({ roomName }: NotesPanelProps) {
  const [notes, setNotes] = useState("")
  const [rating, setRating] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)

  const summary = () =>
    `Interview notes — ${roomName}\nRating: ${rating ?? "n/a"}/5\n\n${notes}`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(summary())
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard unavailable (e.g. insecure context); ignore.
    }
  }

  const download = () => {
    const blob = new Blob([summary()], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `interview-notes-${roomName}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const tag =
    "font-pop text-xs font-bold uppercase tracking-wide text-pop-brown/60"

  return (
    <div className="flex h-full flex-col bg-pop-cream p-4 text-pop-brown">
      <div className="mb-3 flex items-center justify-between">
        <span className={tag}>Private notes</span>
        <span className={tag}>Not shared</span>
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Strengths, concerns, follow-ups…"
        className="min-h-0 flex-1 resize-none rounded-2xl border-[3px] border-pop-brown bg-white/40 p-3 text-sm text-pop-brown placeholder:text-pop-brown/40 focus:ring-4 focus:ring-pop-yellow focus:outline-none"
      />
      <div className="mt-3 flex items-center gap-1.5">
        <span className={`mr-2 ${tag}`}>Rating</span>
        {RATINGS.map((value) => (
          <button
            key={value}
            type="button"
            aria-label={`Rate ${value} of 5`}
            onClick={() => setRating(value)}
            className={`flex h-8 w-8 items-center justify-center rounded-full border-[3px] text-xs font-bold transition-colors duration-150 ${
              rating !== null && value <= rating
                ? "border-pop-brown bg-pop-orange text-pop-cream"
                : "border-pop-brown/30 text-pop-brown/50 hover:border-pop-brown hover:text-pop-brown"
            }`}
          >
            {value}
          </button>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <PopButton
          size="md"
          className="flex-1 px-3 py-2 text-xs"
          onClick={copy}
        >
          {copied ? "Copied!" : "Copy"}
        </PopButton>
        <PopButton
          size="md"
          className="flex-1 px-3 py-2 text-xs"
          onClick={download}
        >
          Download .txt
        </PopButton>
      </div>
    </div>
  )
}
