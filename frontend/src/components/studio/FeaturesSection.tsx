interface FeatureRow {
  index: string
  title: string
  description: string
}

const FEATURES: FeatureRow[] = [
  {
    index: "01",
    title: "WAITING ROOM",
    description:
      "Candidates open your link and hold in a lobby — previewing their camera — until you admit them.",
  },
  {
    index: "02",
    title: "LIVE CODING & PORTFOLIO",
    description:
      "One-click screen share for pairing sessions, portfolio walkthroughs, or whiteboard sketches.",
  },
  {
    index: "03",
    title: "PRIVATE NOTES & RATING",
    description:
      "Score the candidate and take notes during the call. Nothing is stored or shared — copy or download when you leave.",
  },
]

export function FeaturesSection() {
  return (
    <section className="border-t border-studio-border py-24 md:py-32">
      {/* Section header */}
      <div className="px-6">
        <h2
          className="mb-16 font-bold tracking-[-0.02em] text-white uppercase"
          style={{ fontSize: "clamp(28px, 4vw, 48px)" }}
        >
          How It Works
        </h2>

        {/* Feature rows */}
        <div>
          {FEATURES.map(({ index, title, description }) => (
            <div
              key={index}
              className="flex flex-col gap-2 border-b border-studio-border py-6 md:flex-row md:items-baseline md:gap-8"
            >
              {/* Index */}
              <span className="w-8 shrink-0 font-bold text-studio-orange">
                {index}
              </span>

              {/* Title — expands to fill available width on desktop */}
              <span className="flex-1 text-sm font-bold tracking-[-0.02em] text-white uppercase md:text-base">
                {title}
              </span>

              {/* Description — right-aligned on desktop, max width constrained */}
              <span className="text-base leading-relaxed text-studio-muted md:ml-auto md:max-w-sm">
                {description}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
