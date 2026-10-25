import type { components } from "@/api/schema"

type S = components["schemas"]

// Schema aliases (zero runtime overhead)
export type Status = S["Status"]
export type Meta = S["Meta"]
export type User = S["User"]
export type SignupRequest = S["SignupRequest"]
export type LoginRequest = S["LoginRequest"]
export type AuthResponse = S["AuthResponse"]
export type CreateRequest = S["CreateRequest"]
export type RequestItem = S["RequestItem"]
export type RequestPage = S["RequestPage"]
export type VoteState = S["VoteState"]
export type MoveRequest = S["MoveRequest"]
export type StatusHistoryEntry = S["StatusHistoryEntry"]
export type Board = S["Board"]
export type Roadmap = S["Roadmap"]
export type TagCount = S["TagCount"]
export type FieldError = S["FieldError"]
export type Problem = S["Problem"]

// Frontend Argument / State types
export type ListRequestsArgs = {
  tag?: string
  status?: Status
  q?: string
  sort?: "votes" | "newest"
  page?: number
  size?: number
}

export type MoveCardArgs = {
  id: string
  body: MoveRequest
}

export type VoteArgs = {
  id: string
}
