import { AlertTriangle, Clock3 } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function toDate(value?: string | null): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function getAgeDays(value?: string | null): number | null {
  const date = toDate(value);
  if (!date) return null;
  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) return 0;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function getDealHeatClass(opts: { atRisk?: boolean; ageDays?: number | null }) {
  if (opts.atRisk || (opts.ageDays ?? 0) > 21) {
    return "border-rose-200 bg-rose-50/50";
  }
  if ((opts.ageDays ?? 0) > 10) {
    return "border-amber-200 bg-amber-50/50";
  }
  return "border-slate-200 bg-white";
}

export function StuckBadge({ since, thresholdDays = 14 }: { since?: string | null; thresholdDays?: number }) {
  const ageDays = getAgeDays(since);
  if (ageDays === null || ageDays <= thresholdDays) return null;
  const variant = ageDays > thresholdDays + 14 ? "danger" : "warning";
  return (
    <Badge variant={variant} className="gap-1">
      <Clock3 className="h-3 w-3" />
      Stuck {ageDays}d
    </Badge>
  );
}

export function SlaCountdownChip({ dueAt }: { dueAt?: string | null }) {
  const due = toDate(dueAt);
  if (!due) return null;

  const diffMs = due.getTime() - Date.now();
  const absHours = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60));
  const absDays = Math.floor(absHours / 24);

  if (diffMs < 0) {
    return <Badge variant="danger">SLA overdue {absDays}d</Badge>;
  }
  if (absHours <= 24) {
    return <Badge variant="warning">SLA {absHours}h</Badge>;
  }
  return <Badge variant="muted">SLA {absDays}d</Badge>;
}

export function NeedsAttentionFlag({ show, label = "Needs attention" }: { show: boolean; label?: string }) {
  if (!show) return null;
  return (
    <Badge variant="warning" className="gap-1">
      <AlertTriangle className="h-3 w-3" />
      {label}
    </Badge>
  );
}

export function PriorityEscalationCue({ level }: { level?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | string | null }) {
  const normalized = (level || "").toUpperCase();
  if (normalized === "URGENT") return <Badge variant="danger">Escalated</Badge>;
  if (normalized === "HIGH") return <Badge variant="warning">Priority High</Badge>;
  return null;
}

export function SignalStack({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex flex-wrap items-center gap-1.5", className)}>{children}</div>;
}
