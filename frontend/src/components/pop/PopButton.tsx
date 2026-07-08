import type { ReactNode } from "react"
import { motion } from "motion/react"

type PopButtonVariant = "primary" | "cream" | "outline"
type PopButtonSize = "md" | "lg"

interface PopButtonProps {
  children: ReactNode
  variant?: PopButtonVariant
  size?: PopButtonSize
  className?: string
  disabled?: boolean
  onClick?: () => void
}

const VARIANT_CLASSES: Record<PopButtonVariant, string> = {
  primary:
    "bg-pop-orange text-pop-cream border-pop-brown hover:bg-pop-brown hover:text-pop-cream",
  cream: "bg-pop-cream text-pop-brown border-pop-brown hover:bg-pop-yellow",
  outline: "bg-transparent text-current border-current hover:bg-pop-brown/10",
}

const SIZE_CLASSES: Record<PopButtonSize, string> = {
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
}

// Pill CTA with a chunky border and a physical hover: it lifts and grows a
// tiny bit rather than just tinting, so it reads as squeezable, not flat.
export function PopButton({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  onClick,
}: PopButtonProps) {
  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={onClick}
      whileHover={disabled ? undefined : { scale: 1.045, y: -2 }}
      whileTap={disabled ? undefined : { scale: 0.97, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 18 }}
      className={`inline-flex items-center justify-center gap-2 rounded-full border-[3px] font-pop font-semibold tracking-wide uppercase transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
    >
      {children}
    </motion.button>
  )
}
