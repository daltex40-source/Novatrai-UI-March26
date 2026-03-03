import { useEffect, useState } from "react";
import { getDashboardSummaryKpis, type DashboardSummaryKpis } from "@/api/services";

const emptyKpis: DashboardSummaryKpis = {
  pipelineValue: 0,
  openDeals: 0,
  winRate: null,
  atRiskDeals: 0,
  cashAvailable: null,
  netPosition: null,
  revenueMtd: null,
  overdueInvoices: 0,
};

function formatMoney(value: number | null) {
  if (value === null) return "-";
  return `ZAR ${value.toLocaleString()}`;
}

export function DashboardPage() {
  const [kpis, setKpis] = useState<DashboardSummaryKpis>(emptyKpis);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        setKpis(await getDashboardSummaryKpis());
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
        <p className="text-sm text-muted-foreground">Cross-layer operating visibility for revenue, execution, governance, and capital.</p>
      </header>

      {error ? <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">{error}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Pipeline Value</p>
          <p className="mt-2 text-3xl font-semibold">{loading ? "-" : formatMoney(kpis.pipelineValue)}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Open Deals</p>
          <p className="mt-2 text-3xl font-semibold">{loading ? "-" : kpis.openDeals}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Win Rate</p>
          <p className="mt-2 text-3xl font-semibold">{loading ? "-" : kpis.winRate === null ? "-" : `${(kpis.winRate * 100).toFixed(0)}%`}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">At-Risk Deals</p>
          <p className="mt-2 text-3xl font-semibold">{loading ? "-" : kpis.atRiskDeals}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Cash Available</p>
          <p className="mt-2 text-3xl font-semibold">{loading ? "-" : formatMoney(kpis.cashAvailable)}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Net Position</p>
          <p className="mt-2 text-3xl font-semibold">{loading ? "-" : formatMoney(kpis.netPosition)}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Revenue MTD</p>
          <p className="mt-2 text-3xl font-semibold">{loading ? "-" : formatMoney(kpis.revenueMtd)}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Overdue Invoices</p>
          <p className="mt-2 text-3xl font-semibold">{loading ? "-" : kpis.overdueInvoices}</p>
        </div>
      </div>
    </section>
  );
}
