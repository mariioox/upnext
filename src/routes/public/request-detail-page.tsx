import { useParams } from "react-router-dom"
import { useGetRequestQuery } from "@/services/endpoints/requests"
import { StateView } from "@/components/shared/state-view"
import { StatusBadge } from "@/components/shared/status-badge"
import { VoteButton } from "@/modules/voting/vote-button"
import { LinkButton } from "@/components/shared/link-button"
import { routes } from "@/utils/routes"
import { ArrowLeft, Clock, User } from "lucide-react"

export function RequestDetailPage() {
  const { id = "" } = useParams<{ id: string }>()
  const { data: request, isLoading, isError, error, refetch } = useGetRequestQuery(id)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <LinkButton to={routes.browse} variant="ghost" size="sm" className="-ml-3">
            <ArrowLeft aria-hidden="true" className="size-4" />
            All requests
          </LinkButton>
      </div>

      <StateView
        isLoading={isLoading}
        isError={isError}
        error={error}
        data={request}
        onRetry={refetch}
        loadingLabel="the request"
      >
        {(item) => {
          const createdDate = new Date(item.createdAt).toLocaleDateString(undefined, {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
          const updatedDate = new Date(item.updatedAt).toLocaleDateString(undefined, {
            month: "long",
            day: "numeric",
            year: "numeric",
          })

          return (
            <article className="border border-line bg-card p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-line">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={item.status} />
                    {item.tags?.map((t) => (
                      <span
                        key={t}
                        className="border border-ink bg-tag px-2 py-0.5 font-mono text-xs"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                  <h1 className="m-0 text-3xl leading-tight font-black tracking-tight break-words sm:text-4xl">
                    {item.title}
                  </h1>
                </div>

                <div className="self-end sm:self-auto shrink-0">
                  <VoteButton
                    requestId={item.id}
                    voteCount={item.voteCount}
                    viewerHasVoted={item.viewerHasVoted}
                    status={item.status}
                    title={item.title}
                    size="lg"
                  />
                </div>
              </div>

              <div className="border-b border-line py-6">
                <h2 className="m-0 mb-2 font-mono text-[13px] font-semibold tracking-[0.12em] text-ink-muted uppercase">
                  Description
                </h2>
                <p className="m-0 text-base leading-relaxed whitespace-pre-line break-words">
                  {item.description}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 font-mono text-[12.5px] text-ink-muted">
                <div className="flex items-center gap-2">
                  <User aria-hidden="true" className="size-4" />
                  <span>Submitted by <strong>{item.authorName}</strong></span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5" title={`Created: ${item.createdAt}`}>
                    <Clock aria-hidden="true" className="size-3.5" />
                    Posted on {createdDate}
                  </span>
                  {item.createdAt !== item.updatedAt && (
                    <span>
                      (Updated {updatedDate})
                    </span>
                  )}
                </div>
              </div>
            </article>
          )
        }}
      </StateView>
    </div>
  )
}
