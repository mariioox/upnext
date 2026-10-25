import type { Problem } from "@/models"

export type ApiError =
  | { kind: "problem"; status: number; problem: Problem }
  | { kind: "network"; status: "FETCH_ERROR" | "TIMEOUT_ERROR" | "PARSING_ERROR" | "UNKNOWN"; message?: string }

export function isProblem(
  error: unknown,
  code?: Problem["code"],
): error is { kind: "problem"; status: number; problem: Problem } {
  if (typeof error !== "object" || error === null) return false
  const candidate = error as Partial<ApiError>
  if (candidate.kind !== "problem" || !candidate.problem) return false
  if (code) {
    return candidate.problem.code === code
  }
  return true
}

export function toApiError(fetchError: unknown, response?: Response): ApiError {
  if (typeof fetchError === "object" && fetchError !== null) {
    const err = fetchError as Record<string, unknown>
    // Handle problem JSON payload
    if (err.data && typeof err.data === "object") {
      const data = err.data as Record<string, unknown>
      if (typeof data.code === "string" && typeof data.status === "number") {
        return {
          kind: "problem",
          status: data.status,
          problem: data as unknown as Problem,
        }
      }
    }

    if (err.status === "FETCH_ERROR") {
      return { kind: "network", status: "FETCH_ERROR", message: "Network connection failed. Please check your internet." }
    }
    if (err.status === "TIMEOUT_ERROR") {
      return { kind: "network", status: "TIMEOUT_ERROR", message: "Request timed out. Please try again." }
    }
    if (err.status === "PARSING_ERROR") {
      return { kind: "network", status: "PARSING_ERROR", message: "Invalid response from server." }
    }
    if (typeof err.status === "number") {
      return {
        kind: "problem",
        status: err.status,
        problem: {
          title: response?.statusText || "Request failed",
          status: err.status,
          code: "INTERNAL_ERROR",
          requestId: (err.data as Record<string, unknown>)?.requestId as string || "unknown",
          detail: ((err.data as Record<string, unknown>)?.detail as string) || "An unexpected error occurred.",
        },
      }
    }
  }

  return { kind: "network", status: "UNKNOWN", message: "An unexpected network error occurred." }
}
