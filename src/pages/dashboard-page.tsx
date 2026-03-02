import { useEffect, useState } from "react";
import { getMyDayData } from "@/api/services";

type DashboardKpis = {
  activeCases: number;
  pendingApprovals: number;
  overdueTasks: number;
  dueSoonTasks: number;
};

const emptyKpis: DashboardKpis = {
  activeCases: 0,
  pendingApprovals: 0,
  overdueTasks: 0,
  dueSoonTasks: 0,
};

export function DashboardPage() {
  const [kpis, setKpis] = useState<DashboardKpis>(emptyKpis);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getMyDayData();
        setKpis({
          activeCases: data.activeCases.length,
          pendingApprovals: data.pendingApprovals.length,
          overdueTasks: data.overdueTasks.length,
          dueSoonTasks: data.dueSoonTasks.length,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <p className="text-sm text-muted-foreground">Operating summary across lifecycle-critical queues.</p>
      </header>

      {error ? <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">{error}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Active Cases</p>
          <p className="mt-2 text-3xl font-semibold">{loading ? "-" : kpis.activeCases}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Pending Approvals</p>
          <p className="mt-2 text-3xl font-semibold">{loading ? "-" : kpis.pendingApprovals}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Overdue Tasks</p>
          <p className="mt-2 text-3xl font-semibold">{loading ? "-" : kpis.overdueTasks}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Tasks Due Soon</p>
          <p className="mt-2 text-3xl font-semibold">{loading ? "-" : kpis.dueSoonTasks}</p>
        </div>
      </div>
    </section>
  );
}
