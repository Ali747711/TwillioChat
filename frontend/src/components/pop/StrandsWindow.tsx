import { motion } from "motion/react"
import Strands from "./Strands"

// The hero's product visual: a framed "live" window that showcases the Strands
// effect on a deep backing, so the cream/yellow/blue strands glow. Uses the pop
// bento language (3px brown border + hard offset shadow).
export function StrandsWindow() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] border-[3px] border-pop-brown bg-pop-brown shadow-[8px_8px_0_0_var(--color-pop-brown)]"
    >
      {/* Window chrome dots */}
      <div className="absolute top-4 left-4 z-10 flex gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-pop-orange" />
        <span className="h-2.5 w-2.5 rounded-full bg-pop-yellow" />
        <span className="h-2.5 w-2.5 rounded-full bg-pop-blue" />
      </div>
      {/* Live pill */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 rounded-full border border-pop-cream/30 bg-pop-brown/60 px-2.5 py-1 backdrop-blur">
        <span className="h-1.5 w-1.5 rounded-full bg-pop-yellow" />
        <span className="text-[10px] font-bold tracking-[0.18em] text-pop-cream uppercase">
          Live
        </span>
      </div>
      <Strands
        colors={["#FBF0D9", "#FFD35C", "#3A66C4"]}
        count={4}
        speed={0.5}
        amplitude={1.2}
        waviness={1.1}
        thickness={0.7}
        glow={2.8}
        taper={2.4}
        spread={1}
        intensity={0.7}
        saturation={1.4}
        opacity={1}
        scale={1.1}
      />
    </motion.div>
  )
}
