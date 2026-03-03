import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalyticsData } from "@/hooks/use-analytics-data";

function formatPercent(value: number | null): string {
  if (value === null) return "N/A";
  return `${Math.round(value * 100)}%`;
}

function TrendBars({
  points,
  mode,
}: {
  points: Array<{ label: string; value: number }>;
  mode: "percent" | "count";
}) {
  if (points.length === 0) {
    return <p className="text-sm text-muted-foreground">No trend data available yet.</p>;
  }

  const maxValue = Math.max(1, ...points.map((point) => point.value));

  return (
    <div className="space-y-2">
      {points.map((point) => {
        const ratio = Math.max(0.08, point.value / maxValue);
        return (
          <div key={point.label} className="grid grid-cols-[50px_1fr_52px] items-center gap-3">
            <span className="text-xs text-muted-foreground">{point.label}</span>
            <div className="h-2.5 rounded-full bg-slate-100">
              <div className="h-2.5 rounded-full bg-slate-700 transition-all" style={{ width: `${ratio * 100}%` }} />
            </div>
            <span className="text-right text-xs text-muted-foreground">
              {mode === "percent" ? `${Math.round(point.value * 100)}%` : point.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function AnalyticsPage() {
  const { pipeline, execution, loading, error, refresh, usingFallback } = useAnalyticsData();

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Analytics</h2>
          <p className="text-sm text-muted-foreground">Read-only operational intelligence across revenue and execution.</p>
        </div>
        <div className="flex items-center gap-2">
          {usingFallback ? <Badge variant="muted">Partial data mode</Badge> : null}
          <Button size="sm" variant="secondary" onClick={() => void refresh()}>
            Refresh
          </Button>
        </div>
      </header>

      {error ? <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">{error}</p> : null}

      <Tabs defaultValue="pipeline">
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline Analytics</TabsTrigger>
          <TabsTrigger value="execution">Execution Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline">
          <div className="mt-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <article className="rounded-lg border bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Average Deal Cycle</p>
                <p className="mt-2 text-2xl font-semibold">
                  {loading ? <Skeleton className="h-8 w-20" /> : pipeline.averageDealCycleDays === null ? "N/A" : `${pipeline.averageDealCycleDays}d`}
                </p>
              </article>
              <article className="rounded-lg border bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Stuck Deals (&gt;14d)</p>
                <p className="mt-2 text-2xl font-semibold">
                  {loading ? (
                    <Skeleton className="h-8 w-12" />
                  ) : (
                    pipeline.stuckByStage.reduce((sum, row) => sum + row.stuckDeals, 0)
                  )}
                </p>
              </article>
              <article className="rounded-lg border bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Latest Win Rate</p>
                <p className="mt-2 text-2xl font-semibold">
                  {loading ? (
                    <Skeleton className="h-8 w-14" />
                  ) : (
                    formatPercent(pipeline.winRateTrend[pipeline.winRateTrend.length - 1]?.value ?? null)
                  )}
                </p>
              </article>
            </div>

            <article className="rounded-lg border bg-white p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Stage Conversion</h3>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-2 py-2">From</th>
                      <th className="px-2 py-2">To</th>
                      <th className="px-2 py-2">Conversion</th>
                      <th className="px-2 py-2">Volumes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading
                      ? Array.from({ length: 4 }).map((_, index) => (
                          <tr key={`conv-skeleton-${index}`} className="border-b last:border-b-0">
                            <td className="px-2 py-3"><Skeleton className="h-4 w-20" /></td>
                            <td className="px-2 py-3"><Skeleton className="h-4 w-20" /></td>
                            <td className="px-2 py-3"><Skeleton className="h-4 w-14" /></td>
                            <td className="px-2 py-3"><Skeleton className="h-4 w-16" /></td>
                          </tr>
                        ))
                      : null}
                    {!loading && pipeline.stageConversions.length === 0 ? (
                      <tr>
                        <td className="px-2 py-4 text-muted-foreground" colSpan={4}>No stage conversion data yet.</td>
                      </tr>
                    ) : null}
                    {pipeline.stageConversions.map((row) => (
                      <tr key={`${row.from}-${row.to}`} className="border-b last:border-b-0">
                        <td className="px-2 py-3">{row.from}</td>
                        <td className="px-2 py-3">{row.to}</td>
                        <td className="px-2 py-3">{row.rate === null ? "N/A" : `${Math.round(row.rate * 100)}%`}</td>
                        <td className="px-2 py-3 text-muted-foreground">{row.fromCount} → {row.toCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <div className="grid gap-4 lg:grid-cols-2">
              <article className="rounded-lg border bg-white p-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Deals Stuck Per Stage</h3>
                <div className="mt-3 space-y-2">
                  {loading
                    ? Array.from({ length: 4 }).map((_, index) => <Skeleton key={`stuck-skeleton-${index}`} className="h-8 w-full" />)
                    : null}
                  {!loading && pipeline.stuckByStage.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No stage data available.</p>
                  ) : null}
                  {pipeline.stuckByStage.map((row) => (
                    <div key={row.stage} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                      <span>{row.stage}</span>
                      <span className="text-muted-foreground">{row.stuckDeals} / {row.totalDeals}</span>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-lg border bg-white p-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Win Rate Trend</h3>
                <div className="mt-3">
                  {loading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 6 }).map((_, index) => <Skeleton key={`win-skeleton-${index}`} className="h-6 w-full" />)}
                    </div>
                  ) : (
                    <TrendBars points={pipeline.winRateTrend} mode="percent" />
                  )}
                </div>
              </article>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="execution">
          <div className="mt-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <article className="rounded-lg border bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Cases In Flight</p>
                <p className="mt-2 text-2xl font-semibold">
                  {loading ? <Skeleton className="h-8 w-12" /> : execution.caseAging.reduce((sum, row) => sum + row.count, 0)}
                </p>
              </article>
              <article className="rounded-lg border bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Overdue Tasks (6m)</p>
                <p className="mt-2 text-2xl font-semibold">
                  {loading ? (
                    <Skeleton className="h-8 w-14" />
                  ) : (
                    execution.overdueTasksTrend.reduce((sum, row) => sum + row.value, 0)
                  )}
                </p>
              </article>
              <article className="rounded-lg border bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Approval Turnaround</p>
                <p className="mt-2 text-2xl font-semibold">
                  {loading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : execution.approvalTurnaroundHours === null ? "N/A" : `${execution.approvalTurnaroundHours}h`}
                </p>
              </article>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <article className="rounded-lg border bg-white p-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Case Aging Distribution</h3>
                <div className="mt-3 space-y-2">
                  {loading
                    ? Array.from({ length: 4 }).map((_, index) => <Skeleton key={`age-skeleton-${index}`} className="h-8 w-full" />)
                    : null}
                  {!loading && execution.caseAging.every((row) => row.count === 0) ? (
                    <p className="text-sm text-muted-foreground">No case aging data available.</p>
                  ) : null}
                  {execution.caseAging.map((row) => (
                    <div key={row.bucket} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                      <span>{row.bucket}</span>
                      <span className="font-medium">{row.count}</span>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-lg border bg-white p-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Tasks Overdue Trend</h3>
                <div className="mt-3">
                  {loading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 6 }).map((_, index) => <Skeleton key={`task-skeleton-${index}`} className="h-6 w-full" />)}
                    </div>
                  ) : (
                    <TrendBars points={execution.overdueTasksTrend} mode="count" />
                  )}
                </div>
              </article>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
