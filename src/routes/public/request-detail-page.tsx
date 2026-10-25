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
        <LinkButton to={routes.browse} variant="ghost" size="sm" className="mb-4 text-slate-500 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to All Requests
          </LinkButton>
      </div>

      <StateView
        isLoading={isLoading}
        isError={isError}
        error={error}
        data={request}
        onRetry={refetch}
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
            <article className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={item.status} />
                    {item.tags?.map((t) => (
                      <span
                        key={t}
                        className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 break-words">
                    {item.title}
                  </h1>
                </div>

                <div className="self-end sm:self-auto shrink-0">
                  <VoteButton
                    requestId={item.id}
                    voteCount={item.voteCount}
                    viewerHasVoted={item.viewerHasVoted}
                    status={item.status}
                    size="lg"
                  />
                </div>
              </div>

              <div className="py-6 border-b border-slate-100 prose max-w-none">
                <h2 className="text-sm font-semibold uppercase text-slate-500 tracking-wider mb-2">
                  Description
                </h2>
                <p className="text-slate-700 whitespace-pre-line text-base leading-relaxed break-words">
                  {item.description}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-500" />
                  <span>Submitted by <strong>{item.authorName}</strong></span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5" title={`Created: ${item.createdAt}`}>
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    Posted on {createdDate}
                  </span>
                  {item.createdAt !== item.updatedAt && (
                    <span className="text-slate-500">
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
