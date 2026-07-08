import { useState } from "react"
import { PopButton } from "./pop/PopButton"
import { PopInput } from "./pop/PopInput"
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
    <div className="flex h-full flex-col bg-pop-cream text-pop-brown">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div key={`${m.at}-${i}`} className="text-sm">
            <span className="font-pop text-xs font-bold tracking-wide text-pop-orange uppercase">
              {m.from === identity ? "You" : parseIdentity(m.from).name}
            </span>
            <span className="ml-2 text-pop-brown">{m.text}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 border-t-[3px] border-pop-brown/10 p-3">
        <PopInput
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit()
          }}
          placeholder="Message"
          className="py-2"
        />
        <PopButton size="md" className="px-5 py-2 text-xs" onClick={submit}>
          Send
        </PopButton>
      </div>
    </div>
  )
}
