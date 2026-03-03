import { Badge } from "@/components/ui/badge";

type StatusKind = "case" | "deal" | "task" | "approval" | "invoice" | "company";

type StatusPillProps = {
  kind: StatusKind;
  value: string;
};

type BadgeVariant = "muted" | "warning" | "success" | "danger";

const statusVariants: Record<StatusKind, Record<string, BadgeVariant>> = {
  case: {
    OPEN: "muted",
    IN_PROGRESS: "muted",
    WAITING: "warning",
    CLOSED: "success",
    CANCELLED: "danger",
  },
  deal: {
    OPEN: "muted",
    PROSPECT: "muted",
    QUALIFIED: "muted",
    PROPOSAL: "muted",
    NEGOTIATION: "warning",
    WON: "success",
    LOST: "danger",
    WON_LOST: "warning",
  },
  approval: {
    PENDING: "warning",
    APPROVED: "success",
    REJECTED: "danger",
  },
  task: {
    OPEN: "muted",
    COMPLETED: "success",
    OVERDUE: "danger",
  },
  invoice: {
    DRAFT: "muted",
    SENT: "warning",
    PAID: "success",
    OVERDUE: "danger",
  },
  company: {
    PROSPECT: "warning",
    ACTIVE: "muted",
    DORMANT: "muted",
    ARCHIVED: "danger",
  },
};

export function StatusPill({ kind, value }: StatusPillProps) {
  const normalized = value.toUpperCase().replaceAll(" ", "_");
  const variant = statusVariants[kind][normalized] ?? "muted";
  const label = normalized.replaceAll("_", " ");

  return <Badge variant={variant}>{label}</Badge>;
}
