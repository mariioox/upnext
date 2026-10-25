/** Empty-state art: a pixel ballot box with the arrow peeking out. Decorative only. */
export function PixelBallot({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 34" aria-hidden="true" focusable="false" className={["pixelated", className].filter(Boolean).join(" ")}>
      <defs>
        <pattern id="pb-50" width="2" height="2" patternUnits="userSpaceOnUse">
          <rect width="1" height="1" fill="#141414" />
          <rect x="1" y="1" width="1" height="1" fill="#141414" />
        </pattern>
        <pattern id="pb-25" width="2" height="2" patternUnits="userSpaceOnUse">
          <rect width="1" height="1" fill="#141414" />
        </pattern>
      </defs>
      <rect x="6" y="30" width="30" height="3" fill="url(#pb-25)" />
      <g className="un-peek">
        <path d="M18 2h2v2h2v2h2v2h-4v8h-2V8h-4V6h2V4h2z" fill="#FF5A1F" stroke="#141414" strokeWidth="0.6" />
      </g>
      <rect x="4" y="12" width="30" height="18" fill="#FBFAF6" stroke="#141414" strokeWidth="2" />
      <rect x="4" y="12" width="30" height="5" fill="url(#pb-50)" />
      <rect x="12" y="13.5" width="14" height="2" fill="#141414" />
      <rect x="15" y="21" width="2" height="2" fill="#141414" />
      <rect x="21" y="21" width="2" height="2" fill="#141414" />
      <rect x="17" y="25" width="4" height="1.5" fill="#141414" />
    </svg>
  )
}
