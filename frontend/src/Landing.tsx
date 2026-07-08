import { motion } from "motion/react"
import { Clock3, MonitorPlay, NotebookPen } from "lucide-react"
import { PopNav } from "./components/pop/PopNav"
import { PopButton } from "./components/pop/PopButton"
import { BentoCard } from "./components/pop/BentoCard"
import { ShapeAccent } from "./components/pop/ShapeAccent"
import { popContainer, popItem, popViewport } from "./components/pop/motion"

const APP_PATH = "/app"

export default function Landing() {
  return (
    <main className="min-h-screen overflow-x-clip bg-pop-cream font-sans text-pop-brown">
      <PopNav ctaHref={APP_PATH} />

      {/* Hero — orange field, cream type */}
      <section className="relative overflow-hidden bg-pop-orange px-6 pb-24 pt-40 text-pop-cream">
        <ShapeAccent kind="circle" tone="yellow" size={90} className="left-[6%] top-24 hidden md:block" />
        <ShapeAccent kind="triangle" tone="cream" size={70} rotate={-8} delay={1.2} className="right-[10%] top-36 hidden md:block" />
        <ShapeAccent kind="blob" tone="blue" size={110} delay={0.6} className="bottom-10 left-[14%] hidden lg:block" />
        <ShapeAccent kind="square" tone="cream" size={54} rotate={12} delay={1.8} className="bottom-16 right-[16%] hidden lg:block" />

        <motion.div
          variants={popContainer}
          initial="hidden"
          animate="show"
          className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-8 text-center"
        >
          <motion.span
            variants={popItem}
            className="rounded-full border-[3px] border-pop-cream/70 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em]"
          >
            Interview screening, built right
          </motion.span>
          <motion.h1
            variants={popItem}
            className="font-pop text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
          >
            Video interviews with a real waiting room.
          </motion.h1>
          <motion.p variants={popItem} className="max-w-2xl text-lg text-pop-cream/90 sm:text-xl">
            Send a candidate one link. They wait in a calm lobby while you get
            ready. Once you admit them, you share screens, watch them code,
            and jot private notes nobody else sees.
          </motion.p>
          <motion.div variants={popItem} className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <PopButton
              variant="cream"
              size="lg"
              onClick={() => {
                window.location.href = APP_PATH
              }}
            >
              Start an interview
            </PopButton>
            <PopButton variant="outline" size="lg" className="border-pop-cream text-pop-cream hover:bg-pop-cream/10">
              See how it works
            </PopButton>
          </motion.div>
        </motion.div>
      </section>

      {/* How it works — cream field, brown type, bento grid */}
      <section className="relative overflow-hidden bg-pop-cream px-6 py-24">
        <ShapeAccent kind="circle" tone="blue" size={56} className="right-[8%] top-10 hidden md:block" delay={0.4} />
        <div className="relative z-10 mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={popViewport}
            transition={{ duration: 0.3 }}
            className="mb-14 text-center"
          >
            <h2 className="font-pop text-4xl font-bold sm:text-5xl">How a screen actually runs</h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-pop-brown/70">
              Three rooms, one link. Nothing to install, nothing for the
              candidate to configure.
            </p>
          </motion.div>

          <motion.div
            variants={popContainer}
            initial="hidden"
            whileInView="show"
            viewport={popViewport}
            className="grid grid-cols-1 gap-6 md:grid-cols-3"
          >
            <BentoCard
              tone="orange"
              icon={<Clock3 size={22} strokeWidth={2.5} />}
              title="Waiting room"
              description="Candidates land in a holding lobby the instant they open your link, camera preview and all, until you tap admit."
              className="md:translate-y-3"
            />
            <BentoCard
              tone="blue"
              icon={<MonitorPlay size={22} strokeWidth={2.5} />}
              title="Live coding & screen share"
              description="Have them share their editor or portfolio and talk through it live, same as sitting beside them."
              className="md:-translate-y-2"
            />
            <BentoCard
              tone="yellow"
              icon={<NotebookPen size={22} strokeWidth={2.5} />}
              title="Private notes & rating"
              description="Keep a running scorecard in a panel only you can see, then export it the moment the call ends."
              className="md:translate-y-3"
            />
          </motion.div>
        </div>
      </section>

      {/* Closing CTA — blue field, cream type */}
      <section className="relative overflow-hidden bg-pop-blue px-6 py-24 text-pop-cream">
        <ShapeAccent kind="blob" tone="yellow" size={100} className="left-[8%] bottom-8 hidden md:block" delay={0.8} />
        <ShapeAccent kind="triangle" tone="orange" size={64} rotate={14} className="right-[12%] top-10 hidden md:block" delay={0.2} />

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={popViewport}
          transition={{ duration: 0.3 }}
          className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-6 text-center"
        >
          <h2 className="font-pop text-4xl font-bold sm:text-5xl">Ready to run a sharper screen?</h2>
          <p className="max-w-xl text-lg text-pop-cream/90">
            Open a room, drop the candidate link in your calendar invite, and
            let the lobby do the rest.
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

        <p className="relative z-10 mt-20 text-center text-xs uppercase tracking-[0.2em] text-pop-cream/60">
          Built for teams who screen on video, every week.
        </p>
      </section>
    </main>
  )
}
