import React from "react"
import { EmptyState, type EmptyStateAction } from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import type { ApiError } from "@/services/httpClient/apiError"
import { getProblemMessage } from "@/utils/problemMessages"
import { BitmapLoader } from "@/components/brand/bitmap-loader"
import { PixelBallot } from "@/components/brand/pixel-ballot"

export interface StateViewProps<T> {
  isLoading: boolean
  isError: boolean
  error?: unknown
  data?: T
  isEmpty?: (data: T) => boolean
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: EmptyStateAction
  onRetry?: () => void
  skeletonCount?: number
  /** Finishes "Fetching …" in the loader, e.g. "the board". */
  loadingLabel?: string
  children: (data: T) => React.ReactNode
}

/** Loading, error and empty states in one place, so every screen handles all three the same way. */
export function StateView<T>({
  isLoading,
  isError,
  error,
  data,
  isEmpty,
  emptyTitle = "Nothing here yet",
  emptyDescription = "There is nothing to show right now.",
  emptyAction,
  onRetry,
  skeletonCount = 3,
  loadingLabel,
  children,
}: StateViewProps<T>) {
  if (isLoading) {
    return <BitmapLoader what={loadingLabel} rows={skeletonCount} />
  }

  if (isError) {
    const apiErr = error as ApiError | undefined
    let message = "Something went wrong while loading this. Your data is safe."
    let requestId: string | undefined

    if (apiErr?.kind === "problem" && apiErr.problem) {
      message = getProblemMessage(apiErr.problem)
      requestId = apiErr.problem.requestId
    } else if (apiErr?.kind === "network" && apiErr.message) {
      message = apiErr.message
    }

    return (
      <div role="alert" className="flex flex-col items-start gap-3 border-2 border-ink bg-card p-5 sm:flex-row sm:p-6">
        <span aria-hidden="true" className="dither-50 size-10 shrink-0 border-2 border-ink bg-signal" />
        <div className="flex min-w-0 flex-col gap-1.5">
          <h2 className="m-0 text-lg font-extrabold">We couldn’t load this</h2>
          <p className="m-0 text-[15px] leading-relaxed text-ink-muted">{message}</p>
          {requestId && <p className="m-0 font-mono text-xs text-ink-muted">Support reference: {requestId}</p>}
          {onRetry && (
            <Button variant="secondary" size="sm" onClick={onRetry} className="mt-2 self-start">
              <RefreshCw aria-hidden="true" className="size-3.5" />
              Try again
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (!data || (isEmpty && isEmpty(data))) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
        icon={<PixelBallot className="h-auto w-40" />}
        className="border border-dashed border-ink bg-card px-6 py-10"
      />
    )
  }

  return <>{children(data)}</>
}
