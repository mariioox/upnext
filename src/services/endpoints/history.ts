import { baseApi } from "@/services/httpClient/baseApi"
import type { StatusHistoryEntry } from "@/models"
import { ApiTags } from "@/utils/apiTags"

export const historyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listStatusHistory: builder.query<StatusHistoryEntry[], string>({
      query: (id) => `/api/v1/requests/${encodeURIComponent(id)}/status-history`,
      providesTags: (_result, _error, id) => [{ type: ApiTags.StatusHistory, id }],
    }),
  }),
})

export const { useListStatusHistoryQuery } = historyApi
