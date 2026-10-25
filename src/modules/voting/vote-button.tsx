import React from "react"
import { useCastVoteMutation, useWithdrawVoteMutation } from "@/services/endpoints/vote"
import { useAppSelector } from "@/store/hooks"
import { ChevronUp } from "lucide-react"
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
  className?: string
  size?: "default" | "sm" | "lg"
}

export function VoteButton({
  requestId,
  voteCount,
  viewerHasVoted,
  status,
  className,
  size = "default",
}: VoteButtonProps) {
  const { toast } = useToast()
  const { token } = useAppSelector((state) => state.auth)
  const [castVote, { isLoading: isCasting }] = useCastVoteMutation()
  const [withdrawVote, { isLoading: isWithdrawing }] = useWithdrawVoteMutation()
  const isPending = isCasting || isWithdrawing

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

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

  const sizeClasses = {
    sm: "px-2 py-1 text-xs min-w-10 min-h-12 flex-col",
    default: "px-3 py-2 text-sm min-w-12 min-h-14 flex-col",
    lg: "px-4 py-2.5 text-base min-w-16 min-h-16 flex-col",
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={viewerHasVoted}
      aria-label={`${viewerHasVoted ? "Withdraw vote from" : "Vote for"} request. Current votes: ${voteCount}${status === "COMPLETED" ? ". Voting has closed" : ""}`}
      className={cn(
        "inline-flex items-center justify-center rounded-xl border font-semibold transition-all shadow-xs cursor-pointer select-none",
        viewerHasVoted
          ? "bg-blue-600 border-blue-600 text-white shadow-blue-100 hover:bg-blue-700 hover:border-blue-700"
          : "bg-white border-slate-200 text-slate-700 hover:bg-blue-50/50 hover:border-blue-300 hover:text-blue-600",
        isPending && "opacity-60 cursor-wait",
        sizeClasses[size],
        className
      )}
    >
      <ChevronUp
        className={cn(
          "w-5 h-5 transition-transform",
          viewerHasVoted ? "text-white" : "text-slate-500 group-hover:text-blue-600",
          !viewerHasVoted && "hover:-translate-y-0.5"
        )}
      />
      <span className="font-bold tracking-tight">{voteCount}</span>
    </button>
  )
}
