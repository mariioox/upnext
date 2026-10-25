import { CreateRequestForm } from "@/modules/requests/create-request-form"
import { LinkButton } from "@/components/shared/link-button"
import { routes } from "@/utils/routes"
import { ArrowLeft } from "lucide-react"

export function SubmitPage() {
  return (
    <div className="space-y-4">
      <LinkButton to={routes.browse} variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Requests
        </LinkButton>

      <CreateRequestForm />
    </div>
  )
}
