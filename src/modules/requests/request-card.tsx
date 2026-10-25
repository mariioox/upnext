import { Link } from "react-router-dom"
import type { RequestItem } from "@/models"
import { VoteButton } from "@/modules/voting/vote-button"
import { STATUS_LABEL, StatusSwatch } from "@/components/brand/status-swatch"
import { routes } from "@/utils/routes"

export interface RequestCardProps {
  request: RequestItem
  showStatus?: boolean
}

/** A request in the feed: vote box on the left, status flair and byline above the title. */
export function RequestCard({ request, showStatus = true }: RequestCardProps) {
  const posted = new Date(request.createdAt)
  const formattedDate = posted.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })

  return (
    <article className="flex items-start gap-4 border border-line bg-card px-4 py-4 transition-colors hover:border-ink sm:gap-5 sm:px-5">
      <VoteButton
        requestId={request.id}
        voteCount={request.voteCount}
        viewerHasVoted={request.viewerHasVoted}
        status={request.status}
        title={request.title}
      />

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <p className="m-0 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[12.5px] text-ink-muted">
          {showStatus && (
            <span className="inline-flex items-center gap-1.5 font-semibold text-ink">
              <StatusSwatch status={request.status} />
              {STATUS_LABEL[request.status]}
            </span>
          )}
          {showStatus && <span aria-hidden="true">·</span>}
          <span className="max-w-[16ch] truncate sm:max-w-none">posted by {request.authorName}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={request.createdAt}>{formattedDate}</time>
        </p>

        <h2 className="m-0 text-lg font-extrabold leading-snug break-words sm:text-xl">
          <Link
            to={routes.request(request.id)}
            className="text-ink no-underline decoration-signal decoration-[3px] underline-offset-4 hover:underline"
          >
            {request.title}
          </Link>
        </h2>

        <p className="m-0 line-clamp-2 text-[15px] leading-relaxed break-words text-ink/85">{request.description}</p>

        {(request.tags?.length > 0 || request.status === "COMPLETED") && (
          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            {request.tags?.map((tag) => (
              <span key={tag} className="border border-ink bg-tag px-2 py-0.5 font-mono text-xs">
                #{tag}
              </span>
            ))}
            {request.status === "COMPLETED" && (
              <span className="font-mono text-xs font-semibold">Shipped · voting closed</span>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
