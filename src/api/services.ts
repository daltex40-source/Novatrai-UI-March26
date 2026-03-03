import type { Approval, Case, CaseNote, Task } from "@/api/types";
import { apiGetRaw, apiPostRaw } from "@/api/client";

export type SidebarBadges = {
  atRiskDeals: number;
  overdueTasks: number;
  pendingApprovals: number;
  overdueInvoices: number;
};

type EntityWithStatus = {
  status?: string;
  decision?: string;
};

function toStringValue(value: unknown): string {
  if (value == null) return "";
  return String(value);
}

function firstString(...values: unknown[]): string {
  for (const value of values) {
    const normalized = toStringValue(value).trim();
    if (normalized) return normalized;
  }
  return "";
}

function normalizeStatus(value: unknown, fallback: string): string {
  const normalized = firstString(value).toUpperCase().replaceAll(" ", "_");
  return normalized || fallback;
}

function extractItems(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  const p = payload as Record<string, unknown>;
  if (Array.isArray(p.items)) return p.items;

  if (p.data && typeof p.data === "object") {
    const data = p.data as Record<string, unknown>;
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.results)) return data.results;
  }

  if (Array.isArray(p.results)) return p.results;
  return [];
}

function normalizeCase(raw: unknown): Case | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;

  const id = firstString(item.id, item.case_id, item.caseId, item.case_number);
  const title = firstString(item.title, item.case_title, item.subject, "Untitled case");

  if (!id) return null;

  return {
    id,
    title,
    accountName: firstString(item.account_name, item.accountName, item.company_name, item.client_name, "Unknown account"),
    status: normalizeStatus(item.status, "OPEN") as Case["status"],
    updatedAt: firstString(item.updated_at, item.updatedAt, item.created_at, item.createdAt, new Date().toISOString()),
  };
}

function normalizeTask(raw: unknown): Task | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;

  const id = firstString(item.id, item.task_id, item.taskId);
  const title = firstString(item.title, item.task_title, item.subject, "Untitled task");
  if (!id) return null;

  return {
    id,
    title,
    dueDate: firstString(item.due_at, item.dueDate, item.due_date, ""),
    status: normalizeStatus(item.status, "OPEN") as Task["status"],
    caseId: firstString(item.case_id, item.caseId) || null,
    caseNumber: firstString(item.case_number, item.caseNumber) || null,
    createdAt: firstString(item.created_at, item.createdAt, new Date().toISOString()),
  };
}

function normalizeApproval(raw: unknown): Approval | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;

  const id = firstString(item.id, item.approval_id, item.approvalId);
  const title = firstString(item.workflow_name, item.step_name, item.title, "Approval request");
  if (!id) return null;

  return {
    id,
    title,
    requester: firstString(item.requester_name, item.requester, item.requested_by, "Unknown requester"),
    status: normalizeStatus(item.decision ?? item.status, "PENDING") as Approval["status"],
    caseId: firstString(item.case_id, item.caseId) || null,
    caseNumber: firstString(item.case_number, item.caseNumber) || null,
    createdAt: firstString(item.created_at, item.createdAt, new Date().toISOString()),
    decidedAt: firstString(item.decided_at, item.decidedAt, ""),
  };
}

function normalizeCaseNote(raw: unknown): CaseNote | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;

  const id = firstString(item.id, item.note_id, item.noteId, crypto.randomUUID());
  const text = firstString(item.text, item.body, item.note, item.content);
  if (!text) return null;

  return {
    id,
    text,
    createdAt: firstString(item.created_at, item.createdAt, item.timestamp, new Date().toISOString()),
    authorName: firstString(item.author_name, item.author, item.created_by_name, "System"),
  };
}

function filterOpenStatuses<T extends EntityWithStatus>(items: T[]): T[] {
  return items.filter((item) => {
    const current = normalizeStatus(item.decision ?? item.status, "");
    return current && current !== "COMPLETED" && current !== "APPROVED" && current !== "REJECTED" && current !== "CLOSED";
  });
}

const localCaseDraftsKey = "novatrai_local_case_drafts";
const localTaskDraftsKey = "novatrai_local_task_drafts";
const localApprovalDraftsKey = "novatrai_local_approval_drafts";
const localDealDraftsKey = "novatrai_local_deal_drafts";

function readLocalList<T>(key: string): T[] {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function writeLocalList<T>(key: string, items: T[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(items));
  } catch {
    // Non-fatal storage failure.
  }
}

function mergeById<T extends { id: string }>(primary: T[], secondary: T[]): T[] {
  const seen = new Set<string>();
  const merged: T[] = [];
  for (const item of [...primary, ...secondary]) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    merged.push(item);
  }
  return merged;
}

export async function getMyCases(): Promise<Case[]> {
  let remote: Case[] = [];
  try {
    const payload = await apiGetRaw("/cases/my?limit=50");
    remote = extractItems(payload)
      .map(normalizeCase)
      .filter((item): item is Case => item !== null);
  } catch {
    remote = [];
  }
  const local = readLocalList<Case>(localCaseDraftsKey);
  return mergeById(local, remote);
}

export async function getCaseById(caseId: string): Promise<Case | null> {
  const payload = await apiGetRaw(`/cases/${encodeURIComponent(caseId)}`);
  return normalizeCase(payload);
}

export async function updateCaseStatus(caseId: string, status: Case["status"]): Promise<void> {
  await apiPostRaw(`/cases/${encodeURIComponent(caseId)}/status`, { status });
}

export async function getCaseNotes(caseId: string): Promise<CaseNote[]> {
  const payload = await apiGetRaw(`/cases/${encodeURIComponent(caseId)}/notes?limit=50`);
  return extractItems(payload)
    .map(normalizeCaseNote)
    .filter((item): item is CaseNote => item !== null);
}

export async function addCaseNote(caseId: string, text: string): Promise<void> {
  await apiPostRaw(`/cases/${encodeURIComponent(caseId)}/notes`, { text });
}

export type LinkedEntity = {
  id: string;
  type: string;
  label: string;
};

export type TimelineEntry = {
  id: string;
  type: string;
  summary: string;
  actor: string;
  createdAt: string;
};

export type CaseDrawerData = {
  detail: Case | null;
  timeline: TimelineEntry[];
  linked: LinkedEntity[];
  tasks: Task[];
};

function normalizeTimelineEntry(raw: unknown): TimelineEntry | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  const summary = firstString(item.summary, item.text, item.description, item.message, item.event);
  if (!summary) return null;
  return {
    id: firstString(item.id, item.event_id, item.timeline_id, crypto.randomUUID()),
    type: normalizeStatus(item.type ?? item.event_type, "EVENT"),
    summary,
    actor: firstString(item.actor_name, item.actor, item.created_by_name, "System"),
    createdAt: firstString(item.created_at, item.createdAt, item.timestamp, new Date().toISOString()),
  };
}

function normalizeLinkedEntity(raw: unknown): LinkedEntity | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  const id = firstString(item.id, item.entity_id, item.entityId, item.document_id);
  if (!id) return null;
  return {
    id,
    type: normalizeStatus(item.entity_type ?? item.type, "ENTITY"),
    label: firstString(item.title, item.name, item.label, `${item.entity_type ?? "Entity"} ${id}`),
  };
}

export async function getCaseDrawerData(caseId: string): Promise<CaseDrawerData> {
  const [detailResult, timelineResult, linksResult, tasksResult] = await Promise.allSettled([
    apiGetRaw(`/cases/${encodeURIComponent(caseId)}`),
    apiGetRaw(`/entities/Case/${encodeURIComponent(caseId)}/timeline?limit=50`),
    apiGetRaw(`/entities/Case/${encodeURIComponent(caseId)}/links`),
    apiGetRaw(`/cases/${encodeURIComponent(caseId)}/tasks?limit=20`),
  ]);

  const detail = detailResult.status === "fulfilled" ? normalizeCase(detailResult.value) : null;
  const timeline = extractItems(timelineResult.status === "fulfilled" ? timelineResult.value : [])
    .map(normalizeTimelineEntry)
    .filter((entry): entry is TimelineEntry => entry !== null);
  const linked = extractItems(linksResult.status === "fulfilled" ? linksResult.value : [])
    .map(normalizeLinkedEntity)
    .filter((entry): entry is LinkedEntity => entry !== null);
  const tasks = extractItems(tasksResult.status === "fulfilled" ? tasksResult.value : [])
    .map(normalizeTask)
    .filter((entry): entry is Task => entry !== null);

  return { detail, timeline, linked, tasks };
}

export async function getMyTasks(): Promise<Task[]> {
  let remote: Task[] = [];
  try {
    const payload = await apiGetRaw("/tasks/my?limit=80");
    remote = extractItems(payload)
      .map(normalizeTask)
      .filter((item): item is Task => item !== null);
  } catch {
    remote = [];
  }
  const local = readLocalList<Task>(localTaskDraftsKey);
  return mergeById(local, remote);
}

export async function completeTask(taskId: string): Promise<void> {
  await apiPostRaw(`/tasks/${encodeURIComponent(taskId)}/complete`, {});
}

export async function getMyApprovals(): Promise<Approval[]> {
  let remote: Approval[] = [];
  try {
    const payload = await apiGetRaw("/approvals/my?limit=50&decision=PENDING");
    remote = extractItems(payload)
      .map(normalizeApproval)
      .filter((item): item is Approval => item !== null);
  } catch {
    remote = [];
  }
  const local = readLocalList<Approval>(localApprovalDraftsKey);
  return mergeById(local, remote);
}

export async function decideApproval(
  approvalId: string,
  decision: "APPROVED" | "REJECTED",
  comments?: string,
): Promise<void> {
  await apiPostRaw(`/approvals/${encodeURIComponent(approvalId)}/decide`, {
    decision,
    ...(comments ? { comments } : {}),
  });
}

export async function getSidebarBadges(): Promise<SidebarBadges> {
  const [tasks, approvals, invoices] = await Promise.all([getMyTasks(), getMyApprovals(), getInvoices()]);
  let atRiskDeals = 0;
  try {
    const board = await getPipelineBoard();
    atRiskDeals = board.stages.reduce(
      (count, stage) => count + stage.deals.filter((deal) => deal.atRisk).length,
      0,
    );
  } catch {
    atRiskDeals = 0;
  }

  return {
    atRiskDeals,
    overdueTasks: tasks.filter((task) => normalizeStatus(task.status, "") === "OVERDUE").length,
    pendingApprovals: filterOpenStatuses(approvals).length,
    overdueInvoices: invoices.filter((invoice) => normalizeStatus(invoice.status, "") === "OVERDUE").length,
  };
}

export type MyDayData = {
  overdueTasks: Task[];
  dueSoonTasks: Task[];
  pendingApprovals: Approval[];
  activeCases: Case[];
};

export async function getMyDayData(): Promise<MyDayData> {
  const [tasks, approvals, cases] = await Promise.all([getMyTasks(), getMyApprovals(), getMyCases()]);

  const overdueTasks = tasks.filter((task) => normalizeStatus(task.status, "") === "OVERDUE");
  const dueSoonTasks = tasks.filter((task) => normalizeStatus(task.status, "") === "OPEN").slice(0, 5);
  const pendingApprovals = approvals.filter((approval) => normalizeStatus(approval.status, "") === "PENDING");
  const activeCases = cases
    .filter((item) => ["OPEN", "IN_PROGRESS", "WAITING"].includes(normalizeStatus(item.status, "")))
    .slice(0, 6);

  return {
    overdueTasks,
    dueSoonTasks,
    pendingApprovals,
    activeCases,
  };
}

export type DealCard = {
  id: string;
  title: string;
  companyName: string;
  value: number;
  atRisk: boolean;
  createdAt?: string;
  expectedCloseAt?: string;
  ageDays?: number | null;
};

export type DealDetail = {
  id: string;
  title: string;
  companyName: string;
  value: number;
  ownerName: string;
  expectedCloseAt: string;
  status: string;
  stageId: string;
  stageName: string;
};

export type PipelineStage = {
  id: string;
  name: string;
  order: number;
  deals: DealCard[];
};

export type PipelineBoard = {
  pipelineId: string;
  stages: PipelineStage[];
};

function normalizeDeal(raw: unknown): DealCard | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  const id = firstString(item.id, item.deal_id, item.dealId);
  if (!id) return null;

  const valueRaw = item.value;
  const numericValue =
    typeof valueRaw === "number" ? valueRaw : Number.parseFloat(firstString(valueRaw).replaceAll(",", ""));

  return {
    id,
    title: firstString(item.title, item.name, item.deal_name, "Untitled deal"),
    companyName: firstString(item.company_name, item.companyName, item.account_name, ""),
    value: Number.isFinite(numericValue) ? numericValue : 0,
    atRisk:
      item.is_at_risk === true ||
      item.at_risk === true ||
      normalizeStatus(item.risk_level, "") === "HIGH" ||
      normalizeStatus(item.health, "") === "RISK",
    createdAt: firstString(item.created_at, item.createdAt),
    expectedCloseAt: firstString(item.expected_close_at, item.expectedCloseAt),
    ageDays: (() => {
      const raw = item.age_days;
      if (typeof raw === "number" && Number.isFinite(raw)) return raw;
      const parsed = Number.parseInt(firstString(raw), 10);
      return Number.isFinite(parsed) ? parsed : null;
    })(),
  };
}

function normalizeDealDetail(raw: unknown): DealDetail | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  const id = firstString(item.id, item.deal_id, item.dealId);
  if (!id) return null;
  const valueRaw = item.value;
  const numericValue =
    typeof valueRaw === "number" ? valueRaw : Number.parseFloat(firstString(valueRaw).replaceAll(",", ""));

  return {
    id,
    title: firstString(item.title, item.name, item.deal_name, "Untitled deal"),
    companyName: firstString(item.company_name, item.companyName, item.account_name, ""),
    value: Number.isFinite(numericValue) ? numericValue : 0,
    ownerName: firstString(item.owner_name, item.ownerName, item.owner, "Unassigned"),
    expectedCloseAt: firstString(item.expected_close_at, item.expectedCloseAt, ""),
    status: normalizeStatus(item.status, "OPEN"),
    stageId: firstString(item.stage_id, item.stageId, ""),
    stageName: firstString(item.stage_name, item.stageName, item.stage, ""),
  };
}

function normalizeStage(raw: unknown): PipelineStage | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  const id = firstString(item.id, item.stage_id, item.stageId);
  if (!id) return null;

  const deals = Array.isArray(item.deals)
    ? item.deals.map(normalizeDeal).filter((deal): deal is DealCard => deal !== null)
    : [];

  const orderRaw = item.order;
  const order = typeof orderRaw === "number" ? orderRaw : Number.parseInt(firstString(orderRaw), 10);

  return {
    id,
    name: firstString(item.name, item.label, "Stage"),
    order: Number.isFinite(order) ? order : 0,
    deals,
  };
}

function normalizeBoard(payload: unknown, pipelineId: string): PipelineBoard {
  if (!payload || typeof payload !== "object") {
    return { pipelineId, stages: [] };
  }
  const board = payload as Record<string, unknown>;
  const rawStages = Array.isArray(board.stages) ? board.stages : Array.isArray(board.columns) ? board.columns : [];
  const stages = rawStages.map(normalizeStage).filter((stage): stage is PipelineStage => stage !== null);
  stages.sort((a, b) => a.order - b.order);
  return { pipelineId, stages };
}

export async function getPipelineBoard(): Promise<PipelineBoard> {
  let board: PipelineBoard;
  try {
    const pipelinesPayload = await apiGetRaw("/pipelines");
    const pipelines = extractItems(pipelinesPayload);
    const firstPipeline = pipelines[0];

    let pipelineId = "";
    if (firstPipeline && typeof firstPipeline === "object") {
      const item = firstPipeline as Record<string, unknown>;
      pipelineId = firstString(item.id, item.pipeline_id, item.pipelineId);
    }
    if (!pipelineId) pipelineId = "default";

    const boardPayload = await apiGetRaw(`/pipelines/${encodeURIComponent(pipelineId)}/board`);
    board = normalizeBoard(boardPayload, pipelineId);
  } catch {
    board = {
      pipelineId: "local",
      stages: [
        { id: "prospect", name: "Prospect", order: 1, deals: [] },
        { id: "qualified", name: "Qualified", order: 2, deals: [] },
        { id: "proposal", name: "Proposal", order: 3, deals: [] },
        { id: "negotiation", name: "Negotiation", order: 4, deals: [] },
      ],
    };
  }
  const localDeals = readLocalList<DealCard>(localDealDraftsKey);
  if (localDeals.length > 0 && board.stages.length > 0) {
    const firstStage = board.stages[0];
    firstStage.deals = mergeById(localDeals, firstStage.deals);
  }
  return board;
}

export async function moveDeal(dealId: string, toStageId: string): Promise<void> {
  await apiPostRaw(`/deals/${encodeURIComponent(dealId)}/move`, { to_stage_id: toStageId });
}

export async function getDealById(dealId: string): Promise<DealDetail | null> {
  const payload = await apiGetRaw(`/deals/${encodeURIComponent(dealId)}`);
  return normalizeDealDetail(payload);
}

export async function markDealWon(dealId: string): Promise<{ caseId: string | null }> {
  const result = await apiPostRaw(`/deals/${encodeURIComponent(dealId)}/mark-won`);
  if (!result || typeof result !== "object") return { caseId: null };
  const payload = result as Record<string, unknown>;
  return {
    caseId: firstString(payload.case_id, payload.caseId) || null,
  };
}

export async function markDealLost(dealId: string, reason: string): Promise<void> {
  await apiPostRaw(`/deals/${encodeURIComponent(dealId)}/mark-lost`, {
    reason,
  });
}

export type Invoice = {
  id: string;
  invoiceNumber: string;
  client: string;
  amount: number;
  currency: string;
  dueDate: string;
  status: "DRAFT" | "SENT" | "PAID" | "OVERDUE";
  linkedCaseId: string | null;
  linkedCaseNumber: string | null;
  notes: string;
};

const invoiceStorageKey = "novatrai_refactor_invoices";

const seedInvoices: Invoice[] = [
  {
    id: "INV-1001",
    invoiceNumber: "INV-1001",
    client: "Goldline Holdings",
    amount: 18450,
    currency: "ZAR",
    dueDate: "2026-03-10",
    status: "SENT",
    linkedCaseId: "CASE-3011",
    linkedCaseNumber: "CASE-3011",
    notes: "Implementation phase 1 billing",
  },
  {
    id: "INV-0998",
    invoiceNumber: "INV-0998",
    client: "Ridgeway Capital",
    amount: 9200,
    currency: "ZAR",
    dueDate: "2026-02-26",
    status: "OVERDUE",
    linkedCaseId: "CASE-2970",
    linkedCaseNumber: "CASE-2970",
    notes: "Awaiting payment confirmation",
  },
];

export async function createDealDraft(input: {
  title: string;
  companyName: string;
  companyId?: string;
  value: number;
}): Promise<DealCard> {
  const next: DealCard = {
    id: `DEAL-${Date.now()}`,
    title: input.title.trim() || "New Deal",
    companyName: input.companyName.trim(),
    value: Number.isFinite(input.value) ? input.value : 0,
    atRisk: false,
    createdAt: new Date().toISOString(),
    expectedCloseAt: "",
    ageDays: 0,
  };
  const local = readLocalList<DealCard>(localDealDraftsKey);
  writeLocalList(localDealDraftsKey, [next, ...local]);
  return next;
}

export async function createCaseDraft(input: {
  title: string;
  accountName: string;
  companyId?: string;
  companyName?: string;
}): Promise<Case> {
  const next: Case = {
    id: `CASE-${Date.now()}`,
    title: input.title.trim() || "New Case",
    accountName: input.accountName.trim() || "Unassigned account",
    status: "OPEN",
    updatedAt: new Date().toISOString(),
  };
  const local = readLocalList<Case>(localCaseDraftsKey);
  writeLocalList(localCaseDraftsKey, [next, ...local]);
  return next;
}

export async function createTaskDraft(input: {
  title: string;
  dueDate: string;
  caseId?: string;
}): Promise<Task> {
  const next: Task = {
    id: `TASK-${Date.now()}`,
    title: input.title.trim() || "New Task",
    dueDate: input.dueDate,
    status: "OPEN",
    caseId: input.caseId || null,
    caseNumber: input.caseId || null,
    createdAt: new Date().toISOString(),
  };
  const local = readLocalList<Task>(localTaskDraftsKey);
  writeLocalList(localTaskDraftsKey, [next, ...local]);
  return next;
}

export async function createApprovalRequestDraft(input: {
  title: string;
  requester: string;
  caseId: string;
}): Promise<Approval> {
  const next: Approval = {
    id: `APR-${Date.now()}`,
    title: input.title.trim() || "Approval Request",
    requester: input.requester.trim() || "System",
    status: "PENDING",
    caseId: input.caseId,
    caseNumber: input.caseId,
    createdAt: new Date().toISOString(),
  };
  const local = readLocalList<Approval>(localApprovalDraftsKey);
  writeLocalList(localApprovalDraftsKey, [next, ...local]);
  return next;
}

function readInvoicesFromStorage(): Invoice[] {
  try {
    const raw = window.localStorage.getItem(invoiceStorageKey);
    if (!raw) return seedInvoices;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return seedInvoices;
    return parsed as Invoice[];
  } catch {
    return seedInvoices;
  }
}

function writeInvoicesToStorage(invoices: Invoice[]) {
  try {
    window.localStorage.setItem(invoiceStorageKey, JSON.stringify(invoices));
  } catch {
    // Ignore storage write failures in UI-only mode.
  }
}

export async function getInvoices(): Promise<Invoice[]> {
  return readInvoicesFromStorage();
}

export async function createInvoiceDraft(input: {
  client: string;
  amount: number;
  dueDate: string;
  linkedCaseId?: string;
  companyId?: string;
  companyName?: string;
}): Promise<Invoice> {
  const next: Invoice = {
    id: `INV-${Date.now()}`,
    invoiceNumber: `INV-${String(Date.now()).slice(-6)}`,
    client: input.client.trim() || "New Client",
    amount: Number.isFinite(input.amount) ? input.amount : 0,
    currency: "ZAR",
    dueDate: input.dueDate,
    status: "DRAFT",
    linkedCaseId: input.linkedCaseId || null,
    linkedCaseNumber: input.linkedCaseId || null,
    notes: "Created from global create panel.",
  };
  const current = readInvoicesFromStorage();
  writeInvoicesToStorage([next, ...current]);
  return next;
}

export async function updateInvoiceStatus(invoiceId: string, status: Invoice["status"]): Promise<void> {
  const current = readInvoicesFromStorage();
  const next = current.map((invoice) => (invoice.id === invoiceId ? { ...invoice, status } : invoice));
  writeInvoicesToStorage(next);
}

export async function linkInvoiceToCase(invoiceId: string, caseId: string): Promise<void> {
  const current = readInvoicesFromStorage();
  const invoice = current.find((item) => item.id === invoiceId);
  if (!invoice) {
    throw new Error("Invoice not found");
  }

  await apiPostRaw("/document-instances", {
    title: `${invoice.invoiceNumber}: ${invoice.client}`,
    status: invoice.status,
    data_json: {
      invoice_number: invoice.invoiceNumber,
      client: invoice.client,
      due_date: invoice.dueDate,
      amount: invoice.amount,
      currency: invoice.currency,
      notes: invoice.notes,
    },
    link_to: {
      entityType: "Case",
      entityId: caseId,
      link_type: "finance.invoice",
    },
  });

  const next = current.map((item) =>
    item.id === invoiceId
      ? {
          ...item,
          linkedCaseId: caseId,
          linkedCaseNumber: caseId,
        }
      : item,
  );
  writeInvoicesToStorage(next);
}

export type DashboardSummaryKpis = {
  pipelineValue: number;
  openDeals: number;
  winRate: number | null;
  atRiskDeals: number;
  cashAvailable: number | null;
  netPosition: number | null;
  revenueMtd: number | null;
  overdueInvoices: number;
};

function parseNumeric(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const normalized = firstString(value).replaceAll(/[^\d.-]/g, "");
  if (!normalized) return null;
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeObject(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== "object") return {};
  return payload as Record<string, unknown>;
}

export async function getDashboardSummaryKpis(): Promise<DashboardSummaryKpis> {
  const [dashboardKpisResult, pipelineBoardResult, invoicesResult, financeOverviewResult] = await Promise.allSettled([
    apiGetRaw("/dashboard/kpis"),
    getPipelineBoard(),
    getInvoices(),
    apiGetRaw("/finance/overview"),
  ]);

  const dashboardKpisRaw = dashboardKpisResult.status === "fulfilled" ? normalizeObject(dashboardKpisResult.value) : {};
  const financeOverviewRaw = financeOverviewResult.status === "fulfilled" ? normalizeObject(financeOverviewResult.value) : {};
  const invoices = invoicesResult.status === "fulfilled" ? invoicesResult.value : [];

  let pipelineValue = 0;
  let openDeals = 0;
  let atRiskDeals = 0;

  if (pipelineBoardResult.status === "fulfilled") {
    pipelineValue = pipelineBoardResult.value.stages.reduce(
      (sum, stage) => sum + stage.deals.reduce((dealSum, deal) => dealSum + deal.value, 0),
      0,
    );
    openDeals = pipelineBoardResult.value.stages.reduce((sum, stage) => sum + stage.deals.length, 0);
    atRiskDeals = pipelineBoardResult.value.stages.reduce(
      (sum, stage) => sum + stage.deals.filter((deal) => deal.atRisk).length,
      0,
    );
  }

  const dashboardPipeline = normalizeObject(dashboardKpisRaw.pipeline);
  const dashboardCollections = normalizeObject(dashboardKpisRaw.collections);

  const pipelineValueFromDashboard =
    parseNumeric(dashboardKpisRaw.pipeline_value) ??
    parseNumeric(dashboardPipeline.value) ??
    parseNumeric(dashboardKpisRaw.pipelineValue);
  const openDealsFromDashboard = parseNumeric(dashboardKpisRaw.open_deals) ?? parseNumeric(dashboardKpisRaw.openDeals);
  const winRateFromDashboard =
    parseNumeric(dashboardKpisRaw.win_rate) ?? parseNumeric(dashboardKpisRaw.winRate) ?? parseNumeric(dashboardPipeline.win_rate);

  const cashAvailable =
    parseNumeric(financeOverviewRaw.cash_available) ??
    parseNumeric(financeOverviewRaw.cashAvailable) ??
    parseNumeric(dashboardCollections.cash_available);
  const netPosition =
    parseNumeric(financeOverviewRaw.net_position) ??
    parseNumeric(financeOverviewRaw.netPosition) ??
    parseNumeric(dashboardCollections.net_position);
  const revenueMtd =
    parseNumeric(financeOverviewRaw.revenue_mtd) ??
    parseNumeric(financeOverviewRaw.revenueMTD) ??
    parseNumeric(dashboardCollections.revenue_mtd);

  return {
    pipelineValue: pipelineValueFromDashboard ?? pipelineValue,
    openDeals: openDealsFromDashboard ?? openDeals,
    winRate: winRateFromDashboard,
    atRiskDeals,
    cashAvailable,
    netPosition,
    revenueMtd,
    overdueInvoices: invoices.filter((invoice) => normalizeStatus(invoice.status, "") === "OVERDUE").length,
  };
}

export type DealTimelineEvent = {
  id: string;
  label: string;
  timestamp: string;
};

export type DealLinkedItem = {
  id: string;
  label: string;
  type: "DOCUMENT" | "CASE" | "ENTITY";
};

export type DealDrawerData = {
  timeline: DealTimelineEvent[];
  linked: DealLinkedItem[];
};

function normalizeTimelineEvent(raw: unknown): DealTimelineEvent | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  const id = firstString(item.id, item.event_id, item.history_id, crypto.randomUUID());
  const label = firstString(item.text, item.label, item.description, item.note, item.message);
  if (!label) return null;
  return {
    id,
    label,
    timestamp: firstString(item.created_at, item.createdAt, item.timestamp, new Date().toISOString()),
  };
}

function normalizeLinkedItem(raw: unknown): DealLinkedItem | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  const id = firstString(item.id, item.document_id, item.entity_id);
  const label = firstString(item.title, item.name, item.label);
  if (!id || !label) return null;

  const typeRaw = normalizeStatus(item.type ?? item.entity_type ?? item.entityType, "DOCUMENT");
  let type: DealLinkedItem["type"] = "ENTITY";
  if (typeRaw.includes("DOC")) type = "DOCUMENT";
  if (typeRaw.includes("CASE")) type = "CASE";

  return { id, label, type };
}

export async function getDealDrawerData(dealId: string): Promise<DealDrawerData> {
  const [detailResult, timelineResult, entityTimelineResult, historyResult, linkedResult, linkedDocsResult] = await Promise.allSettled([
    apiGetRaw(`/deals/${encodeURIComponent(dealId)}`),
    apiGetRaw(`/deals/${encodeURIComponent(dealId)}/timeline?limit=30`),
    apiGetRaw(`/entities/Deal/${encodeURIComponent(dealId)}/timeline?limit=30`),
    apiGetRaw(`/deals/${encodeURIComponent(dealId)}/stage-history?limit=30`),
    apiGetRaw(`/entities/Deal/${encodeURIComponent(dealId)}/links`),
    apiGetRaw(`/document-instances?entityType=Deal&entityId=${encodeURIComponent(dealId)}&limit=20`),
  ]);

  const timelineItems = [
    ...extractItems(timelineResult.status === "fulfilled" ? timelineResult.value : null),
    ...extractItems(entityTimelineResult.status === "fulfilled" ? entityTimelineResult.value : null),
    ...extractItems(historyResult.status === "fulfilled" ? historyResult.value : null),
  ]
    .map(normalizeTimelineEvent)
    .filter((item): item is DealTimelineEvent => item !== null)
    .slice(0, 20);

  const linked = [
    ...extractItems(linkedResult.status === "fulfilled" ? linkedResult.value : null),
    ...extractItems(linkedDocsResult.status === "fulfilled" ? linkedDocsResult.value : null),
  ]
    .map(normalizeLinkedItem)
    .filter((item): item is DealLinkedItem => item !== null);

  if (detailResult.status === "fulfilled") {
    const detail = normalizeObject(detailResult.value);
    const linkedCaseId = firstString(detail.case_id, detail.caseId, detail.linked_case_id);
    const linkedCaseNumber = firstString(detail.case_number, detail.caseNumber, linkedCaseId);
    if (linkedCaseId) {
      linked.unshift({
        id: linkedCaseId,
        label: `Case ${linkedCaseNumber || linkedCaseId}`,
        type: "CASE",
      });
    }
  }

  return {
    timeline: timelineItems,
    linked,
  };
}

export type NotificationItem = {
  id: string;
  kind: "APPROVAL" | "TASK" | "EVENT";
  title: string;
  detail: string;
  href: string;
  timestamp: string;
  unread: boolean;
};

export type NotificationCenterData = {
  unreadCount: number;
  items: NotificationItem[];
};

function normalizeActivityItem(raw: unknown): NotificationItem | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  const text = firstString(item.text, item.title, item.message);
  if (!text) return null;
  return {
    id: firstString(item.id, crypto.randomUUID()),
    kind: "EVENT",
    title: text,
    detail: firstString(item.time, item.detail, "Recent activity"),
    href: "/",
    timestamp: firstString(item.created_at, item.createdAt, new Date().toISOString()),
    unread: true,
  };
}

export async function getNotificationCenterData(): Promise<NotificationCenterData> {
  const [approvals, tasks, activityResult] = await Promise.all([
    getMyApprovals(),
    getMyTasks(),
    apiGetRaw("/dashboard/activity?limit=8").catch(() => [] as unknown),
  ]);

  const approvalItems: NotificationItem[] = approvals
    .filter((item) => normalizeStatus(item.status, "") === "PENDING")
    .map((item) => ({
      id: `appr-${item.id}`,
      kind: "APPROVAL",
      title: `Approval pending: ${item.title}`,
      detail: item.requester,
      href: "/approvals",
      timestamp: new Date().toISOString(),
      unread: true,
    }));

  const taskItems: NotificationItem[] = tasks
    .filter((item) => normalizeStatus(item.status, "") === "OVERDUE")
    .map((item) => ({
      id: `task-${item.id}`,
      kind: "TASK",
      title: `Overdue task: ${item.title}`,
      detail: item.dueDate ? `Due ${item.dueDate}` : "Due date not set",
      href: "/tasks",
      timestamp: new Date().toISOString(),
      unread: true,
    }));

  const eventItems = extractItems(activityResult)
    .map(normalizeActivityItem)
    .filter((item): item is NotificationItem => item !== null);

  const items = [...approvalItems, ...taskItems, ...eventItems].slice(0, 20);
  return {
    unreadCount: items.filter((item) => item.unread).length,
    items,
  };
}
