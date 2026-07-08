import { useState } from "react"
import { StudioButton } from "./studio/StudioButton"
import { StudioInput } from "./studio/StudioInput"
import type { ChatMessage } from "@/hooks/useRoom"
import { parseIdentity } from "@/lib/interview"

interface ChatPanelProps {
  messages: ChatMessage[]
  identity: string
  onSend: (text: string) => void
}

export function ChatPanel({ messages, identity, onSend }: ChatPanelProps) {
  const [text, setText] = useState("")

  const submit = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    onSend(trimmed)
    setText("")
  }

  return (
    <div className="flex h-full flex-col bg-studio-bg">
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {messages.map((m, i) => (
          <div key={`${m.at}-${i}`} className="text-sm">
            <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-studio-orange">
              {m.from === identity ? "You" : parseIdentity(m.from).name}
            </span>
            <span className="ml-2 text-white">{m.text}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 border-t border-studio-border p-3">
        <StudioInput
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit()
          }}
          placeholder="Message"
        />
        <StudioButton onClick={submit}>Send</StudioButton>
      </div>
    </div>
  )
}
