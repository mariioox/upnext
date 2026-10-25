import type { TextareaHTMLAttributes } from "react"
import { useField } from "formik"
import { FormField } from "@/components/ui/form-field"
import { Textarea } from "@/components/ui/textarea"

export interface FormikTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string
  label: string
  hint?: string
  /** Shows a live "n / max" counter when maxLength is set. */
  showCount?: boolean
}

/** Formik binding for the shared FormField + Textarea. The error only shows once the field is touched. */
export function FormikTextarea({ name, label, hint, id, required, ...props }: FormikTextareaProps) {
  const [field, meta] = useField(name)
  const error = meta.touched && meta.error ? meta.error : undefined

  return (
    <FormField label={label} hint={hint} error={error} required={required} id={id ?? `field-${name}`}>
      {(control) => <Textarea {...field} {...props} {...control} required={required} />}
    </FormField>
  )
}
