interface NetworkBarsProps {
  level: number | null
}

// Five bars of increasing height; the first `level` are highlighted.
export function NetworkBars({ level }: NetworkBarsProps) {
  const active = level ?? 0
  return (
    <div
      className="flex items-end gap-0.5"
      title={`Network quality: ${level ?? 'unknown'}/5`}
    >
      {[1, 2, 3, 4, 5].map((bar) => (
        <span
          key={bar}
          className={`w-0.5 rounded-sm ${bar <= active ? 'bg-green-400' : 'bg-white/40'}`}
          style={{ height: `${bar * 2 + 2}px` }}
        />
      ))}
    </div>
  )
}
