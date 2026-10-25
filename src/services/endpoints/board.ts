import { baseApi } from "@/services/httpClient/baseApi"
import type { Board, MoveCardArgs, RequestItem } from "@/models"
import { ApiTags } from "@/utils/apiTags"
import { isProblem } from "@/services/httpClient/apiError"

export const boardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBoard: builder.query<Board, void>({
      query: () => "/api/v1/board",
      providesTags: [ApiTags.Board],
    }),
    moveRequest: builder.mutation<RequestItem, MoveCardArgs>({
      query: ({ id, body }) => ({
        url: `/api/v1/requests/${encodeURIComponent(id)}/status`,
        method: "PUT",
        body,
      }),
      async onQueryStarted({ id, body }, { dispatch, queryFulfilled }) {
        const targetStatus = body.status
        const patchBoard = dispatch(
          boardApi.util.updateQueryData("getBoard", undefined, (draft) => {
            // Find card in current column
            let foundCard: RequestItem | undefined
            const columns: (keyof Pick<Board, "open" | "planned" | "inProgress" | "completed">)[] = [
              "open",
              "planned",
              "inProgress",
              "completed",
            ]

            for (const col of columns) {
              const idx = draft[col]?.findIndex((c) => c.id === id) ?? -1
              if (idx !== -1) {
                foundCard = draft[col][idx]
                draft[col].splice(idx, 1)
                break
              }
            }

            if (foundCard) {
              foundCard.status = targetStatus
              foundCard.version = body.expectedVersion + 1
              const targetColKey: keyof Pick<Board, "open" | "planned" | "inProgress" | "completed"> =
                targetStatus === "OPEN"
                  ? "open"
                  : targetStatus === "PLANNED"
                  ? "planned"
                  : targetStatus === "IN_PROGRESS"
                  ? "inProgress"
                  : "completed"

              draft[targetColKey] = draft[targetColKey] || []
              draft[targetColKey].unshift(foundCard)
            }
          })
        )

        try {
          const { data } = await queryFulfilled
          // Update card with real server response
          dispatch(
            boardApi.util.updateQueryData("getBoard", undefined, (draft) => {
              const columns: (keyof Pick<Board, "open" | "planned" | "inProgress" | "completed">)[] = [
                "open",
                "planned",
                "inProgress",
                "completed",
              ]
              for (const col of columns) {
                const idx = draft[col]?.findIndex((c) => c.id === id) ?? -1
                if (idx !== -1) {
                  draft[col][idx] = data
                  break
                }
              }
            })
          )
        } catch (err: unknown) {
          const errorWrapper = err as { error?: unknown }
          if (isProblem(errorWrapper?.error, "STALE_VERSION") && errorWrapper.error.problem.current) {
            const currentCard = errorWrapper.error.problem.current
            // Sync board with true current card
            dispatch(
              boardApi.util.updateQueryData("getBoard", undefined, (draft) => {
                const columns: (keyof Pick<Board, "open" | "planned" | "inProgress" | "completed">)[] = [
                  "open",
                  "planned",
                  "inProgress",
                  "completed",
                ]
                for (const col of columns) {
                  const idx = draft[col]?.findIndex((c) => c.id === id) ?? -1
                  if (idx !== -1) {
                    draft[col].splice(idx, 1)
                  }
                }
                const colKey: keyof Pick<Board, "open" | "planned" | "inProgress" | "completed"> =
                  currentCard.status === "OPEN"
                    ? "open"
                    : currentCard.status === "PLANNED"
                    ? "planned"
                    : currentCard.status === "IN_PROGRESS"
                    ? "inProgress"
                    : "completed"
                draft[colKey] = draft[colKey] || []
                draft[colKey].unshift(currentCard)
              })
            )
          } else {
            patchBoard.undo()
          }
        }
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: ApiTags.RequestItem, id },
        { type: ApiTags.Requests, id: "LIST" },
        ApiTags.Roadmap,
        { type: ApiTags.StatusHistory, id },
      ],
    }),
  }),
})

export const { useGetBoardQuery, useMoveRequestMutation } = boardApi
