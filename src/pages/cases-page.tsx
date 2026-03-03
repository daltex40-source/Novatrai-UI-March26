import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getMyCases } from "@/api/services";
import type { Case } from "@/api/types";
import { useObjectDrawers } from "@/components/layout/object-drawer-provider";
import { NeedsAttentionFlag, SignalStack, StuckBadge } from "@/components/shared/operational-signals";
import { StatusPill } from "@/components/shared/status-pill";
import { Skeleton } from "@/components/ui/skeleton";

export function CasesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { openCase } = useObjectDrawers();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        setCases(await getMyCases());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load cases");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  useEffect(() => {
    const openCaseId = searchParams.get("caseId");
    if (!openCaseId || cases.length === 0) return;
    const exists = cases.some((item) => item.id === openCaseId);
    if (!exists) return;

    openCase(openCaseId);
    searchParams.delete("caseId");
    setSearchParams(searchParams, { replace: true });
  }, [cases, openCase, searchParams, setSearchParams]);

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-2xl font-semibold">Cases</h2>
        <p className="text-sm text-muted-foreground">Lifecycle visibility across active service work.</p>
      </header>

      {error ? <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">{error}</p> : null}

      <div className="rounded-lg border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Case</th>
              <th className="px-4 py-3">Account</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Signals</th>
              <th className="px-4 py-3">Updated</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={`cases-skeleton-${index}`} className="border-b last:border-b-0">
                  <td className="px-4 py-3"><Skeleton className="h-4 w-48" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-36" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-6 w-24 rounded-full" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-40" /></td>
                </tr>
              ))
            ) : null}
            {!loading && cases.length === 0 ? (
              <tr>
                <td className="px-4 py-5 text-muted-foreground" colSpan={5}>No active cases to review right now.</td>
              </tr>
            ) : null}
            {cases.map((item) => (
              <tr
                key={item.id}
                className="cursor-pointer border-b last:border-b-0 hover:bg-slate-50"
                onClick={() => openCase(item.id)}
              >
                <td className="px-4 py-3 font-medium">{item.title}</td>
                <td className="px-4 py-3">{item.accountName}</td>
                <td className="px-4 py-3"><StatusPill kind="case" value={item.status} /></td>
                <td className="px-4 py-3">
                  <SignalStack>
                    <StuckBadge since={item.updatedAt} thresholdDays={14} />
                    <NeedsAttentionFlag show={item.status === "WAITING"} label="Waiting block" />
                  </SignalStack>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(item.updatedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
