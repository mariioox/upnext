import { PageHeader } from "@/components/shared/page-header"
import { RoadmapBoard } from "@/modules/roadmap/roadmap-board"
import { LinkButton } from "@/components/shared/link-button"
import { PlusCircle } from "lucide-react"
import { routes } from "@/utils/routes"

export function RoadmapPage() {
  return (
    <div>
      <PageHeader
        title="Public Roadmap"
        description="Follow what we are planning, building, and shipping. Real-time demand drives our priorities."
        action={
          <LinkButton to={routes.submit}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Suggest a Feature
            </LinkButton>
        }
      />

      <RoadmapBoard />
    </div>
  )
}
