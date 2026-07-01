import type { InputHTMLAttributes } from 'react'

// Brutalist input: transparent, bottom rule only, orange focus underline.
// Forwards all native input props (value, onChange, onKeyDown, id, disabled, …).
export function StudioInput({
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-none border-0 border-b border-studio-border bg-transparent px-0 py-2 text-white placeholder:text-studio-muted placeholder:uppercase placeholder:tracking-[0.15em] focus:border-studio-orange focus:outline-none ${className}`}
    />
  )
}
