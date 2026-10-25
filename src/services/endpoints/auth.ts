import { baseApi } from "@/services/httpClient/baseApi"
import type { AuthResponse, LoginRequest, SignupRequest, User } from "@/models"
import { signedIn, signedOut, userUpdated } from "@/store/authSlice"

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    signup: builder.mutation<AuthResponse, SignupRequest>({
      query: (body) => ({
        url: "/api/v1/auth/signup",
        method: "POST",
        body,
      }),
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(
            signedIn({
              token: data.accessToken,
              user: data.user,
              expiresInSeconds: data.expiresInSeconds,
            })
          )
        } catch {
          // handled in component
        }
      },
    }),
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({
        url: "/api/v1/auth/login",
        method: "POST",
        body,
      }),
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(
            signedIn({
              token: data.accessToken,
              user: data.user,
              expiresInSeconds: data.expiresInSeconds,
            })
          )
        } catch {
          // handled in component
        }
      },
    }),
    getMe: builder.query<User, void>({
      query: () => "/api/v1/auth/me",
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(userUpdated(data))
        } catch (err: unknown) {
          const error = err as { error?: { status?: number } }
          if (error.error?.status === 401) {
            dispatch(signedOut())
          }
        }
      },
    }),
  }),
})

export const { useSignupMutation, useLoginMutation, useGetMeQuery, useLazyGetMeQuery } = authApi
