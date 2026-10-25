import { baseApi } from "@/services/httpClient/baseApi"
import type { CreateRequest, ListRequestsArgs, RequestItem, RequestPage } from "@/models"
import { ApiTags } from "@/utils/apiTags"

export const requestsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listRequests: builder.query<RequestPage, ListRequestsArgs | void>({
      query: (params) => {
        const queryParams = new URLSearchParams()
        if (params?.tag) queryParams.set("tag", params.tag)
        if (params?.status) queryParams.set("status", params.status)
        if (params?.q) queryParams.set("q", params.q)
        if (params?.sort) queryParams.set("sort", params.sort)
        if (params?.page !== undefined) queryParams.set("page", params.page.toString())
        if (params?.size !== undefined) queryParams.set("size", params.size.toString())

        const qs = queryParams.toString()
        return qs ? `/api/v1/requests?${qs}` : "/api/v1/requests"
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((item) => ({ type: ApiTags.RequestItem, id: item.id })),
              { type: ApiTags.Requests, id: "LIST" },
            ]
          : [{ type: ApiTags.Requests, id: "LIST" }],
    }),
    getRequest: builder.query<RequestItem, string>({
      query: (id) => `/api/v1/requests/${encodeURIComponent(id)}`,
      providesTags: (_result, _error, id) => [{ type: ApiTags.RequestItem, id }],
    }),
    createRequest: builder.mutation<RequestItem, CreateRequest>({
      query: (body) => ({
        url: "/api/v1/requests",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: ApiTags.Requests, id: "LIST" }, ApiTags.Tags],
    }),
  }),
})

export const { useListRequestsQuery, useGetRequestQuery, useCreateRequestMutation } = requestsApi
