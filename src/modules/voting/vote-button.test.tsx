import { describe, it, expect, afterEach } from "vitest"
import { render, screen, cleanup } from "@testing-library/react"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import { VoteButton } from "./vote-button"
import authReducer from "@/store/authSlice"
import { baseApi } from "@/services/httpClient/baseApi"
import { ToastProvider } from "@/components/ui/toast"

afterEach(() => {
  cleanup()
})

function renderWithStore(ui: React.ReactElement, initialAuth = { token: "fake-jwt", user: null, expiresAt: null }) {
  const testStore = configureStore({
    reducer: {
      auth: authReducer,
      [baseApi.reducerPath]: baseApi.reducer,
    },
    preloadedState: {
      auth: initialAuth,
    },
    middleware: (getDefault) => getDefault().concat(baseApi.middleware),
  })

  return render(
    <Provider store={testStore}>
      <ToastProvider>{ui}</ToastProvider>
    </Provider>,
  )
}

describe("VoteButton", () => {
  it("renders current vote count and accessible label", () => {
    renderWithStore(
      <VoteButton
        requestId="req-1"
        voteCount={42}
        viewerHasVoted={false}
      />
    )

    expect(screen.getByText("42")).toBeDefined()
    const button = screen.getByRole("button")
    expect(button.getAttribute("aria-pressed")).toBe("false")
    expect(button.getAttribute("aria-label")).toBe("Upvote this request, 42 votes")
  })

  it("indicates active voted state when viewerHasVoted is true", () => {
    renderWithStore(
      <VoteButton
        requestId="req-2"
        voteCount={10}
        viewerHasVoted={true}
      />
    )

    const button = screen.getByRole("button")
    expect(button.getAttribute("aria-pressed")).toBe("true")
    expect(button.getAttribute("aria-label")).toContain("Remove your vote")
  })
})
