import { useEffect, useState } from "react"
import { ARROW_PATH } from "./pixel-arrow"

const LINES = [
  "Counting votes…",
  "Sorting the loudest ideas to the top…",
  "Dusting off the roadmap…",
  "Lining up the pixels…",
  "Asking the server nicely…",
]

/** After this long, say the free-tier server is probably waking up. */
const SLOW_AFTER_MS = 3000

export type BitmapLoaderProps = {
  /** What is loading, e.g. "the board". Read out to screen readers once. */
  what?: string
  /** Skeleton rows drawn under the loader. */
  rows?: number
}

/**
 * Loading state: the pixel arrow "develops" from sparse dots to solid orange, a line of copy
 * rotates, and skeleton cards shimmer. After 3 s it explains the demo server may be waking up.
 * Screen readers hear one polite status; the rotating copy is decorative and hidden from them.
 */
export function BitmapLoader({ what = "the board", rows = 3 }: BitmapLoaderProps) {
  const [line, setLine] = useState(0)
  const [slow, setSlow] = useState(false)

  useEffect(() => {
    const rotate = window.setInterval(() => setLine((i) => (i + 1) % LINES.length), 1800)
    const slowTimer = window.setTimeout(() => setSlow(true), SLOW_AFTER_MS)
    return () => {
      window.clearInterval(rotate)
      window.clearTimeout(slowTimer)
    }
  }, [])

  return (
    <div aria-busy="true" className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-5">
        <div aria-hidden="true" className="grid size-24 shrink-0 place-items-center border-2 border-ink bg-card">
          <svg viewBox="0 0 14 14" className="pixelated size-16 overflow-visible">
            <defs>
              <pattern id="ld-06" width="4" height="4" patternUnits="userSpaceOnUse">
                <rect width="1" height="1" fill="#141414" />
              </pattern>
              <pattern id="ld-25" width="2" height="2" patternUnits="userSpaceOnUse">
                <rect width="1" height="1" fill="#141414" />
              </pattern>
              <pattern id="ld-50" width="2" height="2" patternUnits="userSpaceOnUse">
                <rect width="1" height="1" fill="#141414" />
                <rect x="1" y="1" width="1" height="1" fill="#141414" />
              </pattern>
            </defs>
            <path className="un-layer" d={ARROW_PATH} fill="url(#ld-06)" />
            <path className="un-layer un-layer-2" d={ARROW_PATH} fill="url(#ld-25)" />
            <path className="un-layer un-layer-3" d={ARROW_PATH} fill="url(#ld-50)" />
            <path className="un-layer un-layer-4" d={ARROW_PATH} fill="#FF5A1F" stroke="#141414" strokeWidth="0.5" />
          </svg>
        </div>
        <div className="flex min-w-0 flex-col gap-1.5">
          <p role="status" className="m-0 text-2xl font-black tracking-tight">
            Fetching {what}
            <span aria-hidden="true" className="un-blink">
              _
            </span>
          </p>
          <p key={line} aria-hidden="true" className="un-rise m-0 font-mono text-sm text-ink-muted">
            {LINES[line]}
          </p>
        </div>
      </div>

      {slow && (
        <p role="status" className="un-rise m-0 max-w-xl border-2 border-ink bg-card px-4 py-3 text-sm leading-relaxed">
          <strong>Waking up the demo server…</strong> Free servers nap when nobody is using them. The first
          load can take up to a minute.
        </p>
      )}

      <div aria-hidden="true" className="flex flex-col gap-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="relative flex gap-4 overflow-hidden border border-line bg-card p-4">
            <div className="dither-25 h-[60px] w-12 shrink-0 border-2 border-ink" />
            <div className="flex flex-1 flex-col gap-2.5 pt-0.5">
              <div className="dither-06 h-3.5 w-1/3 border-2 border-ink" />
              <div className="dither-50 h-3.5 border-2 border-ink" style={{ width: `${[72, 58, 66, 48][i % 4]}%` }} />
              <div className="dither-06 h-3.5 w-5/6 border-2 border-ink" />
            </div>
            <div className="un-scan dither-75" />
          </div>
        ))}
      </div>
    </div>
  )
}
