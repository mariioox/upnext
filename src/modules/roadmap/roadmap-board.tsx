import { Link } from "react-router-dom"
import { useGetRoadmapQuery } from "@/services/endpoints/roadmap"
import { StateView } from "@/components/shared/state-view"
import { VoteButton } from "@/modules/voting/vote-button"
import { STATUS_LABEL, STATUS_PATTERN } from "@/components/brand/status-swatch"
import { routes } from "@/utils/routes"
import { cn } from "@/lib/cn"
import type { RequestItem, Status } from "@/models"

const BLURB: Partial<Record<Status, string>> = {
  PLANNED: "Agreed and on the list.",
  IN_PROGRESS: "Being designed and built right now.",
  COMPLETED: "Shipped and live.",
}

export function RoadmapBoard() {
  const { data: roadmap, isLoading, isError, error, refetch } = useGetRoadmapQuery()

  const columns: { status: Status; items: RequestItem[] }[] = [
    { status: "PLANNED", items: roadmap?.planned || [] },
    { status: "IN_PROGRESS", items: roadmap?.inProgress || [] },
    { status: "COMPLETED", items: roadmap?.completed || [] },
  ]
  const totalCards = columns.reduce((n, c) => n + c.items.length, 0)

  return (
    <div className="flex flex-col gap-4">
      {roadmap?.generatedAt && (
        <p className="m-0 font-mono text-[13px] text-ink-muted">Updated {new Date(roadmap.generatedAt).toLocaleTimeString()}</p>
      )}

      <StateView
        isLoading={isLoading}
        isError={isError}
        error={error}
        data={roadmap}
        isEmpty={() => totalCards === 0}
        emptyTitle="Nothing on the roadmap yet"
        emptyDescription="Requests show up here once the team plans them."
        onRetry={refetch}
        skeletonCount={3}
        loadingLabel="the roadmap"
      >
        {() => (
          <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-3">
            {columns.map((column) => (
              <section
                key={column.status}
                aria-label={`${STATUS_LABEL[column.status]}, ${column.items.length} ${column.items.length === 1 ? "request" : "requests"}`}
                className="flex flex-col border border-line bg-sunk"
              >
                <div aria-hidden="true" className={cn("h-5 border-b-2 border-ink bg-card", STATUS_PATTERN[column.status])} />
                <div className="flex items-center justify-between px-4 pt-3.5">
                  <h2 className="m-0 text-lg font-extrabold tracking-wide uppercase">{STATUS_LABEL[column.status]}</h2>
                  <span className="font-pixel text-xl font-bold">{column.items.length}</span>
                </div>
                <p className="m-0 px-4 pt-1 pb-3 text-sm text-ink-muted">{BLURB[column.status]}</p>

                <div className="flex min-h-40 flex-col gap-3 px-4 pb-4">
                  {column.items.length === 0 ? (
                    <div className="flex h-28 items-center justify-center border border-dashed border-line-strong p-4 text-center font-mono text-xs text-ink-muted">
                      Nothing at this stage yet
                    </div>
                  ) : (
                    column.items.map((card) => <RoadmapCardItem key={card.id} card={card} />)
                  )}
                </div>
              </section>
            ))}
          </div>
        )}
      </StateView>
    </div>
  )
}

function RoadmapCardItem({ card }: { card: RequestItem }) {
  return (
    <article className="flex gap-3 border border-line bg-card p-3.5 transition-colors hover:border-ink">
      <VoteButton
        requestId={card.id}
        voteCount={card.voteCount}
        viewerHasVoted={card.viewerHasVoted}
        status={card.status}
        title={card.title}
        size="sm"
      />
      <div className="flex min-w-0 flex-col gap-1.5">
        <h3 className="m-0 text-[15px] leading-snug font-bold">
          <Link to={routes.request(card.id)} className="text-ink no-underline decoration-signal decoration-[3px] underline-offset-4 hover:underline">
            {card.title}
          </Link>
        </h3>
        <p className="m-0 line-clamp-2 text-[13px] leading-snug break-words text-ink-muted">{card.description}</p>
        {card.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {card.tags.slice(0, 2).map((t) => (
              <span key={t} className="border border-ink bg-tag px-1.5 py-px font-mono text-[11px]">
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}
