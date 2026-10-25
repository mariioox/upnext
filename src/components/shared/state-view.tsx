import React from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState, type EmptyStateAction } from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"
import type { ApiError } from "@/services/httpClient/apiError"
import { getProblemMessage } from "@/utils/problemMessages"

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
  children: (data: T) => React.ReactNode
}

export function StateView<T>({
  isLoading,
  isError,
  error,
  data,
  isEmpty,
  emptyTitle = "No items found",
  emptyDescription = "There are no items to display right now.",
  emptyAction,
  onRetry,
  skeletonCount = 3,
  children,
}: StateViewProps<T>) {
  if (isLoading) {
    return (
      <div className="space-y-4" aria-busy="true">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <Skeleton key={i} shape="card" />
        ))}
      </div>
    )
  }

  if (isError) {
    const apiErr = error as ApiError | undefined
    let message = "An error occurred while loading data."
    let requestId: string | undefined

    if (apiErr?.kind === "problem" && apiErr.problem) {
      message = getProblemMessage(apiErr.problem)
      requestId = apiErr.problem.requestId
    } else if (apiErr?.kind === "network" && apiErr.message) {
      message = apiErr.message
    }

    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-900">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Failed to load</h3>
            <p className="mt-1 text-sm text-red-700">{message}</p>
            {requestId && (
              <p className="mt-2 text-xs text-red-500 font-mono">
                Support reference: {requestId}
              </p>
            )}
            {onRetry && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onRetry}
                className="mt-4 border-red-300 text-red-800 hover:bg-red-100"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Try again
              </Button>
            )}
          </div>
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
      />
    )
  }

  return <>{children(data)}</>
}
