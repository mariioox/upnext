import type { InputHTMLAttributes } from "react"
import { useField } from "formik"
import { FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"

export interface FormikInputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string
  label: string
  hint?: string
}

/** Formik binding for the shared FormField + Input. The error only shows once the field is touched. */
export function FormikInput({ name, label, hint, id, required, ...props }: FormikInputProps) {
  const [field, meta] = useField(name)
  const error = meta.touched && meta.error ? meta.error : undefined

  return (
    <FormField label={label} hint={hint} error={error} required={required} id={id ?? `field-${name}`}>
      {(control) => <Input {...field} {...props} {...control} required={required} />}
    </FormField>
  )
}
