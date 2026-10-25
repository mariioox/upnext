import { describe, it, expect } from "vitest"
import { isProblem, toApiError } from "./apiError"
import type { Problem } from "@/models"

describe("apiError", () => {
  it("correctly identifies problem errors", () => {
    const problem: Problem = {
      title: "Voting closed",
      status: 409,
      code: "VOTING_CLOSED",
      requestId: "1234",
      detail: "This request is completed.",
    }

    const apiError = {
      kind: "problem" as const,
      status: 409,
      problem,
    }

    expect(isProblem(apiError)).toBe(true)
    expect(isProblem(apiError, "VOTING_CLOSED")).toBe(true)
    expect(isProblem(apiError, "STALE_VERSION")).toBe(false)
  })

  it("handles network failure normalization", () => {
    const fetchError = { status: "FETCH_ERROR", error: "Failed to fetch" }
    const error = toApiError(fetchError)

    expect(error.kind).toBe("network")
    if (error.kind === "network") {
      expect(error.status).toBe("FETCH_ERROR")
    }
  })

  it("normalizes problem response data", () => {
    const rawError = {
      status: 409,
      data: {
        title: "Conflict",
        status: 409,
        code: "STALE_VERSION",
        requestId: "abc-123",
        detail: "Card has moved",
      },
    }

    const error = toApiError(rawError)
    expect(error.kind).toBe("problem")
    if (error.kind === "problem") {
      expect(error.problem.code).toBe("STALE_VERSION")
      expect(error.status).toBe(409)
    }
  })
})
