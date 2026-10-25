import { useGetMetaQuery } from "@/services/endpoints/meta"

/** Honesty label: on every page, above everything else. */
export function DemoBanner() {
  const { data: meta } = useGetMetaQuery()

  return (
    <aside
      aria-label="Demonstration notice"
      className="sticky top-0 z-50 flex h-9 items-center justify-center bg-ink px-4 text-center font-mono text-[12.5px] text-paper"
    >
      <p className="m-0 truncate">
        <strong className="text-signal">DEMO</strong>
        <span className="hidden sm:inline"> · A fictional feedback board. Nothing here is real customer data.</span>
        <span className="sm:hidden"> · Fictional board, not real data</span>
        {meta && <span className="hidden md:inline"> ({meta.productName} v{meta.version})</span>}
      </p>
    </aside>
  )
}
