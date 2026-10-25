import { fetchBaseQuery, type BaseQueryFn, type FetchArgs } from "@reduxjs/toolkit/query"
import { env } from "@/utils/env"
import { toApiError, type ApiError } from "./apiError"
import { signedOut } from "@/store/authSlice"
import type { RootState } from "@/store"

type ExtraOptions = {
  auth?: "optional" | "required"
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: env.apiBaseUrl,
})

export const baseQuery: BaseQueryFn<string | FetchArgs, unknown, ApiError, ExtraOptions> = async (
  args,
  api,
  _extraOptions
) => {
  const fetchArgs: FetchArgs = typeof args === "string" ? { url: args } : { ...args }
  const headers = new Headers(fetchArgs.headers as HeadersInit | undefined)

  // Attach X-Request-Id (UUID) on every call
  if (!headers.has("X-Request-Id")) {
    headers.set("X-Request-Id", crypto.randomUUID())
  }

  // Token handling
  const state = api.getState() as RootState
  const token = state.auth.token
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  fetchArgs.headers = headers

  const result = await rawBaseQuery(fetchArgs, api, {})

  if (!result.error) {
    return { data: result.data, meta: result.meta }
  }

  const error = toApiError(result.error, result.meta?.response)

  // If a 401 is received when authenticated, expire the session
  if (error.kind === "problem" && error.status === 401 && token) {
    api.dispatch(signedOut())
  }

  return { error }
}
