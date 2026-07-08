import type { ReactNode } from "react"
import { motion } from "motion/react"

interface PopIconButtonProps {
  children: ReactNode
  active?: boolean
  variant?: "default" | "danger"
  className?: string
  disabled?: boolean
  onClick?: () => void
  "aria-label": string
}

// Round pop control-bar button: chunky border, hard offset shadow, physical
// hover/tap. default: cream fill. active (toggled on, e.g. sharing/chat/notes):
// yellow fill. danger (muted mic/cam, leave call): orange-red fill — the
// universal "off/end" signal, reusing the brand's orange rather than adding a
// new red.
export function PopIconButton({
  children,
  active = false,
  variant = "default",
  className = "",
  ...props
}: PopIconButtonProps) {
  const state =
    variant === "danger"
      ? "border-pop-brown bg-pop-orange text-pop-cream hover:bg-pop-brown"
      : active
        ? "border-pop-brown bg-pop-yellow text-pop-brown hover:bg-pop-orange hover:text-pop-cream"
        : "border-pop-brown bg-pop-cream text-pop-brown hover:bg-pop-yellow"

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.08, y: -2 }}
      whileTap={{ scale: 0.94, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 18 }}
      className={`flex h-12 w-12 items-center justify-center rounded-full border-[3px] shadow-[3px_3px_0_0_var(--color-pop-brown)] transition-colors duration-150 ${state} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}
