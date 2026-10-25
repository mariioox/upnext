import { useState } from "react"
import { useNavigate, useSearchParams, Link } from "react-router-dom"
import { Formik, Form } from "formik"
import { signupSchema, type SignupFormValues } from "@/utils/schema/authSchema"
import { useSignupMutation } from "@/services/endpoints/auth"
import { FormikInput } from "@/components/shared/formik-input"
import { Button } from "@/components/ui/button"
import { routes } from "@/utils/routes"
import { useToast } from "@/components/ui/toast"
import { isProblem } from "@/services/httpClient/apiError"
import { getProblemMessage } from "@/utils/problemMessages"
import { UserPlus } from "lucide-react"

export function SignupPage() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const nextUrl = searchParams.get("next") || routes.browse
  const [signup, { isLoading }] = useSignupMutation()
  const [serverError, setServerError] = useState<string | null>(null)

  const initialValues: SignupFormValues = {
    displayName: "",
    email: "",
    password: "",
  }

  return (
    <div className="max-w-md mx-auto my-8 p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-xs">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
          <UserPlus className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Create an Account</h1>
        <p className="text-sm text-slate-500 mt-1">
          Join to submit feature ideas and vote on the roadmap.
        </p>
      </div>

      {serverError && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg">
          {serverError}
        </div>
      )}

      <Formik
        initialValues={initialValues}
        validationSchema={signupSchema}
        onSubmit={async (values, { setFieldError }) => {
          setServerError(null)
          try {
            await signup({
              displayName: values.displayName.trim(),
              email: values.email.trim(),
              password: values.password,
            }).unwrap()

            toast({ variant: "success", title: "Account created successfully!" })
            navigate(nextUrl, { replace: true })
          } catch (err: unknown) {
            // .unwrap() rejects with the ApiError itself (see baseQuery), not { error }.
            if (isProblem(err, "EMAIL_TAKEN")) {
              setFieldError("email", "An account with this email already exists.")
            } else if (isProblem(err)) {
              setServerError(getProblemMessage(err.problem))
            } else {
              setServerError("Unable to create account. Please check your connection.")
            }
          }
        }}
      >
        <Form className="space-y-4">
          <FormikInput
            name="displayName"
            label="Display Name"
            placeholder="e.g. Ada Lovelace"
            hint="Your public author name on requests."
            required
          />

          <FormikInput
            name="email"
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            hint="Case-insensitive, one account per email."
            autoComplete="email"
            required
          />

          <FormikInput
            name="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            hint="At least 8 characters."
            autoComplete="new-password"
            required
          />

          <Button type="submit" disabled={isLoading} className="w-full mt-2">
            {isLoading ? "Creating account..." : "Sign Up"}
          </Button>

          <p className="text-center text-xs text-slate-500 mt-4">
            Already have an account?{" "}
            <Link to={routes.auth.login} className="text-blue-600 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </Form>
      </Formik>
    </div>
  )
}
