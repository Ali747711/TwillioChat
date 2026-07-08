import { motion } from "motion/react"
import { popContainer, popItem, popViewport } from "./motion"

interface Step {
  number: string
  title: string
  description: string
}

const STEPS: Step[] = [
  { number: "01", title: "Create a room", description: "Open a room from your dashboard — no setup, no scheduling tool to configure." },
  { number: "02", title: "Send the one link", description: "Drop the single URL in your calendar invite. That's the only thing the candidate needs." },
  { number: "03", title: "Admit them from the lobby", description: "They wait in the lobby with their camera on; you let them in the moment you're ready." },
  { number: "04", title: "Score & export your notes", description: "Rate the call in your private panel and export the scorecard the second it ends." },
]

// Numbered vertical stepper — left title block, right column of steps
// connected by a thin brown line running through each dot. Blue field,
// cream type, matching the closing-CTA color language already in use.
export function ProcessTimeline() {
  return (
    <section className="relative overflow-hidden bg-pop-blue px-6 py-24 text-pop-cream">
      <div className="relative z-10 mx-auto flex max-w-5xl flex-col gap-16 md:flex-row md:gap-12">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={popViewport}
          transition={{ duration: 0.3 }}
          className="md:sticky md:top-32 md:h-fit md:w-2/5"
        >
          <span className="mb-4 inline-block rounded-full border-[3px] border-pop-cream/60 px-4 py-1.5 text-xs font-bold tracking-[0.2em] uppercase">
            How it runs
          </span>
          <h2 className="font-pop text-4xl font-bold sm:text-5xl">From link to scorecard, in four steps</h2>
          <p className="mt-4 max-w-sm text-base text-pop-cream/85">
            No account creation, no plugin, no second tool. The room does the
            organizing so you can focus on the conversation.
          </p>
        </motion.div>

        <motion.ol
          variants={popContainer}
          initial="hidden"
          whileInView="show"
          viewport={popViewport}
          className="relative flex flex-col gap-10 md:w-3/5"
        >
          <span
            aria-hidden
            className="absolute top-2 bottom-2 left-6 w-[3px] bg-pop-cream/25 md:left-7"
          />
          {STEPS.map((step) => (
            <motion.li key={step.number} variants={popItem} className="relative flex gap-6 pl-0">
              <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[3px] border-pop-brown bg-pop-yellow font-pop text-lg font-bold text-pop-brown shadow-[3px_3px_0_0_var(--color-pop-brown)] md:h-14 md:w-14">
                {step.number}
              </span>
              <div className="pt-1">
                <h3 className="font-pop text-xl font-bold sm:text-2xl">{step.title}</h3>
                <p className="mt-1.5 max-w-md text-sm text-pop-cream/85 sm:text-base">{step.description}</p>
              </div>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  )
}
