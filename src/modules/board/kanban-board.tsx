import React, { useState } from "react"
import { useGetBoardQuery, useMoveRequestMutation } from "@/services/endpoints/board"
import { StateView } from "@/components/shared/state-view"
import { VoteButton } from "@/modules/voting/vote-button"
import { StatusHistoryDialog } from "./status-history-dialog"
import { useToast } from "@/components/ui/toast"
import { announce } from "@/components/shared/live-region"
import { isProblem } from "@/services/httpClient/apiError"
import type { RequestItem, Status } from "@/models"
import {
  Inbox,
  Calendar,
  Loader2,
  CheckCircle2,
  History,
  MoveRight,
  MoveLeft,
  Clock,
} from "lucide-react"

export function KanbanBoard() {
  const { toast } = useToast()
  const { data: board, isLoading, isError, error, refetch } = useGetBoardQuery()
  const [moveRequest] = useMoveRequestMutation()
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null)
  const [selectedHistoryCard, setSelectedHistoryCard] = useState<RequestItem | null>(null)

  const columns: {
    status: Status
    title: string
    items: RequestItem[]
    icon: React.ReactNode
    badgeBg: string
  }[] = [
    {
      status: "OPEN",
      title: "Open",
      items: board?.open || [],
      icon: <Inbox className="w-4 h-4 text-slate-600" />,
      badgeBg: "bg-slate-200 text-slate-800",
    },
    {
      status: "PLANNED",
      title: "Planned",
      items: board?.planned || [],
      icon: <Calendar className="w-4 h-4 text-blue-600" />,
      badgeBg: "bg-blue-100 text-blue-800",
    },
    {
      status: "IN_PROGRESS",
      title: "In Progress",
      items: board?.inProgress || [],
      icon: <Loader2 className="w-4 h-4 text-amber-600" />,
      badgeBg: "bg-amber-100 text-amber-800",
    },
    {
      status: "COMPLETED",
      title: "Completed",
      items: board?.completed || [],
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
      badgeBg: "bg-emerald-100 text-emerald-800",
    },
  ]

  const STATUS_LABEL: Record<Status, string> = { OPEN: "Open", PLANNED: "Planned", IN_PROGRESS: "In Progress", COMPLETED: "Completed" }

  const handleMoveCard = async (card: RequestItem, targetStatus: Status) => {
    if (card.status === targetStatus) return

    try {
      announce(`Moving "${card.title}" to ${STATUS_LABEL[targetStatus]}...`)
      await moveRequest({
        id: card.id,
        body: {
          status: targetStatus,
          expectedVersion: card.version,
        },
      }).unwrap()

      toast({ variant: "success", title: `Moved “${card.title}” to ${STATUS_LABEL[targetStatus]}` })
      announce(`Card "${card.title}" moved to ${STATUS_LABEL[targetStatus]}`)
    } catch (err: unknown) {
      // .unwrap() rejects with the ApiError itself (see baseQuery), not { error }.
      if (isProblem(err, "STALE_VERSION")) {
        toast({ variant: "error", title: `Another admin moved “${card.title}” first. The board now shows where it really is.` })
        announce("Conflict: Another admin moved this card. The board has been updated to show its true column.")
      } else if (isProblem(err, "FORBIDDEN")) {
        toast({ variant: "error", title: "You must be an admin to move cards." })
      } else {
        toast({ variant: "error", title: "Failed to move card. Please check your connection." })
      }
    }
  }

  // HTML5 Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, card: RequestItem) => {
    e.dataTransfer.setData("text/plain", JSON.stringify(card))
    e.dataTransfer.effectAllowed = "move"
    setDraggedCardId(card.id)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, targetStatus: Status) => {
    e.preventDefault()
    setDraggedCardId(null)
    const rawData = e.dataTransfer.getData("text/plain")
    if (!rawData) return

    try {
      const card = JSON.parse(rawData) as RequestItem
      handleMoveCard(card, targetStatus)
    } catch {
      // ignore
    }
  }

  return (
    <div className="space-y-4">
      {board?.generatedAt && (
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Columns ordered by Most Upvoted first.</span>
          <span className="flex items-center gap-1 font-mono">
            <Clock className="w-3.5 h-3.5" />
            Generated: {new Date(board.generatedAt).toLocaleTimeString()}
          </span>
        </div>
      )}

      <StateView
        isLoading={isLoading}
        isError={isError}
        error={error}
        data={board}
        onRetry={refetch}
        skeletonCount={4}
      >
        {() => (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
            {columns.map((column, colIdx) => {
              const prevColumn = colIdx > 0 ? columns[colIdx - 1] : null
              const nextColumn = colIdx < columns.length - 1 ? columns[colIdx + 1] : null

              return (
                <div
                  key={column.status}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column.status)}
                  className="bg-slate-100/80 border border-slate-200 rounded-xl p-3 flex flex-col min-h-[500px]"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                    <div className="flex items-center gap-2">
                      {column.icon}
                      <h2 className="font-bold text-sm text-slate-800">{column.title}</h2>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${column.badgeBg}`}>
                      {column.items.length}
                    </span>
                  </div>

                  {/* Cards List */}
                  <div className="flex-1 space-y-2.5">
                    {column.items.length === 0 ? (
                      <div className="h-32 border border-dashed border-slate-200 rounded-lg flex items-center justify-center text-xs text-slate-600 text-center p-3">
                        Drop cards here
                      </div>
                    ) : (
                      column.items.map((card) => (
                        <div
                          key={card.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, card)}
                          className={`bg-white border rounded-lg p-3 shadow-xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${
                            draggedCardId === card.id
                              ? "opacity-40 border-blue-400"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1.5 mb-2">
                            <span className="font-semibold text-xs text-slate-900 line-clamp-2">
                              {card.title}
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => setSelectedHistoryCard(card)}
                                title="View status history"
                                className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-slate-50 cursor-pointer"
                                aria-label={`View status history for ${card.title}`}
                              >
                                <History className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <p className="text-[11px] text-slate-500 line-clamp-2 mb-2 break-words">
                            {card.description}
                          </p>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                            <VoteButton
                              requestId={card.id}
                              voteCount={card.voteCount}
                              viewerHasVoted={card.viewerHasVoted}
                              status={card.status}
                              size="sm"
                              className="scale-90 origin-left"
                            />

                            {/* Keyboard Accessible Column Move Buttons */}
                            <div className="flex items-center gap-1">
                              {prevColumn && (
                                <button
                                  type="button"
                                  onClick={() => handleMoveCard(card, prevColumn.status)}
                                  className="inline-flex size-8 items-center justify-center rounded-md bg-white border border-slate-400 hover:bg-slate-100 text-slate-800 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                                  title={`Move left to ${prevColumn.title}`}
                                  aria-label={`Move “${card.title}” left to ${prevColumn.title}`}
                                >
                                  <MoveLeft aria-hidden="true" className="w-4 h-4" />
                                </button>
                              )}
                              {nextColumn && (
                                <button
                                  type="button"
                                  onClick={() => handleMoveCard(card, nextColumn.status)}
                                  className="inline-flex size-8 items-center justify-center rounded-md bg-white border border-slate-400 hover:bg-slate-100 text-slate-800 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                                  title={`Move right to ${nextColumn.title}`}
                                  aria-label={`Move “${card.title}” right to ${nextColumn.title}`}
                                >
                                  <MoveRight aria-hidden="true" className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </StateView>

      <StatusHistoryDialog
        isOpen={Boolean(selectedHistoryCard)}
        requestId={selectedHistoryCard?.id || null}
        requestTitle={selectedHistoryCard?.title}
        onClose={() => setSelectedHistoryCard(null)}
      />
    </div>
  )
}
