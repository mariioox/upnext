import { baseApi } from "@/services/httpClient/baseApi"
import type { TagCount } from "@/models"
import { ApiTags } from "@/utils/apiTags"

export const tagsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listTags: builder.query<TagCount[], void>({
      query: () => "/api/v1/tags",
      providesTags: [ApiTags.Tags],
    }),
  }),
})

export const { useListTagsQuery } = tagsApi
