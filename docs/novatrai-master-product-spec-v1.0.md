# NOVATRAI
## The Intelligent Business Operating System
### Master Product Specification v1.0

This document is the constitutional backbone for Novatrai. It is the reference framework for product, design, backend, frontend, roadmap, positioning, and future hiring alignment.

## 1) Core Positioning

Novatrai is a structured digital operating headquarters for modern service businesses.

It is not:
- A CRM
- An ERP
- An accounting system
- A workflow tool
- A document tool

It is the structured layer that connects all of them.

## 2) The 4-Layer Operating Doctrine

Novatrai operates on four integrated layers:

| Layer | Purpose | Primary Objects |
|---|---|---|
| Revenue Layer | Create and convert opportunity | Pipeline, Deals |
| Execution Layer | Deliver structured work | Cases, Tasks |
| Governance Layer | Control decisions and risk | Approvals, Workflows |
| Capital Layer | Record financial reality | Invoices, Payments, Journals |

Everything in the system must map to one of these layers.

## 3) The Core Object Model

Everything revolves around structured business objects.

### Revenue
- Pipeline
- PipelineStage
- Deal
- DealStageHistory

### Execution
- Case
- CaseNote
- CaseStatus
- Task

### Governance
- Approval
- WorkflowInstance
- WorkflowStep
- Decision

### Capital
- Invoice (DocumentInstance)
- Payment
- JournalEntry
- LedgerAccount

### System Layer
- EntityLink (cross-object structure)
- TimelineEvent
- AuditEvent
- DocumentTemplate
- DocumentInstance
- File

Every object:
- Has lifecycle
- Emits timeline events
- Is linkable
- Is auditable

No loose data.

## 4) Object Lifecycle Doctrine

Every major object must expose a visible lifecycle.

- Deal Lifecycle: Prospect -> Qualified -> Proposal -> Negotiation -> Won/Lost
- Case Lifecycle: Open -> In Progress -> Waiting -> Closed/Cancelled
- Approval Lifecycle: Pending -> Approved/Rejected
- Task Lifecycle: Open -> Completed
- Invoice Lifecycle: Draft -> Sent -> Paid

This is structural visibility of business flow, not cosmetic design.

## 5) The Headquarters Principle

Novatrai must feel like:
A calm operating headquarters where structured work moves visibly through controlled states.

That means:
- Sidebar = structure
- Drawer = object control panel
- Status pills = lifecycle awareness
- Timeline = accountability
- Linked objects = relational clarity
- Badges = pressure signals

No chaos. No hidden logic.

## 6) Primary Screens and Outcomes

### Dashboard
Outcome:
- See macro performance
- Pipeline KPIs
- Financial KPIs
- Workload overview

### My Day
Outcome:
- See what requires attention
- Pending approvals
- Overdue tasks
- High priority cases
- At-risk deals

This is the personal control room.

### Pipeline
Outcome:
- Visual revenue flow
- Drag and drop stage control
- Conversion analytics
- Mark Won -> structured case creation

Must:
- Show stage totals
- Show pipeline KPIs
- Highlight at-risk deals

### Cases
Outcome:
- Structured delivery of work
- Clear status visibility
- Linked documents and tasks
- Timeline history
- Approval traceability

Must:
- Feel like structured matter control
- Not like CRM notes

### Tasks
Outcome:
- Personal execution queue
- Linked to cases
- Fast completion
- Timeline emission

### Approvals
Outcome:
- Governance enforcement
- Decision audit trail
- Workflow progression
- Case timeline integration

### Documents
Outcome:
- Structured document lifecycle
- Link to case/deal
- SignSure integration
- Document-to-invoice capability

### Finance
#### Invoices
Outcome:
- Revenue capture
- Link to case
- Linked document creation
- Lifecycle tracking

#### Payments
Outcome:
- Settlement tracking
- Invoice resolution

#### Journals
Outcome:
- Double-entry accounting
- Structural ledger
- Matter reference (future FK, not text only)

Finance must not float separately. It must link structurally to Cases and Deals.

## 7) Required Structural Behaviors

1. Mark Deal Won
Must:
- Create Case
- Link Deal -> Case
- Emit dual timeline events
- Bootstrap tasks
- Optional document and workflow trigger

2. Create Invoice
Must:
- Allow linking to Case
- Create DocumentInstance
- Insert Linked pill
- Allow openCase()

3. Approval Decision
Must:
- Emit case.approval.approved
- Enforce 409 on duplicate
- Move workflow forward

4. Task Completion
Must:
- Emit case.task.completed
- Update case timeline

5. Sidebar Badges
Must dynamically reflect:
- Pending approvals
- Overdue tasks
- At-risk deals
- Overdue invoices

## 8) UX Doctrine

The system must be:
- Impressive
- Calm
- Structured
- Intuitive
- Not configuration-heavy
- Not ERP overwhelming

Smart defaults. Minimal setup. Clear flows.

Never feel like:
- Salesforce
- SAP
- NetSuite
- Monday.com clutter

## 9) Current Gaps

Based on full architecture, current gaps are:
1. Structured finance linking (Invoices -> Case FK)
2. Financial KPIs fed from real backend data
3. Ledger -> structured case reference (not narration text)
4. Command palette (future)
5. Analytics dashboards (conversion, cycle time)
6. Role-based UI shaping
7. Notification center
8. Real reporting engine

Core foundation is structurally sound.

## 10) Success Criteria

Novatrai is successful when:
- A business owner can see revenue, execution, governance, and capital in one place.
- Work flows cleanly from Deal -> Case -> Invoice -> Payment.
- No spreadsheet is needed.
- No external CRM is required.
- No ERP consultant is required.
- It feels powerful but light.

Target user feeling:
"Finally. This makes sense."

## 11) Long-Term Vision

Novatrai becomes:
- AI-assisted decision layer
- Intelligent workflow optimizer
- Predictive deal risk analyzer
- Case bottleneck detector
- Financial forecasting engine

But only after structure is perfect.

## Final Instruction

This document is the reference for:
- Johan
- Backend
- Design
- Roadmap
- Positioning

No feature gets added that violates this backbone.
