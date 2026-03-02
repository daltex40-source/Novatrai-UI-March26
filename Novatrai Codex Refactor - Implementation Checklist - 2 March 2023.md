# Novatrai UI Refactor - Implementation Checklist

## Scope

Clean rebuild of the Novatrai prototype into a production front end using React (or Next.js), TailwindCSS, shadcn/ui, and a type-safe API layer.  
Prototype is reference only, not migration source.

## Delivery Rules

- No reuse of legacy HTML/CSS.
- No backend contract changes.
- Unified drawer pattern for core objects.
- Calm, structured, high-trust interface.

## Phase 0 - Foundation

### Ticket 0.1 - App Bootstrap

- Set up React or Next.js project structure.
- Configure TypeScript strict mode.
- Install TailwindCSS + shadcn/ui baseline.
- Define app routing structure for primary modules.

Acceptance Criteria:

- App builds and runs locally without errors.
- Tailwind utilities and shadcn components render correctly.
- TypeScript strict checks pass.

### Ticket 0.2 - Global Providers

- Add app-level providers for query/cache layer, toasts, and theme tokens.
- Establish global error boundary and loading fallback.

Acceptance Criteria:

- API errors surface through a consistent UI mechanism.
- Toasts can be triggered from any screen.

### Ticket 0.3 - API Service Layer

- Implement typed API client wrappers for existing endpoints.
- Add shared request/response typing and runtime-safe parsing.
- Centralize error normalization.

Acceptance Criteria:

- Endpoints in this plan are callable via typed functions.
- No direct `fetch` usage in feature components.

## Phase 1 - Core Layout + Design System

### Ticket 1.1 - `AppLayout`

- Build reusable layout with:
  - Sidebar
  - Header
  - Main content area
  - Toast provider placement
  - Reserved integration point for future command palette

Acceptance Criteria:

- All feature screens render inside one shared layout.
- Sidebar and header remain fixed/predictable across pages.

### Ticket 1.2 - Sidebar Navigation

- Implement feature-based navigation:
  - Dashboard
  - My Day
  - Pipeline
  - Cases
  - Tasks
  - Approvals
  - Documents
  - Finance
  - Automations

Acceptance Criteria:

- Route highlighting is correct.
- Navigation order matches spec.

### Ticket 1.3 - `StatusPill` Component

- Create unified status component for:
  - `CaseStatus`
  - `DealStatus`
  - `ApprovalDecision`
  - `TaskStatus`
  - `InvoiceStatus`
- Apply color discipline:
  - Neutral: open/in-progress
  - Amber: waiting/risk
  - Green: completed/won/approved
  - Red: lost/rejected/overdue

Acceptance Criteria:

- Status visuals are consistent across all modules.
- Unknown status value fallback is handled safely.

### Ticket 1.4 - `LifecycleBanner` Component

- Build reusable lifecycle banner with step model + current state.
- Support flows:
  - Deal: Prospect -> Qualified -> Proposal -> Negotiation -> Won/Lost
  - Case: Open -> In Progress -> Waiting -> Closed/Cancelled
  - Approval: Pending -> Approved/Rejected
  - Task: Open -> Completed
  - Invoice: Draft -> Sent -> Paid

Acceptance Criteria:

- Same component works for all listed lifecycle types.
- Current stage is visually unambiguous.

### Ticket 1.5 - Unified Drawer Pattern

- Implement reusable `ObjectDrawer` using shadcn Sheet or Dialog.
- Standard sections:
  - Header (title, status pill, lifecycle banner, primary action slot)
  - Tabs (Overview, Timeline, Linked, Financial when applicable)
  - Scrollable body

Acceptance Criteria:

- Case, Deal, Invoice, and optional Approval/Task use same drawer shell.
- Drawer behavior and spacing are consistent.

## Phase 2 - Functional Pages (Priority)

### Ticket 2.1 - Cases List Page

- Build cases list with filtering/sorting baseline.
- Integrate `GET /cases/my`.
- Open selected row in Case Drawer.

Acceptance Criteria:

- Cases load from API and render reliably.
- Empty, loading, and error states are handled.

### Ticket 2.2 - Case Drawer

- Integrate `GET /cases/:id`.
- Timeline tab: include notes feed and note creation via `POST /cases/:id/notes`.
- Status change action via `POST /cases/:id/status`.
- Linked tab: documents and relationships display.

Acceptance Criteria:

- Case detail opens from list and remains stable on refresh.
- New note appears after submit without full page reload.
- Status update reflects immediately in drawer and list.

### Ticket 2.3 - Tasks List

- Build tasks screen with `GET /tasks/my`.
- Complete action via `POST /tasks/:id/complete`.
- Use `StatusPill` and optional lightweight drawer.

Acceptance Criteria:

- Completing a task updates row state and counters.
- Overdue state is visually clear and consistent.

### Ticket 2.4 - Approvals Inbox

- Build approvals inbox with `GET /approvals/my`.
- Decision action via `POST /approvals/:id/decide`.
- Optional approval drawer uses shared shell.

Acceptance Criteria:

- Approve/reject updates list state correctly.
- Pending count aligns with sidebar badge logic.

## Phase 3 - Aggregation + Visibility

### Ticket 3.1 - My Day

- Aggregate tasks, approvals, and urgent items in one view.
- Prioritize actionable, due, and blocked work.

Acceptance Criteria:

- User can identify today’s priorities within one screen.
- Each item deep-links to its module/detail drawer.

### Ticket 3.2 - Dashboard

- Build high-signal executive summary view.
- Include lifecycle distribution and risk indicators.

Acceptance Criteria:

- Metrics are readable and not cluttered.
- No playful or excessive motion.

## Phase 4 - Pipeline + Deal Flow

### Ticket 4.1 - Pipeline Board

- Build Kanban board using approved DnD library.
- Integrate `GET /pipelines/:id/board`.
- Column move updates via `POST /deals/:id/move`.

Acceptance Criteria:

- Drag/drop persists correctly and updates UI optimistically.
- Failure path rolls back and notifies user.

### Ticket 4.2 - Deal Drawer

- Implement shared `ObjectDrawer` for deal details and timeline.
- Reuse `StatusPill` and `LifecycleBanner`.

Acceptance Criteria:

- Deal drawer visual/interaction parity with Case drawer.

### Ticket 4.3 - Mark Won -> Create Case Flow

- Integrate `POST /deals/:id/mark-won`.
- Confirm resulting case linkage and navigation affordance.

Acceptance Criteria:

- Winning a deal updates board status and surfaces linked case path.

## Phase 5 - Finance UI (UI-Only)

### Ticket 5.1 - Finance Screens

- Build Invoices, Payments, Ledger interface shells.
- Implement invoice drawer on shared pattern.

Acceptance Criteria:

- Finance pages are coherent with global design system.
- Invoice states map through `StatusPill`.

### Ticket 5.2 - Invoice Linking via DocumentInstance

- Integrate `POST /document-instances` with `link_to`.
- Enable Invoice -> Case association path.

Acceptance Criteria:

- Linked records are visible in both relevant object contexts.

## Cross-Cutting Tickets

### Ticket X.1 - Sidebar Badge System

- Implement `useSidebarBadges()`.
- Feed sources:
  - At-risk deals
  - Overdue tasks
  - Pending approvals
  - Overdue invoices
- Refresh on window focus or polling (max every 60s).

Acceptance Criteria:

- Badge counts stay accurate without manual refresh.
- Polling interval does not exceed 60 seconds.

### Ticket X.2 - Command Palette Readiness

- Reserve architecture point for future Ctrl+K integration using shadcn Command.
- Do not implement full palette yet.

Acceptance Criteria:

- No structural refactor required later to plug in palette provider/UI.

### Ticket X.3 - UX Consistency Guardrails

- Validate calm visual language, restrained motion, predictable interactions.
- Remove unnecessary modals and configuration surfaces.

Acceptance Criteria:

- Drawer-first interaction model is applied consistently.
- No ERP-like complexity added.

## Dependency Order

1. Phase 0 -> Phase 1
2. Phase 1 (`StatusPill`, `LifecycleBanner`, `ObjectDrawer`) before Phase 2 feature completion
3. Phase 2 before My Day/Dashboard aggregation
4. Pipeline/Finance after shared interaction primitives are stable

## Definition of Done

- All listed pages/components are rebuilt in new stack.
- API endpoints are consumed through typed service layer only.
- Cases + Tasks + Approvals are production-usable.
- Shared drawer/lifecycle/status systems are applied across modules.
- No legacy markup/CSS migration artifacts remain.
- UX aligns with: calm, structured, serious, predictable, high-trust.
