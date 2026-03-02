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

export async function getMyCases(): Promise<Case[]> {
  const payload = await apiGetRaw("/cases/my?limit=50");
  return extractItems(payload)
    .map(normalizeCase)
    .filter((item): item is Case => item !== null);
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

export async function getMyTasks(): Promise<Task[]> {
  const payload = await apiGetRaw("/tasks/my?limit=80");
  return extractItems(payload)
    .map(normalizeTask)
    .filter((item): item is Task => item !== null);
}

export async function completeTask(taskId: string): Promise<void> {
  await apiPostRaw(`/tasks/${encodeURIComponent(taskId)}/complete`, {});
}

export async function getMyApprovals(): Promise<Approval[]> {
  const payload = await apiGetRaw("/approvals/my?limit=50&decision=PENDING");
  return extractItems(payload)
    .map(normalizeApproval)
    .filter((item): item is Approval => item !== null);
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
  return normalizeBoard(boardPayload, pipelineId);
}

export async function moveDeal(dealId: string, toStageId: string): Promise<void> {
  await apiPostRaw(`/deals/${encodeURIComponent(dealId)}/move`, { to_stage_id: toStageId });
}

export async function markDealWon(dealId: string): Promise<{ caseId: string | null }> {
  const result = await apiPostRaw(`/deals/${encodeURIComponent(dealId)}/mark-won`);
  if (!result || typeof result !== "object") return { caseId: null };
  const payload = result as Record<string, unknown>;
  return {
    caseId: firstString(payload.case_id, payload.caseId) || null,
  };
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
