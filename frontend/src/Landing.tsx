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

      {/* Hero — full-viewport orange field, content vertically centered */}
      <section className="relative flex min-h-svh items-center overflow-hidden bg-pop-orange px-6 pt-32 pb-20 text-pop-cream md:pt-28">
        {/* Shapes are anchored to this content-width wrapper (not the screen
            edges), so they frame the text at any viewport width. */}
        <div className="relative mx-auto w-full max-w-6xl">
          <ShapeAccent
            kind="circle"
            tone="yellow"
            size={88}
            className="-top-6 left-0 hidden md:block"
          />
          <ShapeAccent
            kind="triangle"
            tone="cream"
            size={72}
            rotate={-8}
            delay={0.9}
            className="-top-4 right-2 hidden md:block"
          />
          <ShapeAccent
            kind="square"
            tone="cream"
            size={56}
            rotate={12}
            delay={1.5}
            className="-bottom-6 left-6 hidden lg:block"
          />
          <ShapeAccent
            kind="blob"
            tone="blue"
            size={100}
            delay={0.6}
            className="right-2 -bottom-8 hidden lg:block"
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
              ready. Once you admit them, you share screens, watch them code,
              and jot private notes nobody else sees.
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
        </div>
      </section>

      <BuiltWithStrip />

      <CapabilityBento />

      <ProcessTimeline />

      <DomeCTA />

      <PopFooter />
    </main>
  )
}
