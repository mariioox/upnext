import { useListStatusHistoryQuery } from "@/services/endpoints/history"
import { Dialog } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge } from "@/components/shared/status-badge"
import { ArrowRight, Clock, User } from "lucide-react"

export interface StatusHistoryDialogProps {
  requestId: string | null
  requestTitle?: string
  isOpen: boolean
  onClose: () => void
}

export function StatusHistoryDialog({
  requestId,
  requestTitle,
  isOpen,
  onClose,
}: StatusHistoryDialogProps) {
  const { data: history = [], isLoading, isError } = useListStatusHistoryQuery(
    requestId || "",
    { skip: !requestId || !isOpen }
  )

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="Status history"
      description={requestTitle ?? "Every status change for this request, newest last."}
      className="max-w-md"
    >
        <div className="py-2">
          {isLoading ? (
            <div className="py-4" aria-busy="true">
              <Skeleton shape="text" lines={4} />
            </div>
          ) : isError ? (
            <p className="text-sm text-danger-ink py-4 text-center">
              We couldn't load the status history. Close this and try again.
            </p>
          ) : history.length === 0 ? (
            <p className="text-sm text-ink-muted py-6 text-center italic">
              No status changes recorded for this request yet.
            </p>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-line">
              {history.map((entry) => {
                const formattedTime = new Date(entry.changedAt).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })

                return (
                  <div key={entry.id} className="relative flex flex-col gap-1.5">
                    <div className="absolute -left-6 top-1 w-3 h-3 bg-signal border-2 border-white" />

                    <div className="flex items-center gap-2 text-xs flex-wrap">
                      {entry.fromStatus && (
                        <>
                          <StatusBadge status={entry.fromStatus} />
                          <ArrowRight className="w-3 h-3 text-ink-muted" />
                        </>
                      )}
                      <StatusBadge status={entry.toStatus} />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-ink-muted pt-0.5">
                      <span className="flex items-center gap-1 font-medium text-ink">
                        <User className="w-3 h-3" />
                        {entry.changedBy}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formattedTime}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
    </Dialog>
  )
}
