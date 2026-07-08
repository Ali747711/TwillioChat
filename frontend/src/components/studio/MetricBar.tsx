import { useEffect, useState } from "react"
import { formatClock } from "@/lib/clock"

// Split metric bar: static slots-left on the left, a live local clock on the
// right. The interval is cleared on unmount.
export function MetricBar() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const tag =
    "text-[11px] font-semibold uppercase tracking-[0.15em] text-studio-muted"

  return (
    <div className="flex items-center justify-between border-t border-studio-border px-6 py-3">
      <span className={tag}>
        DEMO ROOMS: <span className="text-studio-orange">|||||</span> OPEN
      </span>
      <span className={tag}>
        LOCAL TIME: <span className="text-white">{formatClock(now)}</span>
      </span>
    </div>
  )
}
