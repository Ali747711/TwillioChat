import type { InputHTMLAttributes } from "react"

// Pill text input for the pop lobby card: chunky border, generous padding,
// disabled state visibly flattens (used for the candidate's locked room field).
export function PopInput({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-full border-[3px] border-pop-brown bg-pop-cream px-5 py-3 font-sans text-pop-brown placeholder:text-pop-brown/40 focus:outline-none focus:ring-4 focus:ring-pop-yellow disabled:cursor-not-allowed disabled:bg-pop-brown/10 disabled:text-pop-brown/50 ${className}`}
    />
  )
}
