import type { Problem } from "@/models"

export const problemFallbackMessages: Record<NonNullable<Problem["code"]>, string> = {
  VALIDATION_FAILED: "Please check the form for errors.",
  UNAUTHENTICATED: "You need to be signed in to perform this action.",
  FORBIDDEN: "You do not have permission to perform this action.",
  NOT_FOUND: "The requested item could not be found.",
  EMAIL_TAKEN: "An account with that email already exists.",
  VOTING_CLOSED: "This request is completed, so voting has closed.",
  STALE_VERSION: "Another admin has already moved this card.",
  INTERNAL_ERROR: "An unexpected server error occurred. Please try again.",
}

export function getProblemMessage(problem: Problem): string {
  if (problem.detail && problem.detail.trim().length > 0) {
    return problem.detail
  }
  if (problem.code && problemFallbackMessages[problem.code]) {
    return problemFallbackMessages[problem.code]
  }
  return problem.title || "An error occurred."
}
