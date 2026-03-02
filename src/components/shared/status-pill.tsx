import { Badge } from "@/components/ui/badge";

const statusMap: Record<string, "muted" | "warning" | "success" | "danger"> = {
  OPEN: "muted",
  IN_PROGRESS: "muted",
  QUALIFIED: "muted",
  PROPOSAL: "muted",
  NEGOTIATION: "warning",
  WAITING: "warning",
  RISK: "warning",
  DRAFT: "muted",
  SENT: "warning",
  COMPLETED: "success",
  WON: "success",
  APPROVED: "success",
  PAID: "success",
  CLOSED: "success",
  LOST: "danger",
  REJECTED: "danger",
  OVERDUE: "danger",
  CANCELLED: "danger",
};

type StatusPillProps = {
  status: string;
};

export function StatusPill({ status }: StatusPillProps) {
  const normalized = status.toUpperCase();
  const variant = statusMap[normalized] ?? "muted";
  const label = normalized.replaceAll("_", " ");

  return <Badge variant={variant}>{label}</Badge>;
}
