import React from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAppSelector } from "@/store/hooks"
import { useGetMeQuery } from "@/services/endpoints/auth"
import { routes } from "@/utils/routes"
import { Skeleton } from "@/components/ui/skeleton"
import { LinkButton } from "@/components/shared/link-button"
import { ShieldAlert, ArrowLeft } from "lucide-react"

export function AdminGate({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const { token, expiresAt } = useAppSelector((state) => state.auth)

  // Token expired check
  const isExpired = expiresAt ? Date.now() > expiresAt : false

  if (!token || isExpired) {
    return <Navigate to={`${routes.auth.login}?next=${encodeURIComponent(location.pathname)}`} replace />
  }

  return <AdminSessionGate>{children}</AdminSessionGate>
}

function AdminSessionGate({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading, isError } = useGetMeQuery()

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 space-y-4" aria-busy="true">
        <Skeleton shape="text" lines={1} className="w-48" />
        <Skeleton shape="card" />
      </div>
    )
  }

  if (isError || !user) {
    return <Navigate to={routes.auth.login} replace />
  }

  // Role check: Only ADMIN can access
  if (user.role !== "ADMIN") {
    return (
      <div className="max-w-md mx-auto my-16 p-8 border border-amber-200 bg-amber-50 rounded-xl text-center">
        <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-amber-900 mb-2">Admin Access Required</h2>
        <p className="text-sm text-amber-700 mb-6">
          Your account ({user.displayName}) has the role <strong>{user.role}</strong>. Only administrators can access the card management board.
        </p>
        <LinkButton to={routes.browse} variant="secondary" className="border-amber-300 text-amber-900 hover:bg-amber-100">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Public Requests
          </LinkButton>
      </div>
    )
  }

  return <>{children}</>
}
