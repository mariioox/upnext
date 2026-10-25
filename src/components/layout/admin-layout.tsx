import { Outlet } from "react-router-dom"
import { LinkButton } from "@/components/shared/link-button"
import { routes } from "@/utils/routes"

export function AdminLayout() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="min-w-0">
          <p className="m-0 mb-2 inline-block bg-ink px-2 py-0.5 font-mono text-xs font-semibold text-paper">ADMIN</p>
          <h1 className="m-0 text-4xl leading-none font-black tracking-tight md:text-5xl">Roadmap board</h1>
          <p className="mt-3 mb-0 text-base text-ink-muted">Move requests between stages. Everyone sees the change straight away.</p>
        </div>
        <LinkButton to={routes.roadmap} variant="secondary" size="sm" className="self-start sm:self-auto">
          View public roadmap
        </LinkButton>
      </div>

      <Outlet />
    </div>
  )
}
