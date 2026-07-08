import { useState } from "react"
import { StudioButton } from "./studio/StudioButton"

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
    "text-[11px] font-semibold uppercase tracking-[0.15em] text-studio-muted"

  return (
    <div className="flex h-full flex-col bg-studio-bg p-3">
      <div className="mb-3 flex items-center justify-between">
        <span className={tag}>Private notes</span>
        <span className={tag}>Not shared</span>
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="STRENGTHS, CONCERNS, FOLLOW-UPS…"
        className="min-h-0 flex-1 resize-none rounded-none border border-studio-border bg-transparent p-3 text-sm text-white placeholder:text-studio-muted focus:border-studio-orange focus:outline-none"
      />
      <div className="mt-3 flex items-center gap-1">
        <span className={`mr-2 ${tag}`}>Rating</span>
        {RATINGS.map((value) => (
          <button
            key={value}
            type="button"
            aria-label={`Rate ${value} of 5`}
            onClick={() => setRating(value)}
            className={`h-8 w-8 rounded-none border text-xs font-bold transition-colors duration-200 ${
              rating !== null && value <= rating
                ? "border-studio-orange bg-studio-orange text-black"
                : "border-studio-border text-studio-muted hover:border-white hover:text-white"
            }`}
          >
            {value}
          </button>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <StudioButton className="flex-1 px-3 py-2" onClick={copy}>
          {copied ? "Copied!" : "Copy"}
        </StudioButton>
        <StudioButton className="flex-1 px-3 py-2" onClick={download}>
          Download .txt
        </StudioButton>
      </div>
    </div>
  )
}
