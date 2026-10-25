import { Outlet } from "react-router-dom"
import { LinkButton } from "@/components/shared/link-button"
import { routes } from "@/utils/routes"
import { ArrowLeft, Kanban, ShieldCheck } from "lucide-react"

export function AdminLayout() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              Product Kanban Board
              <span className="text-xs font-semibold px-2 py-0.5 bg-blue-600 text-white rounded-full">Admin</span>
            </h1>
            <p className="text-xs text-slate-500">
              Drag cards or use keyboard actions to move feature requests across roadmap stages.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LinkButton to={routes.roadmap} variant="secondary" size="sm">
              <Kanban className="w-4 h-4 mr-1.5" />
              View Public Roadmap
            </LinkButton>
          <LinkButton to={routes.browse} variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Public Requests
            </LinkButton>
        </div>
      </div>

      <Outlet />
    </div>
  )
}
