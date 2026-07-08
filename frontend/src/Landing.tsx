import { motion } from "motion/react"
import { PopNav } from "./components/pop/PopNav"
import { PopButton } from "./components/pop/PopButton"
import { ShapeAccent } from "./components/pop/ShapeAccent"
import { BuiltWithStrip } from "./components/pop/BuiltWithStrip"
import { CapabilityBento } from "./components/pop/CapabilityBento"
import { ProcessTimeline } from "./components/pop/ProcessTimeline"
import { DomeCTA } from "./components/pop/DomeCTA"
import { PopFooter } from "./components/pop/PopFooter"
import { popContainer, popItem } from "./components/pop/motion"

const APP_PATH = "/app"

export default function Landing() {
  return (
    <main className="min-h-screen overflow-x-clip bg-pop-cream font-sans text-pop-brown">
      <PopNav ctaHref={APP_PATH} />

      {/* Hero — orange field, cream type */}
      <section className="relative overflow-hidden bg-pop-orange px-6 pt-40 pb-24 text-pop-cream">
        <ShapeAccent
          kind="circle"
          tone="yellow"
          size={90}
          className="top-24 left-[6%] hidden md:block"
        />
        <ShapeAccent
          kind="triangle"
          tone="cream"
          size={70}
          rotate={-8}
          delay={1.2}
          className="top-36 right-[10%] hidden md:block"
        />
        <ShapeAccent
          kind="blob"
          tone="blue"
          size={110}
          delay={0.6}
          className="bottom-10 left-[14%] hidden lg:block"
        />
        <ShapeAccent
          kind="square"
          tone="cream"
          size={54}
          rotate={12}
          delay={1.8}
          className="right-[16%] bottom-16 hidden lg:block"
        />

        <motion.div
          variants={popContainer}
          initial="hidden"
          animate="show"
          className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-8 text-center"
        >
          <motion.span
            variants={popItem}
            className="rounded-full border-[3px] border-pop-cream/70 px-4 py-1.5 text-xs font-bold tracking-[0.2em] uppercase"
          >
            Interview screening, built right
          </motion.span>
          <motion.h1
            variants={popItem}
            className="font-pop text-5xl leading-[1.05] font-bold tracking-tight sm:text-6xl md:text-7xl"
          >
            Video interviews with a real waiting room.
          </motion.h1>
          <motion.p
            variants={popItem}
            className="max-w-2xl text-lg text-pop-cream/90 sm:text-xl"
          >
            Send a candidate one link. They wait in a calm lobby while you get
            ready. Once you admit them, you share screens, watch them code, and
            jot private notes nobody else sees.
          </motion.p>
          <motion.div
            variants={popItem}
            className="flex flex-wrap items-center justify-center gap-4 pt-2"
          >
            <PopButton
              variant="cream"
              size="lg"
              onClick={() => {
                window.location.href = APP_PATH
              }}
            >
              Start an interview
            </PopButton>
            <PopButton
              variant="outline"
              size="lg"
              className="border-pop-cream text-pop-cream hover:bg-pop-cream/10"
            >
              See how it works
            </PopButton>
          </motion.div>
        </motion.div>
      </section>

      <BuiltWithStrip />

      <CapabilityBento />

      <ProcessTimeline />

      <DomeCTA />

      <PopFooter />
    </main>
  )
}
