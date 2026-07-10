import { motion } from "motion/react"
import { PopNav } from "./components/pop/PopNav"
import { PopButton } from "./components/pop/PopButton"
import { ShapeAccent } from "./components/pop/ShapeAccent"
import { BuiltWithStrip } from "./components/pop/BuiltWithStrip"
import { CapabilityBento } from "./components/pop/CapabilityBento"
import { ProcessTimeline } from "./components/pop/ProcessTimeline"
import { DomeCTA } from "./components/pop/DomeCTA"
import { PopFooter } from "./components/pop/PopFooter"
import { StrandsWindow } from "./components/pop/StrandsWindow"
import { popContainer, popItem } from "./components/pop/motion"

const APP_PATH = "/app"

export default function Landing() {
  return (
    <main className="min-h-screen overflow-x-clip bg-pop-cream font-sans text-pop-brown">
      <PopNav ctaHref={APP_PATH} />

      {/* Hero — split editorial: content left, live Strands window right */}
      <section className="relative flex min-h-svh items-center overflow-hidden bg-pop-orange px-6 pt-28 pb-16 text-pop-cream md:py-28">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-10 lg:gap-16">
          {/* Left — content */}
          <motion.div
            variants={popContainer}
            initial="hidden"
            animate="show"
            className="relative z-10 flex flex-col items-start gap-6 text-left"
          >
            <ShapeAccent
              kind="circle"
              tone="yellow"
              size={60}
              className="-top-12 -left-4 hidden md:block"
            />
            <motion.span
              variants={popItem}
              className="rounded-full border-[3px] border-pop-cream/70 px-4 py-1.5 text-xs font-bold tracking-[0.2em] uppercase"
            >
              Interview screening, built right
            </motion.span>
            <motion.h1
              variants={popItem}
              className="font-pop text-4xl leading-[1.02] font-bold tracking-tight sm:text-6xl lg:text-7xl"
            >
              Video interviews with a real waiting room.
            </motion.h1>
            <motion.p
              variants={popItem}
              className="max-w-md text-lg text-pop-cream/90"
            >
              Send a candidate one link. They wait in a calm lobby while you get
              ready — then you admit them, share screens, watch them code, and
              jot private notes nobody else sees.
            </motion.p>
            <motion.div
              variants={popItem}
              className="flex flex-wrap items-center gap-4 pt-2"
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
                onClick={() => {
                  document
                    .getElementById("how-it-works")
                    ?.scrollIntoView({ behavior: "smooth" })
                }}
              >
                See how it works
              </PopButton>
            </motion.div>
          </motion.div>

          {/* Right — live Strands window */}
          <div className="relative">
            <ShapeAccent
              kind="triangle"
              tone="cream"
              size={56}
              rotate={-8}
              delay={0.9}
              className="-top-8 -right-5 hidden lg:block"
            />
            <ShapeAccent
              kind="blob"
              tone="blue"
              size={72}
              delay={0.6}
              className="-bottom-9 -left-9 hidden lg:block"
            />
            <StrandsWindow />
          </div>
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
