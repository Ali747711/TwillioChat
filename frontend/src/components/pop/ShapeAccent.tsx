import { motion } from "motion/react"

type ShapeKind = "circle" | "triangle" | "square" | "blob"
type ShapeTone = "orange" | "blue" | "yellow" | "cream" | "brown"

interface ShapeAccentProps {
  kind: ShapeKind
  tone: ShapeTone
  size?: number
  className?: string
  /** Rotation offset in degrees, purely cosmetic. */
  rotate?: number
  /** Float animation delay so a cluster of shapes doesn't move in unison. */
  delay?: number
}

const TONE_BG: Record<ShapeTone, string> = {
  orange: "bg-pop-orange",
  blue: "bg-pop-blue",
  yellow: "bg-pop-yellow",
  cream: "bg-pop-cream",
  brown: "bg-pop-brown",
}

const SHAPE_CLASSES: Record<ShapeKind, string> = {
  circle: "rounded-full border-[3px] border-pop-brown",
  square: "rounded-2xl border-[3px] border-pop-brown",
  blob: "border-[3px] border-pop-brown [border-radius:62%_38%_55%_45%/45%_55%_38%_62%]",
  triangle: "",
}

// Decorative geometric shapes floating over color-field sections. Purely
// aria-hidden set dressing — never carries content or interaction. Triangles
// use clip-path (no border achievable), everything else gets the brief's
// solid chunky border treatment.
export function ShapeAccent({
  kind,
  tone,
  size = 64,
  className = "",
  rotate = 0,
  delay = 0,
}: ShapeAccentProps) {
  if (kind === "triangle") {
    return (
      <motion.div
        aria-hidden
        className={`pointer-events-none absolute ${className}`}
        style={{
          width: size,
          height: size,
          rotate,
        }}
        animate={{ y: [0, -14, 0], rotate: [rotate, rotate + 6, rotate] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay }}
      >
        <div
          className={`h-full w-full ${TONE_BG[tone]}`}
          style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
        />
      </motion.div>
    )
  }

  return (
    <motion.div
      aria-hidden
      className={`pointer-events-none absolute ${TONE_BG[tone]} ${SHAPE_CLASSES[kind]} ${className}`}
      style={{ width: size, height: size, rotate }}
      animate={{ y: [0, -14, 0], rotate: [rotate, rotate + 6, rotate] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay }}
    />
  )
}
