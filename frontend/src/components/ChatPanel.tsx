import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { ChatMessage } from "@/hooks/useRoom"

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
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {messages.map((m, i) => (
          <div key={`${m.at}-${i}`} className="text-sm">
            <span className="font-medium">
              {m.from === identity ? "You" : m.from}:{" "}
            </span>
            <span>{m.text}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2 border-t p-3">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit()
          }}
          placeholder="Message"
        />
        <Button onClick={submit}>Send</Button>
      </div>
    </div>
  )
}
