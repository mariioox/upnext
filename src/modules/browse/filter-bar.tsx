import { useListTagsQuery } from "@/services/endpoints/tags"
import type { Status } from "@/models"
import { FilterBar as SharedFilterBar, FilterGroup } from "@/components/ui/filter-bar"
import { FormField } from "@/components/ui/form-field"
import { Select, type SelectOption } from "@/components/ui/select"
import { cn } from "@/lib/cn"
import { STATUS_LABEL } from "@/components/brand/status-swatch"

export interface FilterBarProps {
  searchQuery: string
  onSearchChange: (q: string) => void
  selectedStatus?: Status
  onStatusChange: (status?: Status) => void
  selectedTag?: string
  onTagChange: (tag?: string) => void
  onClearFilters: () => void
  /** Announced politely, e.g. "12 requests found". Leave undefined while loading. */
  resultMessage?: string
}

const STATUS_OPTIONS: SelectOption[] = (["OPEN", "PLANNED", "IN_PROGRESS", "COMPLETED"] as const).map((s) => ({
  value: s,
  label: STATUS_LABEL[s],
}))

/** The browse page's filters, laid out by the shared FilterBar. State lives in RequestList. */
export function FilterBar({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedTag,
  onTagChange,
  onClearFilters,
  resultMessage,
}: FilterBarProps) {
  const { data: tags = [] } = useListTagsQuery()
  const activeCount = (selectedStatus ? 1 : 0) + (selectedTag ? 1 : 0)

  return (
    <div className="border border-line bg-card p-4">
      <SharedFilterBar
        query={searchQuery}
        onQueryChange={onSearchChange}
        searchLabel="Search requests"
        searchPlaceholder="e.g. dark mode"
        activeCount={activeCount}
        onClearAll={onClearFilters}
        resultMessage={resultMessage}
      >
        <FormField label="Status" className="sm:w-48">
          {(control) => (
            <Select
              {...control}
              options={STATUS_OPTIONS}
              value={selectedStatus}
              onValueChange={(v) => onStatusChange(v as Status | undefined)}
              allowAny
              anyLabel="All statuses"
            />
          )}
        </FormField>
      </SharedFilterBar>

      {tags.length > 0 && (
        <FilterGroup legend="Tags" className="mt-3 border-t border-line pt-3">
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => {
              const isSelected = selectedTag === t.tag
              return (
                <button
                  key={t.tag}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onTagChange(isSelected ? undefined : t.tag)}
                  className={cn(
                    "min-h-8 cursor-pointer border px-3 font-mono text-[13px] font-medium transition-colors",
                    isSelected ? "border-ink bg-ink text-paper" : "border-line-strong bg-transparent text-ink hover:border-ink",
                  )}
                >
                  #{t.tag} <span className={isSelected ? "text-paper/80" : "text-ink-muted"}>({t.count})</span>
                </button>
              )
            })}
          </div>
        </FilterGroup>
      )}
    </div>
  )
}
