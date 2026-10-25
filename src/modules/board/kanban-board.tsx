import React, { useEffect, useRef, useState } from "react"
import { useGetBoardQuery, useMoveRequestMutation } from "@/services/endpoints/board"
import { StateView } from "@/components/shared/state-view"
import { VoteButton } from "@/modules/voting/vote-button"
import { StatusHistoryDialog } from "./status-history-dialog"
import { useToast } from "@/components/ui/toast"
import { announce } from "@/components/shared/live-region"
import { isProblem } from "@/services/httpClient/apiError"
import type { RequestItem, Status } from "@/models"
import { History, MoveRight, MoveLeft } from "lucide-react"
import { STATUS_LABEL as STATUS_NAME, STATUS_PATTERN } from "@/components/brand/status-swatch"
import { cn } from "@/lib/cn"

export function KanbanBoard() {
  const { toast } = useToast()
  const { data: board, isLoading, isError, error, refetch } = useGetBoardQuery()
  const [moveRequest] = useMoveRequestMutation()
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null)
  const [selectedHistoryCard, setSelectedHistoryCard] = useState<RequestItem | null>(null)
  // The card you just moved keeps an orange outline for a moment, so you can see where it landed.
  const [justMovedId, setJustMovedId] = useState<string | null>(null)
  const movedTimer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(movedTimer.current), [])

  const columns: { status: Status; title: string; items: RequestItem[] }[] = [
    { status: "OPEN", title: STATUS_NAME.OPEN, items: board?.open || [] },
    { status: "PLANNED", title: STATUS_NAME.PLANNED, items: board?.planned || [] },
    { status: "IN_PROGRESS", title: STATUS_NAME.IN_PROGRESS, items: board?.inProgress || [] },
    { status: "COMPLETED", title: STATUS_NAME.COMPLETED, items: board?.completed || [] },
  ]

  const STATUS_LABEL = STATUS_NAME

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
      window.clearTimeout(movedTimer.current)
      setJustMovedId(card.id)
      movedTimer.current = window.setTimeout(() => setJustMovedId(null), 2400)
      announce(`Card "${card.title}" moved to ${STATUS_LABEL[targetStatus]}`)
    } catch (err: unknown) {
      // .unwrap() rejects with the ApiError itself (see baseQuery), not { error }.
      if (isProblem(err, "STALE_VERSION")) {
        toast({ variant: "error", title: "Someone got there first", description: `Another admin moved “${card.title}” before you. The board now shows where it really is.` })
        announce("Conflict: Another admin moved this card. The board has been updated to show its true column.")
      } else if (isProblem(err, "FORBIDDEN")) {
        toast({ variant: "error", title: "You must be an admin to move cards." })
      } else {
        toast({ variant: "error", title: "That move didn’t save", description: "The card is back where it was. Check your connection and try again." })
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
    <div className="flex flex-col gap-4">
      <p className="m-0 flex flex-wrap justify-between gap-2 font-mono text-[13px] text-ink-muted">
        <span>Most-voted first in each column. Drag a card, or use its arrow buttons.</span>
        {board?.generatedAt && <span>Updated {new Date(board.generatedAt).toLocaleTimeString()}</span>}
      </p>

      <StateView
        isLoading={isLoading}
        isError={isError}
        error={error}
        data={board}
        onRetry={refetch}
        skeletonCount={4}
        loadingLabel="the board"
      >
        {() => (
          <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-4">
            {columns.map((column, colIdx) => {
              const prevColumn = colIdx > 0 ? columns[colIdx - 1] : null
              const nextColumn = colIdx < columns.length - 1 ? columns[colIdx + 1] : null

              return (
                <section
                  key={column.status}
                  aria-label={`${column.title}, ${column.items.length} ${column.items.length === 1 ? "request" : "requests"}`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column.status)}
                  className="flex min-h-[420px] flex-col border border-line bg-sunk"
                >
                  <div aria-hidden="true" className={cn("h-4 border-b-2 border-ink bg-card", STATUS_PATTERN[column.status])} />
                  <div className="flex items-center justify-between px-3 pt-3 pb-2">
                    <h2 className="m-0 text-[15px] font-extrabold tracking-wide uppercase">{column.title}</h2>
                    <span className="font-pixel text-lg font-bold">{column.items.length}</span>
                  </div>

                  <div className="flex flex-1 flex-col gap-3 px-3 pb-3">
                    {column.items.length === 0 ? (
                      <div className="flex h-28 items-center justify-center border border-dashed border-line-strong p-3 text-center font-mono text-xs text-ink-muted">
                        Nothing here. Drop a card to move it.
                      </div>
                    ) : (
                      column.items.map((card) => {
                        const moved = justMovedId === card.id
                        return (
                          <article
                            key={card.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, card)}
                            className={cn(
                              "flex cursor-grab flex-col gap-2.5 border bg-card p-3 transition-colors active:cursor-grabbing",
                              draggedCardId === card.id ? "border-ink opacity-50" : "border-line hover:border-ink",
                              moved && "outline-[3px] outline-offset-[3px] outline-signal outline-solid",
                            )}
                          >
                            {moved && (
                              <span className="self-start border-2 border-ink bg-signal px-1.5 py-0.5 font-mono text-[11.5px] font-semibold">
                                Moved just now
                              </span>
                            )}
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="m-0 line-clamp-2 text-[15px] leading-snug font-bold">{card.title}</h3>
                              <button
                                type="button"
                                onClick={() => setSelectedHistoryCard(card)}
                                className="-m-1 grid size-8 shrink-0 cursor-pointer place-items-center text-ink-muted hover:bg-sunk hover:text-ink"
                                aria-label={`Status history for “${card.title}”`}
                              >
                                <History aria-hidden="true" className="size-4" />
                              </button>
                            </div>

                            <p className="m-0 line-clamp-2 text-[13px] leading-snug break-words text-ink-muted">{card.description}</p>

                            <div className="flex items-center justify-between border-t border-line pt-2.5">
                              <VoteButton
                                requestId={card.id}
                                voteCount={card.voteCount}
                                viewerHasVoted={card.viewerHasVoted}
                                status={card.status}
                                title={card.title}
                                size="sm"
                              />
                              <div className="flex items-center gap-1.5">
                                {prevColumn && (
                                  <button
                                    type="button"
                                    onClick={() => handleMoveCard(card, prevColumn.status)}
                                    className="grid size-9 cursor-pointer place-items-center border-[1.5px] border-ink bg-paper hover:bg-signal"
                                    aria-label={`Move “${card.title}” left to ${prevColumn.title}`}
                                  >
                                    <MoveLeft aria-hidden="true" className="size-4" />
                                  </button>
                                )}
                                {nextColumn && (
                                  <button
                                    type="button"
                                    onClick={() => handleMoveCard(card, nextColumn.status)}
                                    className="grid size-9 cursor-pointer place-items-center border-[1.5px] border-ink bg-paper hover:bg-signal"
                                    aria-label={`Move “${card.title}” right to ${nextColumn.title}`}
                                  >
                                    <MoveRight aria-hidden="true" className="size-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </article>
                        )
                      })
                    )}
                  </div>
                </section>
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
