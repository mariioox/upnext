import * as Yup from "yup"

export const signupSchema = Yup.object({
  displayName: Yup.string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name cannot exceed 80 characters")
    .required("Display name is required"),
  email: Yup.string()
    .trim()
    .email("Enter a valid email address")
    .max(160, "Email cannot exceed 160 characters")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password cannot exceed 100 characters")
    .required("Password is required"),
})

export const loginSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email("Enter a valid email address")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
})

export type SignupFormValues = Yup.InferType<typeof signupSchema>
export type LoginFormValues = Yup.InferType<typeof loginSchema>
