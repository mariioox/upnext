import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { User } from "@/models"

export type AuthState = {
  token: string | null
  user: User | null
  expiresAt: number | null
}

const initialState: AuthState = {
  token: null,
  user: null,
  expiresAt: null,
}

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    signedIn: (
      state,
      action: PayloadAction<{ token: string; user: User; expiresInSeconds: number }>
    ) => {
      state.token = action.payload.token
      state.user = action.payload.user
      state.expiresAt = Date.now() + action.payload.expiresInSeconds * 1000
    },
    signedOut: (state) => {
      state.token = null
      state.user = null
      state.expiresAt = null
    },
    userUpdated: (state, action: PayloadAction<User>) => {
      state.user = action.payload
    },
  },
})

export const { signedIn, signedOut, userUpdated } = authSlice.actions
export default authSlice.reducer
