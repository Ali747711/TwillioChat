import { GrainOverlay } from './components/studio/GrainOverlay'
import { StudioHeader } from './components/studio/StudioHeader'
import { StudioHero } from './components/studio/StudioHero'
import { MetricBar } from './components/studio/MetricBar'
import { FeaturesSection } from './components/studio/FeaturesSection'

export default function Landing() {
  return (
    <main className="relative min-h-screen bg-studio-bg text-white">
      <GrainOverlay />
      <StudioHeader />
      <StudioHero />
      <MetricBar />
      <FeaturesSection />
    </main>
  )
}
