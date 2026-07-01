import type { ReactNode } from 'react'

interface StudioButtonProps {
  children: ReactNode
  onClick?: () => void
  className?: string
}

// Solid safety-orange, black uppercase bold, square edges; inverts to white
// instantly on hover.
export function StudioButton({ children, onClick, className = '' }: StudioButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-none bg-studio-orange px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] text-black transition-colors duration-200 hover:bg-white ${className}`}
    >
      {children}
    </button>
  )
}
