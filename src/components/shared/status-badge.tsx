import type { Status } from "@/models"
import { StatusBadge as SharedStatusBadge } from "@/components/ui/status-badge"
import { STATUS_LABEL, StatusSwatch } from "@/components/brand/status-swatch"

/**
 * The shared StatusBadge, in the neutral tone, with up-next's dither swatch as its icon.
 * Statuses are told apart by pattern density and the written label, never colour alone.
 */
export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  return (
    <SharedStatusBadge tone="neutral" icon={<StatusSwatch status={status} />} className={className}>
      {STATUS_LABEL[status] ?? status}
    </SharedStatusBadge>
  )
}
