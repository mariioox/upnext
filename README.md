# up-next Web

The frontend interface for **up-next** — a public feedback board and roadmap application (Team 2, proposed by Ehimare J. Okosun).

> **Disclaimer:** up-next is a demonstration application with fictional data and users. All metrics, requests, and timestamps are simulated for demonstration purposes.

## Live demo

| | URL |
|---|---|
| Web app | https://upnext.qocent.app/requests |
| API | https://upnext-api-iqby.onrender.com |

- The API runs on a free plan that sleeps when idle. The **first load can take 30–60 seconds**; the app shows a loading screen and, after 3 seconds, “Waking up the demo server…”. Open it a few minutes before a demo.
- Demo accounts: [ADD the demo voter and admin logins from the API seed, labelled demonstration only].

---

## Features

- **Public Browse & Search:** Browse feature requests filtered by tag, status, keyword search (`q`), and sort order (Most Upvoted vs Newest First).
- **Public Roadmap:** 3-column view (Planned, In progress, Shipped) updated automatically as card statuses change. The API status `COMPLETED` is labelled “Shipped” in the interface.
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
- **Styling:** Tailwind CSS v4 + the cohort's shared component set (Radix UI underneath) + Lucide React icons
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

The API address is read **at build time** from `VITE_API_URL` (or, if that is unset, `VITE_API_BASE_URL`); see `src/utils/env.ts`.

- **Against the local mock** (recommended for development): create `.env.local` with

  ```bash
  VITE_API_URL=http://localhost:4011
  ```

- **Against the deployed API:** `cp .env.example .env.local`.

`.env.production` holds the deployed API address used by the production build. Only `VITE_` variables reach the browser, and everything in them is public: never put a secret there.

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
pnpm lint        # Run ESLint (incl. jsx-a11y accessibility rules)
pnpm test        # Run Vitest unit tests
pnpm mock        # Run Prism mock server on port 4011
pnpm gen:api     # Regenerate types from upnext-openapi.yaml
```

---

## Optimistic action: the vote

Voting is the one optimistic action. When you press the vote button, the count and the orange “voted” state change **immediately**, before the server answers (`src/services/endpoints/vote.ts`).

- The change is applied to **every cached copy** of that request (the feed, the roadmap, the admin board, the detail page), using `selectInvalidatedBy`, so no screen disagrees.
- **If the server refuses** (`409 VOTING_CLOSED` on a shipped request, `401` when the session has expired, or a network failure), the change is **undone** and a message explains why: e.g. “Voting has closed: this request is already completed. Your vote wasn't counted.”
- The server stays the source of truth: the interface does not block voting on shipped requests itself, so the refusal and rollback are visible.
- A regression test (`vote.test.ts`) fails if a rollback leaves any cached copy wrong.

## Concurrency on the admin board

Moving a card sends `expectedVersion`. If another admin moved it first, the API replies `409 STALE_VERSION` with the card's real state; the board shows it in its true column and says “Someone got there first”. A card you just moved keeps an orange outline (“Moved just now”) for a moment so you can see where it landed.

## Design: the Bitmap theme

up-next has its own visual identity, “Bitmap”: paper, ink and one orange used only for voting and the main call to action, with 1-bit dither patterns and a pixel up-arrow mark.

- **Built on the shared component set, unchanged.** The 14 files in `src/components/ui/` and `src/styles/tokens.css` are byte-for-byte copies of [spr-tech/interface-eng-shared-components](https://github.com/spr-tech/interface-eng-shared-components). up-next's look lives in `src/styles/theme.css`, which overrides the token **values** (never the names), so syncing the shared set stays a straight copy.
- **up-next's own pieces:** `src/components/brand/` (pixel arrow and logo, status swatches, the loading screen, empty-state art) and `src/components/shared/link-button.tsx` (a router link styled like the shared Button; proposed to the group for the shared set).
- **Dither is decoration only.** Text never sits on a pattern.
- **Statuses never rely on colour:** each has a pattern of its own (Open empty, Planned 25%, In progress 50%, Shipped solid) **and** its written label.
- Fonts: Archivo (text), IBM Plex Mono (details), Pixelify Sans (logo and vote counts), from Google Fonts.

## Accessibility (target: WCAG 2.2 AA)

What has been checked, honestly:

- **Automated scans:** axe-core run in a real browser (Playwright) on every page during development, with zero violations, plus a check for horizontal scrolling at 360px width. These scans are **not yet part of CI**.
- **Contrast:** every colour pair in `theme.css` was computed against its background (ratios listed at the top of the file); all text is 4.5:1 or more, input borders and the focus ring 3:1 or more.
- **Keyboard:** everything works without a mouse, including moving board cards (arrow buttons, each named, e.g. “Move ‘Dark mode’ right to Planned”). Focus is always visible (3px ink ring).
- **Screen readers:** vote buttons say what they do (“Upvote ‘Dark mode’, 12 votes”), results and vote outcomes are announced through a polite live region, and the loading screen announces once.
- **Motion:** every animation stops under “reduce motion”.
- **Not yet done:** a recorded run with NVDA or VoiceOver. [ADD findings here when done.]

## Known limitations

- Demonstration data only; no real users or customers.
- The free API host sleeps when idle (see Live demo).
- The status history dialog shows the history the API returns; it is not editable.
- [ADD anything else from the API side, e.g. rate limits.]

## Architecture & Conventions

See [AGENT.md](AGENT.md) for full architecture standards, layering guidelines, and error-handling conventions.
