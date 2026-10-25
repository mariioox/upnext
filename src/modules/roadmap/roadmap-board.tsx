import { useGetRoadmapQuery } from "@/services/endpoints/roadmap"
import { StateView } from "@/components/shared/state-view"
import { StatusBadge } from "@/components/shared/status-badge"
import { VoteButton } from "@/modules/voting/vote-button"
import { Link } from "react-router-dom"
import { routes } from "@/utils/routes"
import type { RequestItem, Status } from "@/models"
import { Clock, Calendar, CheckCircle2, Loader2 } from "lucide-react"

export function RoadmapBoard() {
  const { data: roadmap, isLoading, isError, error, refetch } = useGetRoadmapQuery()

  const columns: {
    title: string
    status: Status
    description: string
    icon: React.ReactNode
    items: RequestItem[]
    badgeClass: string
  }[] = [
    {
      title: "Planned",
      status: "PLANNED",
      description: "Approved requests committed to the roadmap.",
      icon: <Calendar className="w-4 h-4 text-blue-600" />,
      items: roadmap?.planned || [],
      badgeClass: "bg-blue-100 text-blue-800",
    },
    {
      title: "In Progress",
      status: "IN_PROGRESS",
      description: "Currently being designed and developed.",
      icon: <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />,
      items: roadmap?.inProgress || [],
      badgeClass: "bg-amber-100 text-amber-800",
    },
    {
      title: "Completed",
      status: "COMPLETED",
      description: "Recently shipped and live for users.",
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
      items: roadmap?.completed || [],
      badgeClass: "bg-emerald-100 text-emerald-800",
    },
  ]

  const totalCards = (roadmap?.planned?.length || 0) + (roadmap?.inProgress?.length || 0) + (roadmap?.completed?.length || 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
        <p className="text-sm text-slate-600">
          Transparent view of upcoming features. Open requests move here once planned.
        </p>
        {roadmap?.generatedAt && (
          <span className="text-xs text-slate-600 flex items-center gap-1 self-start sm:self-auto">
            <Clock className="w-3.5 h-3.5" />
            Updated {new Date(roadmap.generatedAt).toLocaleTimeString()}
          </span>
        )}
      </div>

      <StateView
        isLoading={isLoading}
        isError={isError}
        error={error}
        data={roadmap}
        isEmpty={() => totalCards === 0}
        emptyTitle="No features on the roadmap yet"
        emptyDescription="Features appear on the roadmap once planned, in progress, or completed by the team."
        onRetry={refetch}
        skeletonCount={3}
      >
        {() => (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {columns.map((column) => (
              <div
                key={column.status}
                className="bg-slate-100/70 border border-slate-200 rounded-2xl p-4 flex flex-col gap-3"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    {column.icon}
                    <h2 className="font-bold text-slate-800 text-base">{column.title}</h2>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${column.badgeClass}`}>
                    {column.items.length}
                  </span>
                </div>

                <p className="text-xs text-slate-600">{column.description}</p>

                {/* Column Cards */}
                <div className="space-y-3 mt-1 min-h-[160px]">
                  {column.items.length === 0 ? (
                    <div className="h-32 border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-600 text-center p-4">
                      No requests in this stage
                    </div>
                  ) : (
                    column.items.map((card) => (
                      <RoadmapCardItem key={card.id} card={card} />
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </StateView>
    </div>
  )
}

function RoadmapCardItem({ card }: { card: RequestItem }) {
  return (
    <article className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:shadow-md transition-shadow flex flex-col gap-3 group">
      <div className="flex items-start justify-between gap-2">
        <Link
          to={routes.request(card.id)}
          className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2"
        >
          {card.title}
        </Link>
        <StatusBadge status={card.status} className="shrink-0 text-[10px] px-2" />
      </div>

      <p className="text-xs text-slate-600 line-clamp-2 break-words">
        {card.description}
      </p>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-auto">
        <div className="flex flex-wrap gap-1">
          {card.tags?.slice(0, 2).map((t) => (
            <span
              key={t}
              className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-medium"
            >
              #{t}
            </span>
          ))}
        </div>

        <VoteButton
          requestId={card.id}
          voteCount={card.voteCount}
          viewerHasVoted={card.viewerHasVoted}
          status={card.status}
          size="sm"
        />
      </div>
    </article>
  )
}
