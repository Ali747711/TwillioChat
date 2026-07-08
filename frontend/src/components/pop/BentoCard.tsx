import type { ReactNode } from "react"
import { motion } from "motion/react"
import { popItem } from "./motion"

type BentoTone = "cream" | "orange" | "blue" | "yellow"

interface BentoCardProps {
  icon: ReactNode
  title: string
  description: string
  tone?: BentoTone
  className?: string
}

const TONE_CLASSES: Record<BentoTone, string> = {
  cream: "bg-pop-cream text-pop-brown",
  orange: "bg-pop-orange text-pop-cream",
  blue: "bg-pop-blue text-pop-cream",
  yellow: "bg-pop-yellow text-pop-brown",
}

const BADGE_CLASSES: Record<BentoTone, string> = {
  cream: "bg-pop-orange text-pop-cream",
  orange: "bg-pop-brown text-pop-cream",
  blue: "bg-pop-yellow text-pop-brown",
  yellow: "bg-pop-brown text-pop-cream",
}

// A single bento compartment: chunky border, hard drop shadow, icon badge.
// Meant to sit in a grid of 3 inside "How it works" — each card independently
// plays the shared stagger item animation as its parent scrolls into view.
export function BentoCard({ icon, title, description, tone = "cream", className = "" }: BentoCardProps) {
  return (
    <motion.div
      variants={popItem}
      whileHover={{ y: -6, rotate: -0.5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`rounded-3xl border-[3px] border-pop-brown p-7 shadow-[6px_6px_0_0_var(--color-pop-brown)] ${TONE_CLASSES[tone]} ${className}`}
    >
      <span className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border-[3px] border-pop-brown ${BADGE_CLASSES[tone]}`}>
        {icon}
      </span>
      <h3 className="mb-2 font-pop text-xl font-bold">{title}</h3>
      <p className="text-sm leading-relaxed opacity-90">{description}</p>
    </motion.div>
  )
}
