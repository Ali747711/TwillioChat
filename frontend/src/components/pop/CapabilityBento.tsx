import type { ReactNode } from "react"
import { motion } from "motion/react"
import {
  Clock3,
  MonitorPlay,
  NotebookPen,
  Link2,
  RefreshCw,
  Globe,
} from "lucide-react"
import { popContainer, popItem, popViewport } from "./motion"

type Tone = "orange" | "blue" | "yellow" | "cream"

const TONE_CLASSES: Record<Tone, string> = {
  orange: "bg-pop-orange text-pop-cream",
  blue: "bg-pop-blue text-pop-cream",
  yellow: "bg-pop-yellow text-pop-brown",
  cream: "bg-pop-cream text-pop-brown",
}

const BADGE_CLASSES: Record<Tone, string> = {
  orange: "bg-pop-brown text-pop-cream",
  blue: "bg-pop-yellow text-pop-brown",
  yellow: "bg-pop-brown text-pop-cream",
  cream: "bg-pop-orange text-pop-cream",
}

const TAG_CLASSES: Record<Tone, string> = {
  orange: "border-pop-cream/60 text-pop-cream",
  blue: "border-pop-cream/60 text-pop-cream",
  yellow: "border-pop-brown/40 text-pop-brown",
  cream: "border-pop-brown/30 text-pop-brown",
}

interface Capability {
  icon: ReactNode
  title: string
  description: string
  tags: string[]
  tone: Tone
  span: string
  accent?: "arch" | "quarter"
}

const CAPABILITIES: Capability[] = [
  {
    icon: <Clock3 size={24} strokeWidth={2.5} />,
    title: "Waiting room / lobby",
    description:
      "Candidates land in a calm holding lobby the second they open your link — camera preview and all — until you tap admit.",
    tags: ["Auto-hold", "Camera check"],
    tone: "orange",
    span: "md:col-span-2 md:row-span-2",
    accent: "arch",
  },
  {
    icon: <MonitorPlay size={24} strokeWidth={2.5} />,
    title: "Live coding + screen share",
    description:
      "Have them share an editor or portfolio and talk through it live, like sitting beside them.",
    tags: ["Screen share"],
    tone: "blue",
    span: "md:col-span-2",
  },
  {
    icon: <NotebookPen size={24} strokeWidth={2.5} />,
    title: "Private notes & 1–5 rating",
    description:
      "Keep a running scorecard only you can see, then export it the moment the call ends.",
    tags: ["1–5 scale", "Export"],
    tone: "yellow",
    span: "md:row-span-2",
    accent: "quarter",
  },
  {
    icon: <Link2 size={24} strokeWidth={2.5} />,
    title: "One-link candidate invites",
    description:
      "One URL, no accounts. Drop it in a calendar invite and the lobby handles the rest.",
    tags: ["No sign-up"],
    tone: "cream",
    span: "",
  },
  {
    icon: <RefreshCw size={24} strokeWidth={2.5} />,
    title: "Reconnect-safe calls",
    description:
      "Wobbly wifi drops the call, not the interview — candidates slide right back into their seat.",
    tags: ["Auto-rejoin"],
    tone: "blue",
    span: "",
  },
  {
    icon: <Globe size={24} strokeWidth={2.5} />,
    title: "No installs, browser only",
    description:
      "Runs entirely in the tab. Nothing for either side to download, update, or configure.",
    tags: ["Zero setup"],
    tone: "orange",
    span: "",
  },
]

// Varied bento mosaic of the product's real capabilities — mixed spans and
// tones so the grid reads as a mosaic, not a repeated card. Two tiles carry a
// signature shape accent (arch top / quarter-circle corner) to break the grid.
export function CapabilityBento() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-pop-cream px-6 py-24"
    >
      <div className="relative z-10 mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={popViewport}
          transition={{ duration: 0.3 }}
          className="mb-14 text-center"
        >
          <h2 className="font-pop text-4xl font-bold sm:text-5xl">
            Everything a screen needs, one room
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-pop-brown/70">
            Six pieces that click together so nobody's fumbling with links,
            plugins, or a second app to take notes in.
          </p>
        </motion.div>

        <motion.div
          variants={popContainer}
          initial="hidden"
          whileInView="show"
          viewport={popViewport}
          className="grid grid-cols-1 gap-6 md:[grid-auto-rows:minmax(11rem,auto)] md:grid-cols-4"
        >
          {CAPABILITIES.map((cap) => (
            <motion.div
              key={cap.title}
              variants={popItem}
              whileHover={{ y: -6, rotate: -0.5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`relative flex flex-col overflow-hidden rounded-3xl border-[3px] border-pop-brown p-7 shadow-[6px_6px_0_0_var(--color-pop-brown)] ${TONE_CLASSES[cap.tone]} ${cap.span}`}
            >
              {cap.accent === "arch" && (
                <span
                  aria-hidden
                  className="absolute -top-10 right-8 h-20 w-20 rounded-t-[9999px] border-[3px] border-b-0 border-pop-brown bg-pop-cream/25"
                />
              )}
              {cap.accent === "quarter" && (
                <span
                  aria-hidden
                  className="absolute right-0 bottom-0 h-16 w-16 rounded-tl-[9999px] bg-pop-brown/10"
                />
              )}
              <span
                className={`relative z-10 mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border-[3px] border-pop-brown ${BADGE_CLASSES[cap.tone]}`}
              >
                {cap.icon}
              </span>
              <h3 className="relative z-10 mb-2 font-pop text-xl font-bold">
                {cap.title}
              </h3>
              <p className="relative z-10 text-sm leading-relaxed opacity-90">
                {cap.description}
              </p>
              <div className="relative z-10 mt-auto flex flex-wrap gap-2 pt-5">
                {cap.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`rounded-full border-2 px-3 py-1 text-xs font-semibold tracking-wide uppercase ${TAG_CLASSES[cap.tone]}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
