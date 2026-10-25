# AGENT.md — up-next Web (interface tier)

Architecture and code-structure guide for `upnext-web`, the interface for **up-next** (a public feedback board and roadmap). It is the **single source of truth** for how screens are built here. Humans and AI agents both follow it.

---

## 1. Product & Current Phase

**up-next** is a public feedback board and roadmap proposed by Ehimare J. Okosun (Team 2). It provides one shared, transparent place where feature requests are collected, demand is measured through **one vote per user**, and progress is visible on a public roadmap.

| Role | Permissions & Actions | Access |
|---|---|---|
| **Visitor** | Browse requests, filter, search, view roadmap | Anonymous (no token) |
| **User** | Everything visitor does + submit requests, upvote/withdraw votes | Authenticated (`USER` or `ADMIN`) |
| **Admin** | Everything user does + drag/move cards across kanban board, view status history | Authenticated (`ADMIN`) |

### Monday Journey (Definition of Done)
1. A user signs up, submits a request, and another user upvotes it. An admin drags it to Planned and it appears on the public roadmap.
2. The vote count updates immediately (optimistic update). When the service refuses the vote (e.g. `409 VOTING_CLOSED`), the count reverts and an inline message explains.
3. Two simultaneous votes from the same user record one vote (protected by DB `PRIMARY KEY(request_id, user_id)` + `ON CONFLICT DO NOTHING`).
4. Seed data: at least 40 requests across all four statuses (`OPEN`, `PLANNED`, `IN_PROGRESS`, `COMPLETED`), with long titles, tags, and zero-vote states.

---

## 2. Tech Stack

| Area | Choice |
|---|---|
| **Framework** | **React 19** + **Vite** (SPA, zero SSR) |
| **Language** | **TypeScript strict** (`noImplicitAny`, zero `any`) |
| **Routing** | **React Router v7** (`createBrowserRouter`) with path constants in `@/utils/routes.ts` |
| **Styling** | **Tailwind CSS v4**, `cn()` utility (`clsx` + `tailwind-merge`) |
| **Design System** | Radix UI primitives (`@radix-ui/react-*`), Lucide React icons |
| **Server State** | **Redux Toolkit 2 + RTK Query**. Single `baseApi` with modular injected endpoints |
| **Client Persistence** | `redux-persist` whitelisting `auth` slice only. RTK Query cache is never persisted. |
| **Forms & Validation** | **Formik 2 + Yup 1** in `@/utils/schema/` |
| **Feedback** | `sonner` (`toast`) for transient notifications; inline cards for blocking errors |
| **Tests** | **Vitest** + React Testing Library |
| **Mock API** | **Prism** (`@stoplight/prism-cli`) serving `upnext-openapi.yaml` on port **4011** |

---

## 3. Architecture & Directory Layout

Dependencies point one way:
`routes/` → `modules/<feature>/` → `components/shared/` → `components/ui/` (primitives).

```
src/
├── main.tsx                     # Entry point (Redux + PersistGate + Router)
├── router.tsx                   # createBrowserRouter with lazy-loaded admin routes
├── index.css                    # Tailwind CSS v4 variables and semantic tokens
├── api/
│   └── schema.d.ts              # Contract types from upnext-openapi.yaml
├── models/
│   └── index.ts                 # Schema aliases and view model types
├── routes/
│   ├── public/                  # BrowsePage, RequestDetailPage, SubmitPage, RoadmapPage
│   ├── auth/                    # LoginPage, SignupPage
│   └── admin/                   # BoardPage (lazy loaded)
├── components/
│   ├── ui/                      # Radix primitives (button, card, dialog, input, select, etc.)
│   ├── shared/                  # DemoBanner, StateView, LiveRegion, StatusBadge, PageHeader, FormikInput
│   └── layout/                  # PublicLayout, AdminLayout, AdminGate
├── modules/
│   ├── voting/                  # VoteButton (optimistic update & rollback)
│   ├── browse/                  # RequestList, FilterBar
│   ├── requests/                # RequestCard, CreateRequestForm
│   ├── roadmap/                 # RoadmapBoard, RoadmapCardItem
│   └── board/                   # KanbanBoard, StatusHistoryDialog
├── services/
│   ├── httpClient/              # baseApi.ts, baseQuery.ts, apiError.ts
│   └── endpoints/               # meta, auth, requests, vote, board, history, roadmap, tags
├── store/                       # index.ts, authSlice.ts, hooks.ts
├── utils/                       # routes, apiTags, env, problemMessages, schema/
└── lib/utils.ts                 # cn()
```

---

## 4. Key Architectural Patterns

### A. The Optimistic Vote Button
- **Calls:** `PUT /api/v1/requests/{id}/vote` (cast) and `DELETE /api/v1/requests/{id}/vote` (withdraw).
- **Behavior:** Two explicit idempotent calls instead of a toggle. When clicked, instantly updates `voteCount` (+1 or -1) and `viewerHasVoted` in RTK Query cache (`listRequests`, `getRequest`, `getBoard`, `getRoadmap`).
- **Rollback:** On any error (e.g. `409 VOTING_CLOSED` when an item is completed), rolls back cache changes, displays an error toast, and announces the revert through `LiveRegion`.

### B. Admin Kanban Board & Concurrency Control
- **Compare-and-set:** Sends `expectedVersion` with the target status.
- **Conflict Handling (`409 STALE_VERSION`):** Extracts `problem.current` from the RFC 9457 response, updates the card in place to its true column, and alerts the admin.
- **Accessibility:** Fully supports keyboard column moves (`MoveLeft`, `MoveRight` buttons) in addition to HTML5 drag-and-drop.

### C. Error Handling (RFC 9457 `Problem`)
- Switch on `problem.code` (`VALIDATION_FAILED`, `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `EMAIL_TAKEN`, `VOTING_CLOSED`, `STALE_VERSION`, `INTERNAL_ERROR`), never on detail strings.
- Displays `X-Request-Id` on unexpected failures for backend log tracing.

### D. The Five Screen States
Every data view implements:
1. **Loading:** Skeletons shaped like real content (no layout-shifting spinners).
2. **Empty:** Context-aware messages (distinguishing "No requests yet" from "No filter matches").
3. **Error:** Inline error box with a retry action and reference ID.
4. **Success:** Active data view.
5. **Confirmation:** In-place feedback.

---

## 5. Hard Rules — Never Do These

1. **No `any`**: Strict TypeScript everywhere.
2. **No invented fields or paths**: Strictly adhere to `upnext-openapi.yaml`.
3. **No hard-coded path strings**: Always import from `@/utils/routes`.
4. **No branch on `detail` text**: Switch strictly on `problem.code`.
5. **No token on public requests**: Anonymous visitors can browse and view roadmap freely.
6. **No color-only status**: Status badges must always display legible text.
7. **No dead controls**: Every rendered button performs an action or is hidden.
