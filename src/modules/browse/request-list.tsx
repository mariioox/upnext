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
    <div className="space-y-6">
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
        selectedSort={selectedSort}
        onSortChange={(s) => {
          setSelectedSort(s)
          setPage(0)
        }}
        onClearFilters={handleClearFilters}
        resultMessage={data ? `${data.totalItems} ${data.totalItems === 1 ? "request" : "requests"} found` : undefined}
      />

      <StateView
        isLoading={isLoading}
        isError={isError}
        error={error}
        data={data}
        isEmpty={(d) => d.items.length === 0}
        emptyTitle={hasActiveFilters ? "No matching requests found" : "No requests submitted yet"}
        emptyDescription={
          hasActiveFilters
            ? "Try adjusting your keyword, removing tags, or clearing the status filter."
            : "Be the first to submit a feature idea and help shape what gets built next!"
        }
        emptyAction={
          hasActiveFilters
            ? { label: "Clear all filters", onClick: handleClearFilters }
            : { label: "Submit the first request", onClick: () => navigate(routes.submit) }
        }
        onRetry={refetch}
      >
        {(pageData) => (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>
                Showing <strong>{pageData.items.length}</strong> of <strong>{pageData.totalItems}</strong> requests
              </span>
            </div>

            <div className="space-y-3">
              {pageData.items.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 pt-4 mt-6">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>

                <span className="text-sm text-slate-600">
                  Page {page + 1} of {totalPages}
                </span>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        )}
      </StateView>
    </div>
  )
}
