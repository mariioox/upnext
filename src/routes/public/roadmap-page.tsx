import { PageHeader } from "@/components/shared/page-header"
import { RoadmapBoard } from "@/modules/roadmap/roadmap-board"
import { LinkButton } from "@/components/shared/link-button"
import { routes } from "@/utils/routes"

export function RoadmapPage() {
  return (
    <div>
      <PageHeader
        title="Roadmap"
        description="What we’re planning, building and shipping. The most-wanted ideas move here first."
        action={
          <LinkButton to={routes.submit} className="border-2 border-ink font-bold">
            + Suggest a feature
          </LinkButton>
        }
      />

      <RoadmapBoard />
    </div>
  )
}
