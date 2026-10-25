import { Link } from "react-router-dom"
import type { RequestItem } from "@/models"
import { StatusBadge } from "@/components/shared/status-badge"
import { VoteButton } from "@/modules/voting/vote-button"
import { routes } from "@/utils/routes"
import { Clock, User } from "lucide-react"

export interface RequestCardProps {
  request: RequestItem
  showStatus?: boolean
}

export function RequestCard({ request, showStatus = true }: RequestCardProps) {
  const formattedDate = new Date(request.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return (
    <article className="group bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex items-start gap-4">
      <VoteButton
        requestId={request.id}
        voteCount={request.voteCount}
        viewerHasVoted={request.viewerHasVoted}
        status={request.status}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <Link
            to={routes.request(request.id)}
            className="text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors break-words line-clamp-2"
          >
            {request.title}
          </Link>
          {showStatus && <StatusBadge status={request.status} className="shrink-0" />}
        </div>

        <p className="text-sm text-slate-600 line-clamp-2 mb-3 break-words">
          {request.description}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-4 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-1.5">
            {request.tags && request.tags.length > 0 ? (
              request.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-medium text-[11px]"
                >
                  #{tag}
                </span>
              ))
            ) : (
              <span className="text-slate-500 italic">No tags</span>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="flex items-center gap-1" title={`Submitted by ${request.authorName}`}>
              <User className="w-3.5 h-3.5" />
              <span className="truncate max-w-[120px]">{request.authorName}</span>
            </span>
            <span className="flex items-center gap-1" title={request.createdAt}>
              <Clock className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}
