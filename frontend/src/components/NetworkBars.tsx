interface NetworkBarsProps {
  level: number | null
}

// Five square bars of increasing height; the first `level` are highlighted orange.
export function NetworkBars({ level }: NetworkBarsProps) {
  const active = level ?? 0
  return (
    <div
      className="flex items-end gap-0.5"
      title={`Network quality: ${level ?? "unknown"}/5`}
    >
      {[1, 2, 3, 4, 5].map((bar) => (
        <span
          key={bar}
          className={`w-0.5 rounded-none ${bar <= active ? "bg-studio-orange" : "bg-white/25"}`}
          style={{ height: `${bar * 2 + 2}px` }}
        />
      ))}
    </div>
  )
}
