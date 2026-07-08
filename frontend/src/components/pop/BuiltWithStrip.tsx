import { motion } from "motion/react"
import { popContainer, popItem, popViewport } from "./motion"

const STACK = ["React", "Twilio Video", "TypeScript", "Vite", "Tailwind CSS"]

// Slim honest tech strip beneath the hero — real stack, not fake client
// logos. Wordmarks only, separated by a dot, with a small uppercase label.
export function BuiltWithStrip() {
  return (
    <section className="border-y-[3px] border-pop-brown/10 bg-pop-cream px-6 py-8">
      <motion.div
        variants={popContainer}
        initial="hidden"
        whileInView="show"
        viewport={popViewport}
        className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-10 gap-y-4"
      >
        <motion.span
          variants={popItem}
          className="rounded-full border-[3px] border-pop-brown bg-pop-yellow px-4 py-1 font-pop text-xs font-bold uppercase tracking-[0.2em] text-pop-brown"
        >
          Built with
        </motion.span>
        {STACK.map((name, index) => (
          <motion.span
            key={name}
            variants={popItem}
            className="flex items-center gap-10"
          >
            <span className="font-pop text-base font-semibold uppercase tracking-wide text-pop-brown/80 sm:text-lg">
              {name}
            </span>
            {index < STACK.length - 1 && (
              <span aria-hidden className="hidden h-2 w-2 rounded-full bg-pop-brown/30 sm:block" />
            )}
          </motion.span>
        ))}
      </motion.div>
    </section>
  )
}
