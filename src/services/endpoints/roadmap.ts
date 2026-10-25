import { baseApi } from "@/services/httpClient/baseApi"
import type { Roadmap } from "@/models"
import { ApiTags } from "@/utils/apiTags"

export const roadmapApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRoadmap: builder.query<Roadmap, void>({
      query: () => "/api/v1/roadmap",
      providesTags: [ApiTags.Roadmap],
    }),
  }),
})

export const { useGetRoadmapQuery } = roadmapApi
