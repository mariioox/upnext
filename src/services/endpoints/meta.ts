import { baseApi } from "@/services/httpClient/baseApi"
import type { Meta } from "@/models"
import { ApiTags } from "@/utils/apiTags"

export const metaApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMeta: builder.query<Meta, void>({
      query: () => "/api/v1/meta",
      providesTags: [ApiTags.Meta],
    }),
  }),
})

export const { useGetMetaQuery } = metaApi
