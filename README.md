# up-next Web

The frontend interface for **up-next** — a public feedback board and roadmap application (Team 2, proposed by Ehimare J. Okosun).

> **Disclaimer:** up-next is a demonstration application with fictional data and users. All metrics, requests, and timestamps are simulated for demonstration purposes.

---

## Features

- **Public Browse & Search:** Browse feature requests filtered by tag, status, keyword search (`q`), and sort order (Most Upvoted vs Newest First).
- **Public Roadmap:** 3-column view (`Planned`, `In Progress`, `Completed`) updated automatically as card statuses change.
- **Optimistic Upvoting:** 1-vote-per-user with instant UI feedback and automatic rollback on failure (e.g. `409 VOTING_CLOSED`).
- **Feature Submission:** Formik + Yup validated request creation with custom tag support.
- **Admin Kanban Board:** 4-column drag-and-drop board with compare-and-set versioning (`expectedVersion`), `409 STALE_VERSION` reconciliation, and keyboard-accessible move buttons.
- **Status Audit History:** Chronological dialog of who changed each card's status and when.
- **Authentication:** JWT Bearer authentication with role-gated admin controls.

---

## Tech Stack

- **Framework:** React 19 + Vite (SPA)
- **Language:** TypeScript strict (zero `any`)
- **State & Server Cache:** Redux Toolkit 2 + RTK Query (modular `baseApi.injectEndpoints`)
- **Persistence:** `redux-persist` (`auth` slice only)
- **Routing:** React Router v7 (`createBrowserRouter` with lazy-loaded admin routes)
- **Styling:** Tailwind CSS v4 + Radix UI primitives + Lucide React icons
- **Validation:** Formik 2 + Yup 1
- **Testing:** Vitest + React Testing Library

---

## Getting Started

### Prerequisites

- Node.js >= 20
- `pnpm` >= 9

### Installation

```bash
pnpm install
```

### Environment Setup

Create `.env.local`:

```bash
cp .env.example .env.local
```

### Running the Prism Mock Server

To run the mock API server against `upnext-openapi.yaml` on port 4011:

```bash
pnpm mock
```

### Running the Development Server

```bash
pnpm dev
```

App runs at `http://localhost:5173`.

---

## Available Commands

```bash
pnpm dev         # Start Vite dev server (port 5173)
pnpm build       # Run TypeScript check & Vite production build
pnpm preview     # Preview production build locally
pnpm typecheck   # Run TypeScript strict type checking
pnpm test        # Run Vitest unit tests
pnpm mock        # Run Prism mock server on port 4011
pnpm gen:api     # Regenerate types from upnext-openapi.yaml
```

---

## Architecture & Conventions

See [AGENT.md](AGENT.md) for full architecture standards, layering guidelines, and error-handling conventions.
