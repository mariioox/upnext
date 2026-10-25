import { useId } from "react"
import { cn } from "@/lib/cn"

/** The up-next mark: a 7×7 pixel up-arrow, drawn on a 14-unit grid so dither pixels stay crisp. */
export const ARROW_PATH = "M6 0h2v2h2v2h2v2h2v2h-4v6H4V8H0V6h2V4h2V2h2z"

export type PixelArrowProps = {
  /** "solid" fills with ink; "dither" fills with a 50% checker (the unvoted state). */
  fill?: "solid" | "dither" | "signal"
  className?: string
}

/** Decorative: always aria-hidden. The control it sits in carries the accessible name. */
export function PixelArrow({ fill = "solid", className }: PixelArrowProps) {
  const id = useId()
  const patternId = `chk-${id.replace(/:/g, "")}`
  const paint = fill === "dither" ? `url(#${patternId})` : fill === "signal" ? "var(--color-signal)" : "currentColor"

  return (
    <svg viewBox="0 0 14 14" aria-hidden="true" focusable="false" className={cn("pixelated block", className)}>
      {fill === "dither" && (
        <defs>
          <pattern id={patternId} width="2" height="2" patternUnits="userSpaceOnUse">
            <rect width="1" height="1" fill="currentColor" />
            <rect x="1" y="1" width="1" height="1" fill="currentColor" />
          </pattern>
        </defs>
      )}
      <path d={ARROW_PATH} fill={paint} />
    </svg>
  )
}

/** Logo tile: orange square, ink border, solid arrow. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("grid size-9 shrink-0 place-items-center border-2 border-ink bg-signal text-ink", className)}
    >
      <PixelArrow className="size-[18px]" />
    </span>
  )
}
