import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useListRequestsQuery } from "@/services/endpoints/requests"
import { FilterBar } from "./filter-bar"
import { RequestCard } from "@/modules/requests/request-card"
import { StateView } from "@/components/shared/state-view"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { routes } from "@/utils/routes"
import type { Status } from "@/models"
import { cn } from "@/lib/cn"

const SORTS = [
  { value: "votes", label: "Top" },
  { value: "newest", label: "New" },
] as const

export function RequestList() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<Status | undefined>(undefined)
  const [selectedTag, setSelectedTag] = useState<string | undefined>(undefined)
  const [selectedSort, setSelectedSort] = useState<"votes" | "newest">("votes")
  const [page, setPage] = useState(0)
  const pageSize = 15

  const hasActiveFilters = Boolean(searchQuery || selectedStatus || selectedTag)

  const queryArgs = useMemo(
    () => ({
      q: searchQuery.trim() || undefined,
      status: selectedStatus,
      tag: selectedTag,
      sort: selectedSort,
      page,
      size: pageSize,
    }),
    [searchQuery, selectedStatus, selectedTag, selectedSort, page]
  )

  const { data, isLoading, isError, error, refetch } = useListRequestsQuery(queryArgs)

  const handleClearFilters = () => {
    setSearchQuery("")
    setSelectedStatus(undefined)
    setSelectedTag(undefined)
    setPage(0)
  }

  const totalPages = data ? Math.ceil(data.totalItems / pageSize) : 0

  return (
    <div className="flex flex-col gap-4">
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q)
          setPage(0)
        }}
        selectedStatus={selectedStatus}
        onStatusChange={(s) => {
          setSelectedStatus(s)
          setPage(0)
        }}
        selectedTag={selectedTag}
        onTagChange={(t) => {
          setSelectedTag(t)
          setPage(0)
        }}
        onClearFilters={handleClearFilters}
        resultMessage={data ? `${data.totalItems} ${data.totalItems === 1 ? "request" : "requests"} found` : undefined}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Sort requests" className="flex">
          {SORTS.map((option, i) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={selectedSort === option.value}
              onClick={() => {
                setSelectedSort(option.value)
                setPage(0)
              }}
              className={cn(
                "min-h-10 cursor-pointer border-2 border-ink px-4 text-sm font-bold transition-colors",
                i > 0 && "-ml-0.5",
                selectedSort === option.value ? "bg-ink text-paper" : "bg-card text-ink hover:bg-paper",
              )}
            >
              {option.value === "votes" && <span aria-hidden="true">▲ </span>}
              {option.label}
            </button>
          ))}
        </div>
        {data && (
          <p className="m-0 font-mono text-[13px] text-ink-muted">
            Showing {data.items.length} of {data.totalItems}
          </p>
        )}
      </div>

      <StateView
        isLoading={isLoading}
        isError={isError}
        error={error}
        data={data}
        isEmpty={(d) => d.items.length === 0}
        emptyTitle={hasActiveFilters ? (searchQuery.trim() ? `Nothing matches “${searchQuery.trim()}”` : "Nothing matches those filters") : "No requests yet"}
        emptyDescription={
          hasActiveFilters
            ? "Try fewer words, or clear the filters. Still not here? Then nobody has asked yet, so you could be first."
            : "Nobody has suggested anything yet. Be the first, and help decide what gets built next."
        }
        emptyAction={
          hasActiveFilters
            ? { label: "Clear filters", onClick: handleClearFilters }
            : { label: "Submit the first request", onClick: () => navigate(routes.submit) }
        }
        onRetry={refetch}
        loadingLabel="the requests"
      >
        {(pageData) => (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              {pageData.items.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t-2 border-ink pt-4 mt-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  <ChevronLeft aria-hidden="true" className="w-4 h-4" />
                  Previous
                </Button>

                <span className="font-mono text-sm text-ink-muted">
                  Page {page + 1} of {totalPages}
                </span>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                >
                  Next
                  <ChevronRight aria-hidden="true" className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </StateView>
    </div>
  )
}
