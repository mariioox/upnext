import type { Status } from "@/models"
import { StatusBadge as SharedStatusBadge, type StatusBadgeTone } from "@/components/ui/status-badge"

/** Maps a request status onto the shared StatusBadge. The label is always written out. */
const STATUS: Record<Status, { label: string; tone: StatusBadgeTone }> = {
  OPEN: { label: "Open", tone: "neutral" },
  PLANNED: { label: "Planned", tone: "info" },
  IN_PROGRESS: { label: "In progress", tone: "warning" },
  COMPLETED: { label: "Completed", tone: "success" },
}

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const config = STATUS[status] ?? { label: status, tone: "neutral" as const }
  return (
    <SharedStatusBadge tone={config.tone} className={className}>
      {config.label}
    </SharedStatusBadge>
  )
}
