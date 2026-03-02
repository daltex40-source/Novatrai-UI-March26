import { useEffect, useState } from "react";
import { getMyDayData, type MyDayData } from "@/api/services";
import { StatusPill } from "@/components/shared/status-pill";

const emptyState: MyDayData = {
  overdueTasks: [],
  dueSoonTasks: [],
  pendingApprovals: [],
  activeCases: [],
};

export function MyDayPage() {
  const [data, setData] = useState<MyDayData>(emptyState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        setData(await getMyDayData());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load My Day");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-2xl font-semibold">My Day</h2>
        <p className="text-sm text-muted-foreground">Prioritized execution across tasks, approvals, and active cases.</p>
      </header>

      {error ? <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">{error}</p> : null}
      {loading ? <p className="rounded-md border bg-white px-3 py-2 text-sm text-muted-foreground">Loading your workday...</p> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-lg border bg-white p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Overdue Tasks</h3>
          <div className="mt-3 space-y-2 text-sm">
            {data.overdueTasks.length === 0 ? <p className="text-muted-foreground">No overdue tasks.</p> : null}
            {data.overdueTasks.map((task) => (
              <div key={task.id} className="rounded-md border p-3">
                <p className="font-medium">{task.title}</p>
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Due {task.dueDate || "Not set"}</p>
                  <StatusPill status={task.status} />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-lg border bg-white p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Pending Approvals</h3>
          <div className="mt-3 space-y-2 text-sm">
            {data.pendingApprovals.length === 0 ? <p className="text-muted-foreground">No pending approvals.</p> : null}
            {data.pendingApprovals.map((approval) => (
              <div key={approval.id} className="rounded-md border p-3">
                <p className="font-medium">{approval.title}</p>
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{approval.requester}</p>
                  <StatusPill status={approval.status} />
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>

      <article className="rounded-lg border bg-white p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Active Cases</h3>
        <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {data.activeCases.length === 0 ? <p className="text-sm text-muted-foreground">No active cases.</p> : null}
          {data.activeCases.map((item) => (
            <div key={item.id} className="rounded-md border p-3 text-sm">
              <p className="font-medium">{item.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.accountName}</p>
              <div className="mt-2">
                <StatusPill status={item.status} />
              </div>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
