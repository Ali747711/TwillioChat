import { motion } from "motion/react"
import { ArrowUpRight, Video } from "lucide-react"
import { popContainer, popItem, popViewport } from "./motion"

const APP_PATH = "/app"

interface FooterTile {
  label: string
  href: string
  tone: "orange" | "blue" | "yellow" | "cream" | "brown"
  span?: string
  external?: boolean
}

const NAV_TILES: FooterTile[] = [
  { label: "Home", href: "/", tone: "cream" },
  { label: "How it works", href: "#how-it-works", tone: "yellow" },
  { label: "Start an interview", href: APP_PATH, tone: "orange", span: "sm:col-span-2" },
]

const SOCIAL_TILES: FooterTile[] = [
  { label: "GitHub", href: "#", tone: "blue", external: true },
  { label: "LinkedIn", href: "#", tone: "cream", external: true },
]

const TONE_CLASSES: Record<FooterTile["tone"], string> = {
  orange: "bg-pop-orange text-pop-cream",
  blue: "bg-pop-blue text-pop-cream",
  yellow: "bg-pop-yellow text-pop-brown",
  cream: "bg-pop-cream text-pop-brown",
  brown: "bg-pop-brown text-pop-cream",
}

// Footer as one last bento mosaic — colorful blocks instead of a grey link
// list, so the page ends on the same playful language it opened with.
export function PopFooter() {
  return (
    <footer className="bg-pop-cream px-6 pb-10 pt-6">
      <motion.div
        variants={popContainer}
        initial="hidden"
        whileInView="show"
        viewport={popViewport}
        className="mx-auto grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-4"
      >
        <motion.div
          variants={popItem}
          className="col-span-2 flex items-center gap-3 rounded-3xl border-[3px] border-pop-brown bg-pop-brown px-6 py-5 text-pop-cream shadow-[5px_5px_0_0_var(--color-pop-brown)] sm:col-span-1"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-pop-orange text-pop-cream">
            <Video size={16} strokeWidth={2.5} />
          </span>
          <span className="font-pop text-lg font-bold">TwilioMeet</span>
        </motion.div>

        {NAV_TILES.map((tile) => (
          <motion.a
            key={tile.label}
            variants={popItem}
            href={tile.href}
            onClick={
              tile.href === APP_PATH
                ? (event) => {
                    event.preventDefault()
                    window.location.href = APP_PATH
                  }
                : undefined
            }
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`flex items-center justify-between rounded-3xl border-[3px] border-pop-brown px-6 py-5 font-pop font-semibold shadow-[5px_5px_0_0_var(--color-pop-brown)] ${TONE_CLASSES[tile.tone]} ${tile.span ?? ""}`}
          >
            {tile.label}
            <ArrowUpRight size={18} strokeWidth={2.5} />
          </motion.a>
        ))}

        {SOCIAL_TILES.map((tile) => (
          <motion.a
            key={tile.label}
            variants={popItem}
            href={tile.href}
            target={tile.external ? "_blank" : undefined}
            rel={tile.external ? "noreferrer" : undefined}
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`flex items-center justify-between rounded-3xl border-[3px] border-pop-brown px-6 py-5 font-pop font-semibold shadow-[5px_5px_0_0_var(--color-pop-brown)] ${TONE_CLASSES[tile.tone]}`}
          >
            {/* TODO: real URL */}
            {tile.label}
            <ArrowUpRight size={18} strokeWidth={2.5} />
          </motion.a>
        ))}

        <motion.p
          variants={popItem}
          className="col-span-2 flex items-center justify-center rounded-3xl border-[3px] border-dashed border-pop-brown/30 px-6 py-4 text-center text-xs uppercase tracking-[0.2em] text-pop-brown/60 sm:col-span-4"
        >
          © 2026 TwilioMeet — built for teams who screen on video, every week.
        </motion.p>
      </motion.div>
    </footer>
  )
}
