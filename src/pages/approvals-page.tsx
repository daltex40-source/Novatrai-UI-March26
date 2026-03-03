import { useEffect, useState } from "react";
import { decideApproval, getMyApprovals } from "@/api/services";
import type { Approval } from "@/api/types";
import { StatusPill } from "@/components/shared/status-pill";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function ApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyApprovalId, setBusyApprovalId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        setApprovals(await getMyApprovals());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load approvals");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const decide = async (id: string, decision: "APPROVED" | "REJECTED") => {
    const previous = approvals;
    setBusyApprovalId(id);
    setError(null);
    setApprovals((current) => current.map((item) => (item.id === id ? { ...item, status: decision } : item)));
    try {
      await decideApproval(id, decision);
    } catch (err) {
      setApprovals(previous);
      setError(err instanceof Error ? err.message : "Failed to submit decision");
    } finally {
      setBusyApprovalId(null);
    }
  };

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-2xl font-semibold">Approvals</h2>
        <p className="text-sm text-muted-foreground">Pending decisions requiring explicit action.</p>
      </header>
      {error ? <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">{error}</p> : null}
      <div className="rounded-lg border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Request</th>
              <th className="px-4 py-3">Requester</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Decision</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={`approvals-skeleton-${index}`} className="border-b last:border-b-0">
                  <td className="px-4 py-3"><Skeleton className="h-4 w-56" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-6 w-24 rounded-full" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-8 w-36" /></td>
                </tr>
              ))
            ) : null}
            {!loading && approvals.length === 0 ? (
              <tr><td className="px-4 py-5 text-muted-foreground" colSpan={4}>No pending approvals right now.</td></tr>
            ) : null}
            {approvals.map((approval) => (
              <tr key={approval.id} className="border-b last:border-b-0">
                <td className="px-4 py-3 font-medium">{approval.title}</td>
                <td className="px-4 py-3">{approval.requester}</td>
                <td className="px-4 py-3"><StatusPill kind="approval" value={approval.status} /></td>
                <td className="flex gap-2 px-4 py-3">
                  <Button size="sm" variant="secondary" onClick={() => void decide(approval.id, "APPROVED")} disabled={busyApprovalId === approval.id || approval.status !== "PENDING"}>
                    {busyApprovalId === approval.id ? "Saving..." : "Approve"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => void decide(approval.id, "REJECTED")} disabled={busyApprovalId === approval.id || approval.status !== "PENDING"}>
                    Reject
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
