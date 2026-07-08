import { motion } from "motion/react"
import { Video } from "lucide-react"
import { PopButton } from "./PopButton"

interface PopNavProps {
  ctaHref: string
  ctaLabel?: string
}

// A floating pill nav: brand mark on the left, a single confident CTA on the
// right. No link soup — the whole point of the app is one action, "start".
export function PopNav({ ctaHref, ctaLabel = "Start an interview" }: PopNavProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24, duration: 0.3 }}
      className="fixed inset-x-0 top-4 z-50 flex justify-center px-4"
    >
      <div className="flex w-full max-w-3xl items-center justify-between gap-4 rounded-full border-[3px] border-pop-brown bg-pop-cream/95 px-4 py-2 shadow-[4px_4px_0_0_var(--color-pop-brown)] backdrop-blur">
        <a
          href="/"
          className="flex items-center gap-2 rounded-full px-2 py-1 font-pop text-lg font-bold text-pop-brown"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pop-orange text-pop-cream">
            <Video size={18} strokeWidth={2.5} />
          </span>
          Aloe
        </a>
        <PopButton
          size="md"
          className="px-5 py-2 text-xs"
          onClick={() => {
            window.location.href = ctaHref
          }}
        >
          {ctaLabel}
        </PopButton>
      </div>
    </motion.header>
  )
}
