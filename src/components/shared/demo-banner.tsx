import { useGetMetaQuery } from "@/services/endpoints/meta"
import { AlertCircle } from "lucide-react"

export function DemoBanner() {
  const { data: meta } = useGetMetaQuery()

  return (
    <aside
      aria-label="Demonstration notice"
      className="bg-amber-100 text-amber-950 border-b border-amber-300 px-4 py-2 text-xs md:text-sm font-medium flex items-center justify-between sticky top-0 z-50"
    >
      <div className="flex items-center gap-2 mx-auto">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>
          <strong>Demonstration data:</strong> Fictional feedback board and roadmap.
          {meta ? ` (${meta.productName} v${meta.version})` : ""}
        </span>
      </div>
    </aside>
  )
}
