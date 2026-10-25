import { afterEach, describe, expect, it, vi } from "vitest"
import { store } from "@/store"
import { requestsApi } from "./requests"
import { voteApi } from "./vote"
import type { RequestPage } from "@/models"

const ID = "aaaaaaaa-0000-4000-8000-000000000001"
const page = (voteCount: number, viewerHasVoted: boolean): RequestPage =>
  ({
    items: [
      {
        id: ID, title: "Dark mode", description: "d", tags: [], status: "OPEN", voteCount, viewerHasVoted,
        authorName: "Demo", version: 1, createdAt: "2026-10-20T10:00:00Z", updatedAt: "2026-10-20T10:00:00Z",
      },
    ],
    page: 0, size: 20, totalItems: 1,
  }) as RequestPage

// The browse page caches the list under its filter arguments. Regression test for the bug
// where the optimistic vote only patched the `undefined`-argument cache entry, so the count
// on the browse page didn't move until the server answered.
const ARGS = { q: undefined, status: undefined, tag: undefined, sort: "votes", page: 0, size: 20 } as const

function cachedCount() {
  const entry = requestsApi.endpoints.listRequests.select(ARGS as never)(store.getState())
  return entry.data?.items[0]?.voteCount
}

describe("optimistic voting", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    store.dispatch(requestsApi.util.resetApiState())
  })

  it("moves the count in a filtered browse list immediately, then reverts when the service refuses", async () => {
    await store.dispatch(requestsApi.util.upsertQueryData("listRequests", ARGS as never, page(12, false)))
    // Subscribe so RTK keeps the entry (as the mounted browse page would).
    const sub = store.dispatch(requestsApi.endpoints.listRequests.initiate(ARGS as never, { subscribe: true }))

    let refuse!: () => void
    vi.stubGlobal(
      "fetch",
      vi.fn(
        () =>
          new Promise<Response>((resolve) => {
            refuse = () =>
              resolve(
                new Response(JSON.stringify({ title: "Closed", status: 409, code: "VOTING_CLOSED", requestId: "r" }), {
                  status: 409,
                  headers: { "Content-Type": "application/problem+json" },
                }),
              )
          }),
      ),
    )

    const vote = store.dispatch(voteApi.endpoints.castVote.initiate(ID))
    await Promise.resolve()
    expect(cachedCount()).toBe(13) // optimistic, before the server answers

    refuse()
    await vote.unwrap().catch(() => undefined)
    expect(cachedCount()).toBe(12) // reverted after the refusal
    sub.unsubscribe()
  })
})
