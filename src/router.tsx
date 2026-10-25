import { lazy } from "react"
import { createBrowserRouter, Navigate } from "react-router-dom"
import { PublicLayout } from "@/components/layout/public-layout"
import { AdminGate } from "@/components/layout/admin-gate"
import { AdminLayout } from "@/components/layout/admin-layout"
import { BrowsePage } from "@/routes/public/browse-page"
import { RequestDetailPage } from "@/routes/public/request-detail-page"
import { SubmitPage } from "@/routes/public/submit-page"
import { RoadmapPage } from "@/routes/public/roadmap-page"
import { LoginPage } from "@/routes/auth/login-page"
import { SignupPage } from "@/routes/auth/signup-page"
import { routes } from "@/utils/routes"

// Code splitting for admin routes (lazy loaded)
const BoardPage = lazy(() =>
  import("@/routes/admin/board-page").then((m) => ({ default: m.BoardPage }))
)

export const router = createBrowserRouter([
  {
    path: routes.home,
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <Navigate to={routes.browse} replace />,
      },
      {
        path: "requests",
        element: <BrowsePage />,
      },
      {
        path: "requests/:id",
        element: <RequestDetailPage />,
      },
      {
        path: "submit",
        element: <SubmitPage />,
      },
      {
        path: "roadmap",
        element: <RoadmapPage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "signup",
        element: <SignupPage />,
      },
      {
        path: "admin",
        element: (
          <AdminGate>
            <AdminLayout />
          </AdminGate>
        ),
        children: [
          {
            index: true,
            element: <Navigate to={routes.admin.board} replace />,
          },
          {
            path: "board",
            element: <BoardPage />,
          },
        ],
      },
      {
        path: "*",
        element: <Navigate to={routes.browse} replace />,
      },
    ],
  },
])
