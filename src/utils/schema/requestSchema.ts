import * as Yup from "yup"

export const createRequestSchema = Yup.object({
  title: Yup.string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(160, "Title cannot exceed 160 characters")
    .required("Title is required"),
  description: Yup.string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(4000, "Description cannot exceed 4000 characters")
    .required("Description is required"),
  tags: Yup.array()
    .of(
      Yup.string()
        .matches(/^[A-Za-z0-9-]{1,24}$/, "Tags can only contain letters, numbers, and hyphens (max 24 characters)")
        .required()
    )
    .max(5, "You can select up to 5 tags")
    .default([]),
})

export type CreateRequestFormValues = Yup.InferType<typeof createRequestSchema>
