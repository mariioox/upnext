import { useState } from "react"
import { useNavigate, useSearchParams, Link } from "react-router-dom"
import { Formik, Form } from "formik"
import { loginSchema, type LoginFormValues } from "@/utils/schema/authSchema"
import { useLoginMutation } from "@/services/endpoints/auth"
import { FormikInput } from "@/components/shared/formik-input"
import { Button } from "@/components/ui/button"
import { routes } from "@/utils/routes"
import { useToast } from "@/components/ui/toast"
import { isProblem } from "@/services/httpClient/apiError"
import { getProblemMessage } from "@/utils/problemMessages"
import { LogIn } from "lucide-react"

export function LoginPage() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const nextUrl = searchParams.get("next") || routes.browse
  const [login, { isLoading }] = useLoginMutation()
  const [serverError, setServerError] = useState<string | null>(null)

  const initialValues: LoginFormValues = {
    email: "",
    password: "",
  }

  return (
    <div className="max-w-md mx-auto my-8 p-6 sm:p-8 bg-card border border-line">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-signal text-ink border-2 border-ink flex items-center justify-center mx-auto mb-3">
          <LogIn className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-ink">Sign in to up-next</h1>
        <p className="text-sm text-ink-muted mt-1">
          Sign in to submit feature requests and cast your votes.
        </p>
      </div>

      {serverError && (
        <div className="mb-6 p-3 border-2 border-danger-ink bg-card text-danger-ink text-sm">
          {serverError}
        </div>
      )}

      <Formik
        initialValues={initialValues}
        validationSchema={loginSchema}
        onSubmit={async (values) => {
          setServerError(null)
          try {
            await login({
              email: values.email.trim(),
              password: values.password,
            }).unwrap()

            toast({ variant: "success", title: "Signed in successfully!" })
            navigate(nextUrl, { replace: true })
          } catch (err: unknown) {
            // .unwrap() rejects with the ApiError itself (see baseQuery), not { error }.
            if (isProblem(err, "UNAUTHENTICATED")) {
              setServerError("Invalid email or password.")
            } else if (isProblem(err)) {
              setServerError(getProblemMessage(err.problem))
            } else {
              setServerError("Unable to sign in. Please check your connection.")
            }
          }
        }}
      >
        <Form className="space-y-4">
          <FormikInput
            name="email"
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />

          <FormikInput
            name="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />

          <Button type="submit" disabled={isLoading} className="w-full mt-2">
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>

          <p className="text-center text-xs text-ink-muted mt-4">
            Don't have an account?{" "}
            <Link to={routes.auth.signup} className="font-bold text-ink underline decoration-signal decoration-2 underline-offset-4">
              Create an account
            </Link>
          </p>
        </Form>
      </Formik>
    </div>
  )
}
