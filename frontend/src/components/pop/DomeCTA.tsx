import { motion } from "motion/react"
import { PopButton } from "./PopButton"
import { ShapeAccent } from "./ShapeAccent"
import { popViewport } from "./motion"

const APP_PATH = "/app"

// Giant dome CTA: a semicircle-topped block rising out of the cream field,
// flat along the bottom edge, arched along the top. The corner radius is set
// far larger than the box could ever need, so the browser clamps it to
// exactly half the box's own height on every viewport — a true arch at any
// size, with no fixed aspect-ratio to overflow on small screens.
export function DomeCTA() {
  return (
    <section className="relative overflow-hidden bg-pop-cream px-6 pt-20 pb-0">
      <ShapeAccent
        kind="square"
        tone="yellow"
        size={46}
        rotate={10}
        className="top-8 left-[10%] hidden lg:block"
        delay={0.5}
      />
      <ShapeAccent
        kind="circle"
        tone="orange"
        size={40}
        className="top-16 right-[12%] hidden lg:block"
        delay={1}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={popViewport}
        transition={{
          type: "spring",
          stiffness: 220,
          damping: 22,
          duration: 0.3,
        }}
        className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center gap-6 rounded-t-[9999px] border-[3px] border-b-0 border-pop-brown bg-pop-blue px-6 pt-24 pb-16 text-center text-pop-cream shadow-[8px_8px_0_0_var(--color-pop-brown)] sm:pt-32 sm:pb-20 md:pt-40"
      >
        <h2 className="font-pop text-4xl font-bold sm:text-5xl">
          Ready to run a sharper screen?
        </h2>
        <p className="max-w-xl text-lg text-pop-cream/90">
          Open a room, drop the candidate link in your calendar invite, and let
          the lobby do the rest.
        </p>
        <PopButton
          variant="cream"
          size="lg"
          onClick={() => {
            window.location.href = APP_PATH
          }}
        >
          Start an interview
        </PopButton>
      </motion.div>
    </section>
  )
}
