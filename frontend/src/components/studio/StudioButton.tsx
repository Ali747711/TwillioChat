import type { ReactNode } from 'react'

interface StudioButtonProps {
  children: ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
}

// Solid safety-orange, black uppercase bold, square edges; inverts to white on
// hover; dimmed + non-interactive when disabled.
export function StudioButton({
  children,
  onClick,
  className = '',
  disabled = false,
}: StudioButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-none bg-studio-orange px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] text-black transition-colors duration-200 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-studio-orange ${className}`}
    >
      {children}
    </button>
  )
}
