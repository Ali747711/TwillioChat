import type { Variants } from "motion/react"

// Shared scroll-in choreography for the pop aesthetic: a container that
// staggers its children, each of which fades + slides up on a short spring.
// Kept subtle and short (~0.3s) per the design brief — nothing floaty.
export const popContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.04,
    },
  },
}

export const popItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 22, duration: 0.3 },
  },
}

// Viewport config shared by every scroll-triggered section so the reveal
// only plays once and fires slightly before the section is fully in view.
export const popViewport = { once: true, amount: 0.3 } as const
