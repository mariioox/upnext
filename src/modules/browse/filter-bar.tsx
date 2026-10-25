import { useListTagsQuery } from "@/services/endpoints/tags";
import type { Status } from "@/models";
import {
  FilterBar as SharedFilterBar,
  FilterGroup,
} from "@/components/ui/filter-bar";
import { FormField } from "@/components/ui/form-field";
import { Select, type SelectOption } from "@/components/ui/select";
import { cn } from "@/lib/cn";

export interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedStatus?: Status;
  onStatusChange: (status?: Status) => void;
  selectedTag?: string;
  onTagChange: (tag?: string) => void;
  selectedSort: "votes" | "newest";
  onSortChange: (sort: "votes" | "newest") => void;
  onClearFilters: () => void;
  /** Announced politely, e.g. "12 requests found". Leave undefined while loading. */
  resultMessage?: string;
}

const STATUS_OPTIONS: SelectOption[] = [
  { value: "OPEN", label: "Open" },
  { value: "PLANNED", label: "Planned" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "COMPLETED", label: "Completed" },
];

const SORT_OPTIONS: SelectOption[] = [
  { value: "votes", label: "Most upvoted" },
  { value: "newest", label: "Newest first" },
];

/** The browse page's filters, laid out by the shared FilterBar. State lives in RequestList. */
export function FilterBar({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedTag,
  onTagChange,
  selectedSort,
  onSortChange,
  onClearFilters,
  resultMessage,
}: FilterBarProps) {
  const { data: tags = [] } = useListTagsQuery();
  const activeCount = (selectedStatus ? 1 : 0) + (selectedTag ? 1 : 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
      <SharedFilterBar
        query={searchQuery}
        onQueryChange={onSearchChange}
        searchLabel="Search requests"
        searchPlaceholder="e.g. dark mode"
        activeCount={activeCount}
        onClearAll={onClearFilters}
        resultMessage={resultMessage}
      >
        <FormField label="Status" className="sm:w-44">
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
        <FormField label="Sort by" className="sm:w-44">
          {(control) => (
            <Select
              {...control}
              options={SORT_OPTIONS}
              value={selectedSort}
              onValueChange={(v) =>
                onSortChange(v === "newest" ? "newest" : "votes")
              }
            />
          )}
        </FormField>
      </SharedFilterBar>

      {tags.length > 0 && (
        <FilterGroup
          legend="Tags"
          className="mt-3 border-t border-slate-100 pt-3"
        >
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => {
              const isSelected = selectedTag === t.tag;
              return (
                <button
                  key={t.tag}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onTagChange(isSelected ? undefined : t.tag)}
                  className={cn(
                    "min-h-8 cursor-pointer rounded-full border px-3 text-xs font-medium transition-colors",
                    isSelected
                      ? "border-blue-700 bg-blue-700 text-white"
                      : "border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100",
                  )}
                >
                  #{t.tag}{" "}
                  <span
                    className={isSelected ? "text-blue-100" : "text-slate-600"}
                  >
                    ({t.count})
                  </span>
                </button>
              );
            })}
          </div>
        </FilterGroup>
      )}
    </div>
  );
}
