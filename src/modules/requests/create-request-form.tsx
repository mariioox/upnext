import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Formik, Form } from "formik"
import { createRequestSchema, type CreateRequestFormValues } from "@/utils/schema/requestSchema"
import { useCreateRequestMutation } from "@/services/endpoints/requests"
import { FormikInput } from "@/components/shared/formik-input"
import { FormikTextarea } from "@/components/shared/formik-textarea"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { routes } from "@/utils/routes"
import { useToast } from "@/components/ui/toast"
import { isProblem } from "@/services/httpClient/apiError"
import { getProblemMessage } from "@/utils/problemMessages"
import { X, Plus, Lightbulb } from "lucide-react"

export function CreateRequestForm() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [createRequest, { isLoading }] = useCreateRequestMutation()
  const [tagInput, setTagInput] = useState("")
  const [formError, setFormError] = useState<string | null>(null)

  const initialValues: CreateRequestFormValues = {
    title: "",
    description: "",
    tags: [],
  }

  const handleAddTag = (
    currentTags: string[],
    setFieldValue: (field: string, value: unknown) => void
  ) => {
    const trimmed = tagInput.trim().toLowerCase()
    if (!trimmed) return

    // Validate tag format
    if (!/^[a-z0-9-]{1,24}$/.test(trimmed)) {
      toast({ variant: "error", title: "Tag can only have letters, numbers, and hyphens (max 24 characters)" })
      return
    }

    if (currentTags.includes(trimmed)) {
      toast({ variant: "error", title: "Tag already added" })
      return
    }

    if (currentTags.length >= 5) {
      toast({ variant: "error", title: "Maximum 5 tags allowed" })
      return
    }

    setFieldValue("tags", [...currentTags, trimmed])
    setTagInput("")
  }

  const handleRemoveTag = (
    tagToRemove: string,
    currentTags: string[],
    setFieldValue: (field: string, value: unknown) => void
  ) => {
    setFieldValue(
      "tags",
      currentTags.filter((t) => t !== tagToRemove)
    )
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs max-w-2xl mx-auto">
      <div className="flex items-center gap-3 pb-6 border-b border-slate-100 mb-6">
        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
          <Lightbulb className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Submit a Feature Request</h2>
          <p className="text-sm text-slate-500">
            Tell the team what you want built. Community upvotes help decide what comes next.
          </p>
        </div>
      </div>

      {formError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
          {formError}
        </div>
      )}

      <Formik
        initialValues={initialValues}
        validationSchema={createRequestSchema}
        onSubmit={async (values, { setErrors }) => {
          setFormError(null)
          try {
            const result = await createRequest({
              title: values.title.trim(),
              description: values.description.trim(),
              tags: values.tags && values.tags.length > 0 ? values.tags : undefined,
            }).unwrap()

            toast({ variant: "success", title: "Request submitted successfully!" })
            navigate(routes.request(result.id))
          } catch (err: unknown) {
            // .unwrap() rejects with the ApiError itself (see baseQuery), not { error }.
            if (isProblem(err, "VALIDATION_FAILED")) {
              const fieldErrors: Record<string, string> = {}
              err.problem.fieldErrors?.forEach((fe) => {
                fieldErrors[fe.field] = fe.message
              })
              setErrors(fieldErrors)
            } else if (isProblem(err)) {
              setFormError(getProblemMessage(err.problem))
            } else {
              setFormError("Failed to submit request. Please check your connection.")
            }
          }
        }}
      >
        {({ values, setFieldValue, errors, touched }) => (
          <Form className="space-y-6">
            <FormikInput
              name="title"
              label="Feature Title"
              placeholder="e.g. Dark mode support for night work"
              hint="Be short and specific (3 to 160 characters)."
              required
            />

            <FormikTextarea
              name="description"
              label="Description & Use Case"
              rows={5}
              maxLength={4000}
              showCount
              placeholder="Explain what problem this solves and how it should work..."
              hint="Describe why this is needed (at least 10 characters)."
              required
            />

            <div className="space-y-2">
              <label htmlFor="tag-input" className="block text-sm font-medium text-slate-700">
                Tags (Optional, up to 5)
              </label>
              <div className="flex gap-2">
                <Input
                  id="tag-input"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddTag(values.tags || [], setFieldValue)
                    }
                  }}
                  placeholder="e.g. ui, export, mobile"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => handleAddTag(values.tags || [], setFieldValue)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>

              {values.tags && values.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {values.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag, values.tags || [], setFieldValue)}
                        className="text-blue-500 hover:text-blue-800 ml-1 cursor-pointer"
                        aria-label={`Remove tag ${tag}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {touched.tags && errors.tags && (
                <p className="text-xs font-medium text-red-600 mt-1">
                  {typeof errors.tags === "string" ? errors.tags : "Invalid tags"}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate(routes.browse)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="shadow-xs">
                {isLoading ? "Submitting..." : "Post Request"}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}
