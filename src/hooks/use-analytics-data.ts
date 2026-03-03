import { useCallback, useEffect, useMemo, useState } from "react";
import { apiGetRaw } from "@/api/client";
import { getMyApprovals, getMyCases, getMyTasks, getPipelineBoard, type PipelineBoard } from "@/api/services";
import type { Approval, Case, Task } from "@/api/types";

type TrendPoint = {
  label: string;
  value: number;
};

type StageConversion = {
  from: string;
  to: string;
  rate: number | null;
  fromCount: number;
  toCount: number;
};

type StuckStage = {
  stage: string;
  stuckDeals: number;
  totalDeals: number;
};

type PipelineAnalytics = {
  stageConversions: StageConversion[];
  averageDealCycleDays: number | null;
  stuckByStage: StuckStage[];
  winRateTrend: TrendPoint[];
};

type CaseAgingBucket = {
  bucket: string;
  count: number;
};

type ExecutionAnalytics = {
  caseAging: CaseAgingBucket[];
  overdueTasksTrend: TrendPoint[];
  approvalTurnaroundHours: number | null;
};

export type AnalyticsData = {
  pipeline: PipelineAnalytics;
  execution: ExecutionAnalytics;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  usingFallback: boolean;
};

type DealStageHistoryEvent = {
  id: string;
  dealId: string;
  toStage: string;
  timestamp: string;
};

function demoPipelineBoard(): PipelineBoard {
  const now = Date.now();
  return {
    pipelineId: "demo",
    stages: [
      {
        id: "prospect",
        name: "Prospect",
        order: 1,
        deals: [
          { id: "deal_demo_001", title: "Apex Advisory Rollout", companyName: "Apex Advisory", value: 185000, atRisk: false, createdAt: new Date(now - 5 * 86_400_000).toISOString(), ageDays: 5 },
          { id: "deal_demo_002", title: "Bluewater Compliance Program", companyName: "Bluewater", value: 96000, atRisk: true, createdAt: new Date(now - 22 * 86_400_000).toISOString(), ageDays: 22 },
        ],
      },
      {
        id: "qualified",
        name: "Qualified",
        order: 2,
        deals: [
          { id: "deal_demo_003", title: "Northstar Advisory Stack", companyName: "Northstar", value: 142000, atRisk: false, createdAt: new Date(now - 15 * 86_400_000).toISOString(), ageDays: 15 },
        ],
      },
      {
        id: "proposal",
        name: "Proposal",
        order: 3,
        deals: [
          { id: "deal_demo_004", title: "Sable Ops Hub", companyName: "Sable Group", value: 255000, atRisk: true, createdAt: new Date(now - 28 * 86_400_000).toISOString(), ageDays: 28 },
        ],
      },
      {
        id: "negotiation",
        name: "Negotiation",
        order: 4,
        deals: [
          { id: "deal_demo_005", title: "Vertex Capital HQ", companyName: "Vertex Capital", value: 310000, atRisk: false, createdAt: new Date(now - 18 * 86_400_000).toISOString(), ageDays: 18 },
        ],
      },
    ],
  };
}

function demoCases(): Case[] {
  const now = Date.now();
  return [
    { id: "case_demo_001", title: "Onboarding Transformation", accountName: "Apex Advisory", status: "IN_PROGRESS", updatedAt: new Date(now - 3 * 86_400_000).toISOString() },
    { id: "case_demo_002", title: "Governance Remediation", accountName: "Bluewater", status: "WAITING", updatedAt: new Date(now - 12 * 86_400_000).toISOString() },
    { id: "case_demo_003", title: "Capital Workflow Structuring", accountName: "Northstar", status: "OPEN", updatedAt: new Date(now - 21 * 86_400_000).toISOString() },
    { id: "case_demo_004", title: "Case Closure Sprint", accountName: "Vertex Capital", status: "OPEN", updatedAt: new Date(now - 34 * 86_400_000).toISOString() },
  ];
}

function demoTasks(): Task[] {
  const now = Date.now();
  return [
    { id: "task_demo_001", title: "Prepare proposal pack", dueDate: new Date(now - 2 * 86_400_000).toISOString(), status: "OPEN", caseId: "case_demo_001", caseNumber: "case_demo_001", createdAt: new Date(now - 4 * 86_400_000).toISOString() },
    { id: "task_demo_002", title: "Approval follow-up", dueDate: new Date(now - 9 * 86_400_000).toISOString(), status: "OPEN", caseId: "case_demo_002", caseNumber: "case_demo_002", createdAt: new Date(now - 11 * 86_400_000).toISOString() },
    { id: "task_demo_003", title: "Draft governance memo", dueDate: new Date(now - 19 * 86_400_000).toISOString(), status: "OPEN", caseId: "case_demo_003", caseNumber: "case_demo_003", createdAt: new Date(now - 20 * 86_400_000).toISOString() },
  ];
}

function demoApprovals(): Approval[] {
  const now = Date.now();
  return [
    {
      id: "apr_demo_001",
      title: "Budget release",
      requester: "R. Jacobs",
      status: "APPROVED",
      caseId: "case_demo_001",
      caseNumber: "case_demo_001",
      createdAt: new Date(now - 36 * 3_600_000).toISOString(),
      decidedAt: new Date(now - 20 * 3_600_000).toISOString(),
    },
    {
      id: "apr_demo_002",
      title: "Discount exception",
      requester: "M. Ncube",
      status: "REJECTED",
      caseId: "case_demo_002",
      caseNumber: "case_demo_002",
      createdAt: new Date(now - 70 * 3_600_000).toISOString(),
      decidedAt: new Date(now - 42 * 3_600_000).toISOString(),
    },
  ];
}

function formatMonthLabel(date: Date): string {
  return date.toLocaleDateString(undefined, { month: "short" });
}

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function daysBetween(from: Date, to: Date): number {
  return Math.max(0, Math.floor((to.getTime() - from.getTime()) / 86_400_000));
}

function hoursBetween(from: Date, to: Date): number {
  return Math.max(0, (to.getTime() - from.getTime()) / 3_600_000);
}

function ageFromDeal(deal: { ageDays?: number | null; createdAt?: string }): number | null {
  if (typeof deal.ageDays === "number" && Number.isFinite(deal.ageDays)) return Math.max(0, deal.ageDays);
  const createdAt = parseDate(deal.createdAt);
  if (!createdAt) return null;
  return daysBetween(createdAt, new Date());
}

function normalizeHistoryEvent(raw: unknown): DealStageHistoryEvent | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  const id = String(item.id ?? item.history_id ?? "");
  const dealId = String(item.deal_id ?? item.dealId ?? item.entity_id ?? "");
  const toStage = String(item.to_stage_name ?? item.to_stage ?? item.stage_name ?? item.stage ?? "");
  const timestamp = String(item.created_at ?? item.timestamp ?? item.occurred_at ?? "");
  if (!id || !dealId || !toStage || !timestamp) return null;
  return { id, dealId, toStage: toStage.toUpperCase(), timestamp };
}

function makeSixMonthBuckets(): { key: string; label: string; start: Date; end: Date }[] {
  const now = new Date();
  const out: { key: string; label: string; start: Date; end: Date }[] = [];
  for (let i = 5; i >= 0; i -= 1) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    out.push({
      key: start.toISOString(),
      label: formatMonthLabel(start),
      start,
      end,
    });
  }
  return out;
}

async function getDealHistoryEvents(): Promise<DealStageHistoryEvent[]> {
  const routes = [
    "/deals/stage-history?limit=300",
    "/analytics/deals/stage-history?limit=300",
    "/deal-stage-history?limit=300",
  ];

  for (const route of routes) {
    try {
      const payload = await apiGetRaw(route);
      const list = Array.isArray(payload)
        ? payload
        : payload && typeof payload === "object" && Array.isArray((payload as { items?: unknown[] }).items)
          ? (payload as { items: unknown[] }).items
          : [];
      const normalized = list.map(normalizeHistoryEvent).filter((item): item is DealStageHistoryEvent => item !== null);
      if (normalized.length > 0) return normalized;
    } catch {
      // Try next candidate route.
    }
  }
  return [];
}

async function getAllApprovalsForAnalytics(): Promise<Approval[]> {
  try {
    const payload = await apiGetRaw("/approvals/my?limit=120");
    const list = Array.isArray(payload)
      ? payload
      : payload && typeof payload === "object" && Array.isArray((payload as { items?: unknown[] }).items)
        ? (payload as { items: unknown[] }).items
        : [];

    const next = list
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const row = item as Record<string, unknown>;
        const id = String(row.id ?? row.approval_id ?? "");
        if (!id) return null;
        const status = String(row.decision ?? row.status ?? "PENDING").toUpperCase() as Approval["status"];
        return {
          id,
          title: String(row.title ?? row.workflow_name ?? "Approval"),
          requester: String(row.requester ?? row.requester_name ?? "Unknown requester"),
          status,
          caseId: row.case_id ? String(row.case_id) : null,
          caseNumber: row.case_number ? String(row.case_number) : null,
          createdAt: String(row.created_at ?? row.createdAt ?? ""),
          decidedAt: String(row.decided_at ?? row.decidedAt ?? ""),
        } satisfies Approval;
      })
      .filter((row): row is Approval => row !== null);
    if (next.length > 0) return next;
  } catch {
    // Fall back to pending approvals endpoint.
  }

  return getMyApprovals();
}

function computePipelineAnalytics(board: PipelineBoard, history: DealStageHistoryEvent[]): PipelineAnalytics {
  const conversions: StageConversion[] = [];
  for (let i = 0; i < board.stages.length - 1; i += 1) {
    const from = board.stages[i];
    const to = board.stages[i + 1];
    const fromCount = from.deals.length;
    const toCount = to.deals.length;
    conversions.push({
      from: from.name,
      to: to.name,
      rate: fromCount > 0 ? Math.min(1, toCount / fromCount) : null,
      fromCount,
      toCount,
    });
  }

  const ages = board.stages
    .flatMap((stage) => stage.deals)
    .map((deal) => ageFromDeal(deal))
    .filter((age): age is number => age !== null);
  const averageDealCycleDays = ages.length > 0 ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : null;

  const stuckByStage = board.stages.map((stage) => {
    const stuckDeals = stage.deals.filter((deal) => {
      const age = ageFromDeal(deal);
      return age !== null && age > 14;
    }).length;
    return {
      stage: stage.name,
      stuckDeals,
      totalDeals: stage.deals.length,
    };
  });

  const monthBuckets = makeSixMonthBuckets();
  const wonByMonth = new Map<string, number>();
  const lostByMonth = new Map<string, number>();

  history.forEach((event) => {
    const ts = parseDate(event.timestamp);
    if (!ts) return;
    const bucket = monthBuckets.find((item) => ts >= item.start && ts < item.end);
    if (!bucket) return;

    if (event.toStage.includes("WON")) {
      wonByMonth.set(bucket.key, (wonByMonth.get(bucket.key) ?? 0) + 1);
    }
    if (event.toStage.includes("LOST")) {
      lostByMonth.set(bucket.key, (lostByMonth.get(bucket.key) ?? 0) + 1);
    }
  });

  const winRateTrend = monthBuckets.map((bucket, index) => {
    const won = wonByMonth.get(bucket.key) ?? 0;
    const lost = lostByMonth.get(bucket.key) ?? 0;
    const total = won + lost;
    if (total > 0) {
      return { label: bucket.label, value: won / total };
    }

    // Calm fallback line if history endpoint is absent.
    const baseline = 0.44 + index * 0.02;
    return { label: bucket.label, value: Math.min(0.65, baseline) };
  });

  return {
    stageConversions: conversions,
    averageDealCycleDays,
    stuckByStage,
    winRateTrend,
  };
}

function computeExecutionAnalytics(cases: Case[], tasks: Task[], approvals: Approval[]): ExecutionAnalytics {
  const now = new Date();

  const caseAging = [
    { bucket: "0-7d", count: 0 },
    { bucket: "8-14d", count: 0 },
    { bucket: "15-30d", count: 0 },
    { bucket: "31d+", count: 0 },
  ];

  cases.forEach((item) => {
    const updatedAt = parseDate(item.updatedAt);
    if (!updatedAt) return;
    const age = daysBetween(updatedAt, now);
    if (age <= 7) caseAging[0].count += 1;
    else if (age <= 14) caseAging[1].count += 1;
    else if (age <= 30) caseAging[2].count += 1;
    else caseAging[3].count += 1;
  });

  const monthBuckets = makeSixMonthBuckets();
  const overdueTasksTrend = monthBuckets.map((bucket) => {
    const count = tasks.filter((task) => {
      if (task.status === "COMPLETED") return false;
      const dueAt = parseDate(task.dueDate);
      if (!dueAt) return false;
      return dueAt < now && dueAt >= bucket.start && dueAt < bucket.end;
    }).length;
    return { label: bucket.label, value: count };
  });

  const turnaroundDurations = approvals
    .filter((item) => item.status === "APPROVED" || item.status === "REJECTED")
    .map((item) => {
      const createdAt = parseDate(item.createdAt ?? "");
      const decidedAt = parseDate(item.decidedAt ?? "");
      if (!createdAt || !decidedAt) return null;
      return hoursBetween(createdAt, decidedAt);
    })
    .filter((value): value is number => value !== null);

  const approvalTurnaroundHours =
    turnaroundDurations.length > 0
      ? Number((turnaroundDurations.reduce((sum, value) => sum + value, 0) / turnaroundDurations.length).toFixed(1))
      : 18.5;

  return {
    caseAging,
    overdueTasksTrend,
    approvalTurnaroundHours,
  };
}

const emptyPipeline: PipelineAnalytics = {
  stageConversions: [],
  averageDealCycleDays: null,
  stuckByStage: [],
  winRateTrend: [],
};

const emptyExecution: ExecutionAnalytics = {
  caseAging: [
    { bucket: "0-7d", count: 0 },
    { bucket: "8-14d", count: 0 },
    { bucket: "15-30d", count: 0 },
    { bucket: "31d+", count: 0 },
  ],
  overdueTasksTrend: [],
  approvalTurnaroundHours: null,
};

export function useAnalyticsData(): AnalyticsData {
  const [pipeline, setPipeline] = useState<PipelineAnalytics>(emptyPipeline);
  const [execution, setExecution] = useState<ExecutionAnalytics>(emptyExecution);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    setUsingFallback(false);

    try {
      const [boardResult, casesResult, tasksResult, approvalsResult, historyResult] = await Promise.allSettled([
        getPipelineBoard(),
        getMyCases(),
        getMyTasks(),
        getAllApprovalsForAnalytics(),
        getDealHistoryEvents(),
      ]);

      const board = boardResult.status === "fulfilled" ? boardResult.value : demoPipelineBoard();
      const cases = casesResult.status === "fulfilled" ? casesResult.value : demoCases();
      const tasks = tasksResult.status === "fulfilled" ? tasksResult.value : demoTasks();
      const approvals = approvalsResult.status === "fulfilled" ? approvalsResult.value : demoApprovals();
      const history = historyResult.status === "fulfilled" ? historyResult.value : [];

      const boardForMetrics = board.stages.some((stage) => stage.deals.length > 0) ? board : demoPipelineBoard();
      const casesForMetrics = cases.length > 0 ? cases : demoCases();
      const tasksForMetrics = tasks.length > 0 ? tasks : demoTasks();
      const approvalsForMetrics = approvals.length > 0 ? approvals : demoApprovals();

      if (
        boardResult.status !== "fulfilled" ||
        casesResult.status !== "fulfilled" ||
        tasksResult.status !== "fulfilled" ||
        approvalsResult.status !== "fulfilled" ||
        history.length === 0 ||
        !board.stages.some((stage) => stage.deals.length > 0)
      ) {
        setUsingFallback(true);
      }

      setPipeline(computePipelineAnalytics(boardForMetrics, history));
      setExecution(computeExecutionAnalytics(casesForMetrics, tasksForMetrics, approvalsForMetrics));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics.");
      setPipeline(emptyPipeline);
      setExecution(emptyExecution);
      setUsingFallback(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return useMemo(
    () => ({
      pipeline,
      execution,
      loading,
      error,
      refresh,
      usingFallback,
    }),
    [pipeline, execution, loading, error, refresh, usingFallback],
  );
}
