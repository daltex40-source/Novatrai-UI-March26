import { useCallback, useEffect, useMemo, useState } from "react";
import { getInvoices, getMyApprovals, getMyTasks, getPipelineBoard, type DealCard } from "@/api/services";

type InboxApproval = {
  id: string;
  title: string;
  context: string;
  age: string;
  caseId: string | null;
};

type InboxTask = {
  id: string;
  title: string;
  context: string;
  age: string;
  caseId: string | null;
};

type InboxDeal = {
  id: string;
  title: string;
  context: string;
  age: string;
};

type InboxInvoice = {
  id: string;
  title: string;
  context: string;
  age: string;
};

type CategoryError = {
  approvals?: string;
  tasks?: string;
  deals?: string;
  finance?: string;
};

export type HQInboxData = {
  approvals: InboxApproval[];
  overdueTasks: InboxTask[];
  atRiskDeals: InboxDeal[];
  overdueInvoices: InboxInvoice[];
  counts: {
    approvals: number;
    tasks: number;
    deals: number;
    finance: number;
    total: number;
  };
  loading: boolean;
  error: CategoryError | null;
  refresh: () => Promise<void>;
};

type UseHQInboxDataOptions = {
  pollWhileOpen?: boolean;
};

const MAX_ITEMS = 20;
const POLL_MS = 60_000;

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const next = new Date(value);
  return Number.isNaN(next.getTime()) ? null : next;
}

function formatAge(from: Date | null): string {
  if (!from) return "-";
  const diffMs = Date.now() - from.getTime();
  if (diffMs <= 0) return "now";
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function isOverdue(dueDate: string, status: string): boolean {
  const due = parseDate(dueDate);
  if (!due) return false;
  const normalized = status.toUpperCase();
  if (normalized === "COMPLETED" || normalized === "PAID" || normalized === "CLOSED") return false;
  return due.getTime() < Date.now();
}

function isDealAtRisk(deal: DealCard): boolean {
  return deal.atRisk;
}

export function useHQInboxData(options: UseHQInboxDataOptions = {}): HQInboxData {
  const [approvals, setApprovals] = useState<InboxApproval[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<InboxTask[]>([]);
  const [atRiskDeals, setAtRiskDeals] = useState<InboxDeal[]>([]);
  const [overdueInvoices, setOverdueInvoices] = useState<InboxInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<CategoryError | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const nextError: CategoryError = {};

    const [approvalsResult, tasksResult, boardResult, invoicesResult] = await Promise.allSettled([
      getMyApprovals(),
      getMyTasks(),
      getPipelineBoard(),
      getInvoices(),
    ]);

    if (approvalsResult.status === "fulfilled") {
      const nextApprovals = approvalsResult.value
        .filter((item) => item.status === "PENDING")
        .slice(0, MAX_ITEMS)
        .map((item) => ({
          id: item.id,
          title: item.title,
          context: item.caseNumber ? `Case ${item.caseNumber}` : item.requester,
          age: formatAge(parseDate(item.createdAt)),
          caseId: item.caseId ?? null,
        }));
      setApprovals(nextApprovals);
    } else {
      setApprovals([]);
      nextError.approvals = "Approvals not available right now.";
    }

    if (tasksResult.status === "fulfilled") {
      const nextTasks = tasksResult.value
        .filter((item) => isOverdue(item.dueDate, item.status))
        .slice(0, MAX_ITEMS)
        .map((item) => ({
          id: item.id,
          title: item.title,
          context: item.caseNumber ? `Case ${item.caseNumber}` : "General task",
          age: formatAge(parseDate(item.dueDate)),
          caseId: item.caseId ?? null,
        }));
      setOverdueTasks(nextTasks);
    } else {
      setOverdueTasks([]);
      nextError.tasks = "Tasks not available right now.";
    }

    if (boardResult.status === "fulfilled") {
      const nextDeals = boardResult.value.stages
        .flatMap((stage) => stage.deals)
        .filter((deal) => isDealAtRisk(deal))
        .slice(0, MAX_ITEMS)
        .map((deal) => ({
          id: deal.id,
          title: deal.title,
          context: deal.companyName || "Pipeline deal",
          age: "-",
        }));
      setAtRiskDeals(nextDeals);
    } else {
      setAtRiskDeals([]);
      nextError.deals = "Pipeline risk data not available.";
    }

    if (invoicesResult.status === "fulfilled") {
      const nextInvoices = invoicesResult.value
        .filter((invoice) => isOverdue(invoice.dueDate, invoice.status))
        .slice(0, MAX_ITEMS)
        .map((invoice) => ({
          id: invoice.id,
          title: invoice.invoiceNumber,
          context: invoice.client,
          age: formatAge(parseDate(invoice.dueDate)),
        }));
      setOverdueInvoices(nextInvoices);
    } else {
      setOverdueInvoices([]);
      nextError.finance = "Finance data not available.";
    }

    setError(Object.keys(nextError).length > 0 ? nextError : null);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!options.pollWhileOpen) return;
    const timer = window.setInterval(() => {
      void refresh();
    }, POLL_MS);
    return () => {
      window.clearInterval(timer);
    };
  }, [options.pollWhileOpen, refresh]);

  const counts = useMemo(() => {
    const next = {
      approvals: approvals.length,
      tasks: overdueTasks.length,
      deals: atRiskDeals.length,
      finance: overdueInvoices.length,
      total: approvals.length + overdueTasks.length + atRiskDeals.length + overdueInvoices.length,
    };
    return next;
  }, [approvals.length, overdueTasks.length, atRiskDeals.length, overdueInvoices.length]);

  return {
    approvals,
    overdueTasks,
    atRiskDeals,
    overdueInvoices,
    counts,
    loading,
    error,
    refresh,
  };
}
