export const ApiTags = {
  Meta: "Meta",
  Requests: "Requests",
  RequestItem: "RequestItem",
  Board: "Board",
  Roadmap: "Roadmap",
  Tags: "Tags",
  StatusHistory: "StatusHistory",
} as const

export type ApiTag = (typeof ApiTags)[keyof typeof ApiTags]
