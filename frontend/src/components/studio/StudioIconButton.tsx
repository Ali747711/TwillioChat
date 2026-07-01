import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface StudioIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  active?: boolean
  variant?: 'default' | 'danger'
}

// Square icon button. default: bordered/transparent (hover invert). active:
// solid orange. danger: solid orange (used for the leave button).
export function StudioIconButton({
  children,
  active = false,
  variant = 'default',
  className = '',
  ...props
}: StudioIconButtonProps) {
  const base =
    'flex h-10 w-10 items-center justify-center rounded-none border transition-colors duration-200'
  const state =
    variant === 'danger'
      ? 'border-studio-orange bg-studio-orange text-black hover:border-white hover:bg-white'
      : active
        ? 'border-studio-orange bg-studio-orange text-black'
        : 'border-studio-border bg-transparent text-white hover:border-white'
  return (
    <button type="button" className={`${base} ${state} ${className}`} {...props}>
      {children}
    </button>
  )
}
