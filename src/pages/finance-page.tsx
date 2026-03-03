import { useEffect, useState } from "react";
import { getInvoices, type Invoice } from "@/api/services";
import { StatusPill } from "@/components/shared/status-pill";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type FinanceSection = "invoices" | "payments" | "ledger";

export function FinancePage() {
  const [section, setSection] = useState<FinanceSection>("invoices");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        setInvoices(await getInvoices());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load invoices");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-2xl font-semibold">Finance</h2>
        <p className="text-sm text-muted-foreground">Institutional financial control with invoice lifecycle visibility.</p>
      </header>

      {error ? <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">{error}</p> : null}

      <div className="flex gap-2">
        <Button variant={section === "invoices" ? "default" : "secondary"} size="sm" onClick={() => setSection("invoices")}>Invoices</Button>
        <Button variant={section === "payments" ? "default" : "secondary"} size="sm" onClick={() => setSection("payments")}>Payments</Button>
        <Button variant={section === "ledger" ? "default" : "secondary"} size="sm" onClick={() => setSection("ledger")}>Ledger</Button>
      </div>

      {section === "invoices" ? (
        <div className="rounded-lg border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, index) => (
                    <tr key={`invoices-skeleton-${index}`} className="border-b last:border-b-0">
                      <td className="px-4 py-3"><Skeleton className="h-4 w-28" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-40" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-28" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-6 w-20 rounded-full" /></td>
                    </tr>
                  ))
                : null}
              {!loading && invoices.length === 0 ? <tr><td className="px-4 py-5 text-muted-foreground" colSpan={5}>No invoices pending right now.</td></tr> : null}
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b last:border-b-0">
                  <td className="px-4 py-3 font-medium">{invoice.invoiceNumber}</td>
                  <td className="px-4 py-3">{invoice.client}</td>
                  <td className="px-4 py-3">{invoice.currency} {invoice.amount.toLocaleString()}</td>
                  <td className="px-4 py-3">{invoice.dueDate}</td>
                  <td className="px-4 py-3"><StatusPill kind="invoice" value={invoice.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {section === "payments" ? (
        <div className="rounded-lg border bg-white p-4 text-sm">
          <h3 className="font-semibold">Payments (UI-only)</h3>
          <p className="mt-2 text-muted-foreground">Payment posting and reconciliation workflows will be integrated in the next finance pass.</p>
        </div>
      ) : null}

      {section === "ledger" ? (
        <div className="rounded-lg border bg-white p-4 text-sm">
          <h3 className="font-semibold">Ledger (UI-only)</h3>
          <p className="mt-2 text-muted-foreground">Ledger summary and journal drill-down are reserved for the upcoming implementation phase.</p>
        </div>
      ) : null}
    </section>
  );
}
