import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Provider } from "react-redux"
import { PersistGate } from "redux-persist/integration/react"
import { RouterProvider } from "react-router-dom"
import { store, persistor } from "@/store"
import { router } from "@/router"
import { ToastProvider } from "@/components/ui/toast"
import "./index.css"

const rootElement = document.getElementById("root")
if (!rootElement) {
  throw new Error("Failed to find root element")
}

createRoot(rootElement).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </PersistGate>
    </Provider>
  </StrictMode>
)
