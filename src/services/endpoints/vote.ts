import { baseApi } from "@/services/httpClient/baseApi"
import type { VoteState, RequestItem, RequestPage, Board, Roadmap } from "@/models"
import type { RootState } from "@/store"
import { ApiTags } from "@/utils/apiTags"

type Patch = { undo: () => void }
type Dispatch = (action: unknown) => unknown

/** Calls `fn` on every copy of the request held in a cached query result, whatever its shape. */
function forEachItem(endpointName: string, draft: unknown, id: string, fn: (item: RequestItem) => void) {
  if (!draft) return
  const visit = (item: RequestItem | undefined) => {
    if (item && item.id === id) fn(item)
  }
  switch (endpointName) {
    case "getRequest":
      visit(draft as RequestItem)
      break
    case "listRequests":
      ;(draft as RequestPage).items?.forEach(visit)
      break
    case "getBoard": {
      const b = draft as Board
      ;[b.open, b.planned, b.inProgress, b.completed].forEach((col) => col?.forEach(visit))
      break
    }
    case "getRoadmap": {
      const r = draft as Roadmap
      ;[r.planned, r.inProgress, r.completed].forEach((col) => col?.forEach(visit))
      break
    }
  }
}

/**
 * Applies `fn` to the request in EVERY cached query that holds it: each filtered/sorted
 * browse list (they are cached per argument set, so a fixed `undefined` key would miss them),
 * the detail page, the admin board and the public roadmap.
 */
function patchEverywhere(
  dispatch: Dispatch,
  getState: () => unknown,
  id: string,
  fn: (item: RequestItem) => void,
): Patch[] {
  const entries = baseApi.util.selectInvalidatedBy(getState() as RootState, [
    { type: ApiTags.RequestItem, id },
    ApiTags.Board,
    ApiTags.Roadmap,
  ])
  return entries.map(
    ({ endpointName, originalArgs }) =>
      dispatch(
        baseApi.util.updateQueryData(endpointName as never, originalArgs as never, ((draft: unknown) => {
          forEachItem(endpointName, draft, id, fn)
        }) as never),
      ) as Patch,
  )
}

function optimisticVote(voted: boolean) {
  return (item: RequestItem) => {
    if (item.viewerHasVoted === voted) return // already in that state: a double tap changes nothing
    item.voteCount = Math.max(0, item.voteCount + (voted ? 1 : -1))
    item.viewerHasVoted = voted
  }
}

function confirmFromServer(state: VoteState) {
  return (item: RequestItem) => {
    item.voteCount = state.voteCount
    item.viewerHasVoted = state.viewerHasVoted
  }
}

export const voteApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    castVote: builder.mutation<VoteState, string>({
      query: (id) => ({ url: `/api/v1/requests/${encodeURIComponent(id)}/vote`, method: "PUT" }),
      async onQueryStarted(id, { dispatch, getState, queryFulfilled }) {
        const patches = patchEverywhere(dispatch, getState, id, optimisticVote(true))
        try {
          const { data } = await queryFulfilled
          patchEverywhere(dispatch, getState, id, confirmFromServer(data))
        } catch {
          patches.forEach((p) => p.undo())
        }
      },
    }),
    withdrawVote: builder.mutation<VoteState, string>({
      query: (id) => ({ url: `/api/v1/requests/${encodeURIComponent(id)}/vote`, method: "DELETE" }),
      async onQueryStarted(id, { dispatch, getState, queryFulfilled }) {
        const patches = patchEverywhere(dispatch, getState, id, optimisticVote(false))
        try {
          const { data } = await queryFulfilled
          patchEverywhere(dispatch, getState, id, confirmFromServer(data))
        } catch {
          patches.forEach((p) => p.undo())
        }
      },
    }),
  }),
})

export const { useCastVoteMutation, useWithdrawVoteMutation } = voteApi
