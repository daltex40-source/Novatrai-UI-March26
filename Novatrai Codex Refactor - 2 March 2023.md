# Novatrai UI Refactor Plan

We are refactoring the Novatrai prototype UI (single HTML + custom CSS + ES5 JS) into a production-grade front end using:

- TailwindCSS
- shadcn/ui components
- React (or Next.js if applicable)
- Type-safe API integration

The current UI should be treated as a functional spec and interaction reference, not as code to migrate.

Do NOT try to reuse HTML/CSS directly. Rebuild cleanly.

## 🎯 Core Objective

Rebuild Novatrai as a Structured Digital Operating Headquarters with:

- Enterprise structure
- Startup ease
- Calm, coherent UX
- Strong lifecycle visibility
- Consistent overlay/drawer patterns
- No ERP complexity

## 🧱 Architecture Requirements

### 1️⃣ Global Layout

Create a reusable layout structure:

```tsx
<AppLayout>
  Sidebar
  Header (top bar)
  Main content area
  Optional global command palette (future)
  Toast provider
</AppLayout>
```

Sidebar remains feature-based (NOT doctrine-grouped):

- Dashboard
- My Day
- Pipeline
- Cases
- Tasks
- Approvals
- Documents
- Finance
- Automations

### 2️⃣ Overlay / Drawer Pattern (CRITICAL)

All major objects must use a unified Drawer pattern using shadcn Sheet or Dialog.

Create reusable:

```tsx
<ObjectDrawer>
  Header
    - Title
    - Status pill
    - Lifecycle banner
    - Primary action slot
  Tabs
    - Overview
    - Timeline
    - Linked
    - Financial (if applicable)
  Scrollable content area
</ObjectDrawer>
```

Apply to:

- Case
- Deal
- Invoice (UI-only for now)
- Approval (optional)
- Task (lightweight)

Consistency > creativity.

### 3️⃣ Lifecycle Banner System

Implement a reusable component:

```tsx
<LifecycleBanner
  steps={[...]}
  currentStatus="IN_PROGRESS"
/>
```

Supported lifecycles:

- Deal: Prospect -> Qualified -> Proposal -> Negotiation -> Won/Lost
- Case: Open -> In Progress -> Waiting -> Closed/Cancelled
- Approval: Pending -> Approved/Rejected
- Task: Open -> Completed
- Invoice: Draft -> Sent -> Paid

Use shadcn Badge for status pills.

Keep styling calm and institutional.

### 4️⃣ Screen Structure Refactor Order

Rebuild in this order:

Phase 1

- Cases list page
- Case Drawer (with lifecycle + timeline + linked documents)
- Tasks list
- Approvals inbox

Phase 2

- My Day (aggregated view)
- Dashboard

Phase 3

- Pipeline board (Kanban using DnD library)
- Deal Drawer
- Mark Won -> create Case integration

Phase 4

- Finance screens (Invoices, Payments, Ledger UI-only)
- Invoice -> Case linking via DocumentInstance

### 5️⃣ API Contract Usage

Use existing backend endpoints exactly as defined.

Examples:

- GET /cases/my
- GET /cases/:id
- POST /cases/:id/notes
- POST /cases/:id/status
- GET /approvals/my
- POST /approvals/:id/decide
- GET /tasks/my
- POST /tasks/:id/complete
- GET /pipelines/:id/board
- POST /deals/:id/move
- POST /deals/:id/mark-won
- POST /document-instances (with link_to)

Do not change backend contracts.

### 6️⃣ Status & Design System

Unify all statuses under one visual system:

```tsx
<StatusPill status="OPEN" />
```

Map:

- CaseStatus
- DealStatus
- ApprovalDecision
- TaskStatus
- InvoiceStatus

Use color discipline:

- Neutral (open/in progress)
- Amber (waiting/risk)
- Green (completed/won/approved)
- Red (lost/rejected/overdue)

No flashy animations.

### 7️⃣ Sidebar Badge System

Implement a shared hook:

`useSidebarBadges()`

Feeds:

- At-risk deals
- Overdue tasks
- Pending approvals
- Overdue invoices

Badges update on screen focus or polling (60s max).

### 8️⃣ Command Palette (Prepare for Future)

Architect for a future Ctrl+K palette using shadcn Command.

Not required immediately, but layout should support it cleanly.

## 🧠 Design Philosophy

The UI must feel:

- Calm
- Structured
- Serious
- Predictable
- High-trust
- Not playful
- Not ERP-heavy
- No clutter
- No unnecessary configuration screens
- Smart defaults everywhere

## 🚫 Do Not

- Do not over-group by doctrine (Revenue/Execution/etc.)
- Do not introduce setup wizards
- Do not create unnecessary modals
- Do not redesign flows that already work logically
- Do not overuse animations

## 🏛 Success Criteria

The system should feel like:

A digital operating headquarters where structured work flows through lifecycle states with clarity and control.

If someone logs in for the first time, they should feel:

"Finally, everything is in one place - and it makes sense."

## Deliverables

- Layout component
- Sidebar component
- LifecycleBanner component
- StatusPill component
- Drawer pattern
- Refactored Cases + Tasks + Approvals pages
- Clean API service layer
- No half-migration
- Clean rebuild
