import { PageHeader } from "@/components/shared/page-header"
import { RequestList } from "@/modules/browse/request-list"
import { LinkButton } from "@/components/shared/link-button"
import { PlusCircle } from "lucide-react"
import { routes } from "@/utils/routes"

export function BrowsePage() {
  return (
    <div>
      <PageHeader
        title="Feature Requests"
        description="Discover, search, and upvote the features you want most. One vote per user."
        action={
          <LinkButton to={routes.submit}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Submit Request
            </LinkButton>
        }
      />

      <RequestList />
    </div>
  )
}
