interface FeatureRow {
  index: string
  title: string
  description: string
}

const FEATURES: FeatureRow[] = [
  {
    index: '01',
    title: 'VIDEO ROOMS',
    description:
      'Spin up a private room in seconds. No download, no account — share a link and everyone joins.',
  },
  {
    index: '02',
    title: 'SCREEN SHARE',
    description:
      'Show your whole desktop or a single tab. Participants see it immediately, no setup required.',
  },
  {
    index: '03',
    title: 'LIVE CHAT',
    description:
      'Send messages alongside the call. The thread persists so nothing gets lost once the video ends.',
  },
]

export function FeaturesSection() {
  return (
    <section className="border-t border-studio-border py-24 md:py-32">
      {/* Section header */}
      <div className="px-6">
        <h2
          className="mb-16 font-bold uppercase tracking-[-0.02em] text-white"
          style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}
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
              <span className="flex-1 text-sm font-bold uppercase tracking-[-0.02em] text-white md:text-base">
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
