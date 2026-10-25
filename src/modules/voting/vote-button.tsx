import React, { useEffect, useRef, useState } from "react"
import { useCastVoteMutation, useWithdrawVoteMutation } from "@/services/endpoints/vote"
import { useAppSelector } from "@/store/hooks"
import { PixelArrow } from "@/components/brand/pixel-arrow"
import { cn } from "@/lib/cn"
import { useToast } from "@/components/ui/toast"
import { isProblem } from "@/services/httpClient/apiError"
import { announce } from "@/components/shared/live-region"
import type { Status } from "@/models"

export interface VoteButtonProps {
  requestId: string
  voteCount: number
  viewerHasVoted: boolean
  status?: Status
  /** The request's title, so the button's name says what you are voting on. */
  title?: string
  className?: string
  size?: "default" | "sm" | "lg"
}

export function VoteButton({
  requestId,
  voteCount,
  viewerHasVoted,
  status,
  title,
  className,
  size = "default",
}: VoteButtonProps) {
  const [burst, setBurst] = useState(false)
  const burstTimer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(burstTimer.current), [])
  const { toast } = useToast()
  const { token } = useAppSelector((state) => state.auth)
  const [castVote, { isLoading: isCasting }] = useCastVoteMutation()
  const [withdrawVote, { isLoading: isWithdrawing }] = useWithdrawVoteMutation()
  const isPending = isCasting || isWithdrawing

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // One request at a time: a second click while saving would race the first.
    if (isPending) return

    if (!token) {
      toast({ variant: "error", title: "Please sign in to vote on feature requests." })
      return
    }

    // No client-side block for COMPLETED requests: the service enforces it (409 VOTING_CLOSED),
    // and the brief's definition of done needs that refusal to be visible — the count moves,
    // then reverts with a message.

    try {
      if (viewerHasVoted) {
        announce("Withdrawing your vote...")
        await withdrawVote(requestId).unwrap()
        announce(`Vote removed. Total votes: ${Math.max(0, voteCount - 1)}`)
      } else {
        // Celebrate straight away: the count is already optimistic.
        window.clearTimeout(burstTimer.current)
        setBurst(true)
        burstTimer.current = window.setTimeout(() => setBurst(false), 800)
        announce("Recording your vote...")
        await castVote(requestId).unwrap()
        announce(`Vote recorded. Total votes: ${voteCount + 1}`)
      }
    } catch (err: unknown) {
      // .unwrap() rejects with the ApiError itself (see baseQuery), not { error }.
      if (isProblem(err, "VOTING_CLOSED")) {
        toast({ variant: "error", title: "Voting has closed: this request is already completed. Your vote wasn't counted." })
        announce("Voting is closed on completed requests. Vote reverted.")
      } else if (isProblem(err, "UNAUTHENTICATED")) {
        toast({ variant: "error", title: "Session expired. Please sign in again." })
      } else {
        toast({ variant: "error", title: "We couldn't save your vote, so the count has been put back. Please try again." })
        announce("Vote update failed. Your vote count has reverted.")
      }
    }
  }

  const closed = status === "COMPLETED"
  const subject = title ? `“${title}”` : "this request"
  const votes = `${voteCount} ${voteCount === 1 ? "vote" : "votes"}`
  const label = closed
    ? `Voting closed on ${subject}, ${votes}`
    : viewerHasVoted
      ? `Remove your vote from ${subject}, ${votes}`
      : `Upvote ${subject}, ${votes}`

  const sizeClasses = {
    sm: { box: "w-10 min-h-12 gap-0.5", arrow: "size-3.5", count: "text-sm" },
    default: { box: "w-12 min-h-[60px] gap-1", arrow: "size-4", count: "text-[17px]" },
    lg: { box: "w-14 min-h-[68px] gap-1.5", arrow: "size-5", count: "text-xl" },
  }[size]

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={viewerHasVoted}
      aria-busy={isPending || undefined}
      aria-label={label}
      className={cn(
        "group relative inline-flex shrink-0 cursor-pointer select-none flex-col items-center justify-center",
        "border-2 border-ink text-ink transition-colors active:translate-y-px",
        viewerHasVoted ? "bg-signal hover:bg-signal-hover" : closed ? "bg-tag" : "bg-paper hover:bg-card",
        isPending && "cursor-wait",
        sizeClasses.box,
        className
      )}
    >
      <PixelArrow
        fill={viewerHasVoted || closed ? "solid" : "dither"}
        className={cn(sizeClasses.arrow, !viewerHasVoted && !closed && "group-hover:[&_path]:fill-ink")}
      />
      <span key={voteCount} className={cn("un-bump font-pixel font-bold leading-none tabular-nums", sizeClasses.count)}>
        {voteCount}
      </span>
      {burst && (
        <span aria-hidden="true">
          {BITS.map(([dx, dy, orange], i) => (
            <span
              key={i}
              className="un-bit"
              style={{ "--dx": `${dx}px`, "--dy": `${dy}px`, background: orange ? "var(--color-signal)" : undefined } as React.CSSProperties}
            />
          ))}
        </span>
      )}
    </button>
  )
}

/** Pixel burst offsets (dx, dy, orange?) for a cast vote. */
const BITS: ReadonlyArray<readonly [number, number, boolean]> = [
  [-22, -18, false],
  [22, -18, false],
  [-28, 4, false],
  [28, 4, false],
  [0, -30, true],
  [-14, 22, false],
  [14, 22, false],
  [0, 28, true],
]
