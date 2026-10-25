import { Link } from "react-router-dom"
import { useGetRoadmapQuery } from "@/services/endpoints/roadmap"
import { LinkButton } from "@/components/shared/link-button"
import { STATUS_LABEL, STATUS_PATTERN, StatusSwatch } from "@/components/brand/status-swatch"
import { routes } from "@/utils/routes"
import { cn } from "@/lib/cn"
import type { Status } from "@/models"

const CELLS = 10

/** Right-hand column on the feed: how voting works, and a pixel-bar snapshot of the roadmap. */
export function BoardSidebar() {
  const { data: roadmap } = useGetRoadmapQuery()

  const rows: { status: Status; count: number }[] = roadmap
    ? [
        { status: "PLANNED", count: roadmap.planned?.length ?? 0 },
        { status: "IN_PROGRESS", count: roadmap.inProgress?.length ?? 0 },
        { status: "COMPLETED", count: roadmap.completed?.length ?? 0 },
      ]
    : []
  const max = Math.max(1, ...rows.map((r) => r.count))

  return (
    <aside aria-label="About this board" className="flex flex-col gap-5">
      <section className="flex flex-col gap-3 border border-line bg-card p-5">
        <h2 className="m-0 text-lg font-extrabold">How voting works</h2>
        <ul className="m-0 flex flex-col gap-2 pl-5 text-[15px] leading-snug">
          <li>One vote per person. Sign in to vote.</li>
          <li>Changed your mind? Click again to take it back.</li>
          <li>Shipped requests close to voting.</li>
        </ul>
        <LinkButton to={routes.submit} className="mt-1 border-2 border-ink font-bold">
          + Submit an idea
        </LinkButton>
      </section>

      {rows.length > 0 && (
        <section className="flex flex-col gap-3.5 border border-line bg-card p-5">
          <h2 className="m-0 text-lg font-extrabold">Roadmap snapshot</h2>
          {rows.map(({ status, count }) => {
            const filled = count === 0 ? 0 : Math.max(1, Math.round((count / max) * CELLS))
            return (
              <div key={status} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="inline-flex items-center gap-2 font-bold">
                    <StatusSwatch status={status} />
                    {STATUS_LABEL[status]}
                  </span>
                  <span className="font-pixel text-base font-bold">{count}</span>
                </div>
                <div aria-hidden="true" className="flex gap-[3px]">
                  {Array.from({ length: CELLS }).map((_, i) => (
                    <span
                      key={i}
                      className={cn("size-3.5 border-2 border-ink", i < filled && (STATUS_PATTERN[status] || "dither-06"))}
                    />
                  ))}
                </div>
              </div>
            )
          })}
          <Link to={routes.roadmap} className="text-sm font-bold text-ink">
            See the full roadmap →
          </Link>
        </section>
      )}
    </aside>
  )
}
