import { useEffect, useState } from "react";
import { completeTask, getMyTasks } from "@/api/services";
import type { Task } from "@/api/types";
import { StatusPill } from "@/components/shared/status-pill";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        setTasks(await getMyTasks());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const onCompleteTask = async (id: string) => {
    const previous = tasks;
    setBusyTaskId(id);
    setError(null);
    setTasks((current) => current.map((task) => (task.id === id ? { ...task, status: "COMPLETED" } : task)));
    try {
      await completeTask(id);
    } catch (err) {
      setTasks(previous);
      setError(err instanceof Error ? err.message : "Failed to complete task");
    } finally {
      setBusyTaskId(null);
    }
  };

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-2xl font-semibold">Tasks</h2>
        <p className="text-sm text-muted-foreground">Execution queue with overdue visibility.</p>
      </header>
      {error ? <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">{error}</p> : null}
      <div className="rounded-lg border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Task</th>
              <th className="px-4 py-3">Due</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={`tasks-skeleton-${index}`} className="border-b last:border-b-0">
                  <td className="px-4 py-3"><Skeleton className="h-4 w-48" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-6 w-20 rounded-full" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-8 w-24" /></td>
                </tr>
              ))
            ) : null}
            {!loading && tasks.length === 0 ? (
              <tr><td className="px-4 py-5 text-muted-foreground" colSpan={4}>No tasks need attention right now.</td></tr>
            ) : null}
            {tasks.map((task) => (
              <tr key={task.id} className="border-b last:border-b-0">
                <td className="px-4 py-3 font-medium">{task.title}</td>
                <td className="px-4 py-3">{task.dueDate}</td>
                <td className="px-4 py-3"><StatusPill kind="task" value={task.status} /></td>
                <td className="px-4 py-3">
                  <Button size="sm" variant="secondary" onClick={() => void onCompleteTask(task.id)} disabled={task.status === "COMPLETED" || busyTaskId === task.id}>
                    {busyTaskId === task.id ? "Saving..." : "Complete"}
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
