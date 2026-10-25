import type { Status } from "@/models"
import { cn } from "@/lib/cn"

/** Pattern density per status: Open is empty, Shipped is solid. Always shown beside a written label. */
export const STATUS_PATTERN: Record<Status, string> = {
  OPEN: "",
  PLANNED: "dither-25",
  IN_PROGRESS: "dither-50",
  COMPLETED: "dither-solid",
}

export const STATUS_LABEL: Record<Status, string> = {
  OPEN: "Open",
  PLANNED: "Planned",
  IN_PROGRESS: "In progress",
  COMPLETED: "Shipped",
}

export function StatusSwatch({ status, className }: { status: Status; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("inline-block size-3 shrink-0 border-2 border-ink bg-card", STATUS_PATTERN[status], className)}
    />
  )
}
