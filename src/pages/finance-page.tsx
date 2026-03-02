import { useEffect, useMemo, useState } from "react";
import {
  getInvoices,
  linkInvoiceToCase,
  updateInvoiceStatus,
  type Invoice,
} from "@/api/services";
import { ObjectDrawer } from "@/components/shared/object-drawer";
import { StatusPill } from "@/components/shared/status-pill";
import { Button } from "@/components/ui/button";

const invoiceLifecycle: Invoice["status"][] = ["DRAFT", "SENT", "PAID"];

type FinanceSection = "invoices" | "payments" | "ledger";

export function FinancePage() {
  const [section, setSection] = useState<FinanceSection>("invoices");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [busyInvoiceId, setBusyInvoiceId] = useState<string | null>(null);
  const [linkCaseId, setLinkCaseId] = useState("");

  const selectedInvoice = useMemo(
    () => invoices.find((invoice) => invoice.id === selectedInvoiceId) ?? null,
    [invoices, selectedInvoiceId],
  );

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

  useEffect(() => {
    if (selectedInvoice?.linkedCaseId) {
      setLinkCaseId(selectedInvoice.linkedCaseId);
      return;
    }
    setLinkCaseId("");
  }, [selectedInvoice]);

  const advanceStatus = async () => {
    if (!selectedInvoice) return;

    const currentIndex = invoiceLifecycle.findIndex((status) => status === selectedInvoice.status);
    if (currentIndex < 0 || currentIndex >= invoiceLifecycle.length - 1) return;

    const nextStatus = invoiceLifecycle[currentIndex + 1];
    const previous = invoices;

    setBusyInvoiceId(selectedInvoice.id);
    setError(null);
    setInvoices((current) =>
      current.map((invoice) =>
        invoice.id === selectedInvoice.id
          ? {
              ...invoice,
              status: nextStatus,
            }
          : invoice,
      ),
    );

    try {
      await updateInvoiceStatus(selectedInvoice.id, nextStatus);
    } catch (err) {
      setInvoices(previous);
      setError(err instanceof Error ? err.message : "Failed to update invoice status");
    } finally {
      setBusyInvoiceId(null);
    }
  };

  const linkToCase = async () => {
    if (!selectedInvoice || !linkCaseId.trim()) return;

    const previous = invoices;
    setBusyInvoiceId(selectedInvoice.id);
    setError(null);

    setInvoices((current) =>
      current.map((invoice) =>
        invoice.id === selectedInvoice.id
          ? {
              ...invoice,
              linkedCaseId: linkCaseId.trim(),
              linkedCaseNumber: linkCaseId.trim(),
            }
          : invoice,
      ),
    );

    try {
      await linkInvoiceToCase(selectedInvoice.id, linkCaseId.trim());
    } catch (err) {
      setInvoices(previous);
      setError(err instanceof Error ? err.message : "Failed to link invoice to case");
    } finally {
      setBusyInvoiceId(null);
    }
  };

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
              {loading ? (
                <tr>
                  <td className="px-4 py-5 text-muted-foreground" colSpan={5}>
                    Loading invoices...
                  </td>
                </tr>
              ) : null}
              {!loading && invoices.length === 0 ? (
                <tr>
                  <td className="px-4 py-5 text-muted-foreground" colSpan={5}>
                    No invoices found.
                  </td>
                </tr>
              ) : null}
              {invoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="cursor-pointer border-b last:border-b-0 hover:bg-slate-50"
                  onClick={() => setSelectedInvoiceId(invoice.id)}
                >
                  <td className="px-4 py-3 font-medium">{invoice.invoiceNumber}</td>
                  <td className="px-4 py-3">{invoice.client}</td>
                  <td className="px-4 py-3">{invoice.currency} {invoice.amount.toLocaleString()}</td>
                  <td className="px-4 py-3">{invoice.dueDate}</td>
                  <td className="px-4 py-3"><StatusPill status={invoice.status} /></td>
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

      <ObjectDrawer
        open={Boolean(selectedInvoice)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedInvoiceId(null);
            setLinkCaseId("");
          }
        }}
        title={selectedInvoice ? `${selectedInvoice.invoiceNumber} - ${selectedInvoice.client}` : "Invoice"}
        status={selectedInvoice?.status ?? "DRAFT"}
        lifecycleSteps={invoiceLifecycle}
        currentStatus={selectedInvoice?.status === "OVERDUE" ? "SENT" : selectedInvoice?.status ?? "DRAFT"}
        primaryAction={
          <Button
            size="sm"
            disabled={!selectedInvoice || busyInvoiceId === selectedInvoice.id || selectedInvoice.status === "PAID"}
            onClick={() => void advanceStatus()}
          >
            {busyInvoiceId === selectedInvoice?.id ? "Saving..." : "Advance Status"}
          </Button>
        }
        overview={
          <div className="space-y-3 text-sm">
            <p><span className="font-medium">Invoice Number:</span> {selectedInvoice?.invoiceNumber}</p>
            <p><span className="font-medium">Client:</span> {selectedInvoice?.client}</p>
            <p>
              <span className="font-medium">Amount:</span>{" "}
              {selectedInvoice ? `${selectedInvoice.currency} ${selectedInvoice.amount.toLocaleString()}` : "-"}
            </p>
            <p><span className="font-medium">Due Date:</span> {selectedInvoice?.dueDate}</p>
            <p><span className="font-medium">Notes:</span> {selectedInvoice?.notes || "No notes"}</p>
          </div>
        }
        timeline={
          <div className="space-y-2 text-sm">
            <p className="rounded-md border p-3">Invoice created and stored in UI-only finance module.</p>
            {selectedInvoice?.status !== "DRAFT" ? <p className="rounded-md border p-3">Invoice moved to {selectedInvoice?.status}.</p> : null}
          </div>
        }
        linked={
          <div className="space-y-3 text-sm">
            <p>
              <span className="font-medium">Linked Case:</span>{" "}
              {selectedInvoice?.linkedCaseNumber || "Not linked"}
            </p>
            <div className="space-y-2">
              <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground" htmlFor="finance-link-case">
                Case ID to link
              </label>
              <input
                id="finance-link-case"
                className="w-full rounded-md border px-3 py-2"
                value={linkCaseId}
                onChange={(event) => setLinkCaseId(event.target.value)}
                placeholder="CASE-3011"
              />
            </div>
            <Button
              size="sm"
              variant="secondary"
              disabled={!selectedInvoice || busyInvoiceId === selectedInvoice.id || !linkCaseId.trim()}
              onClick={() => void linkToCase()}
            >
              {busyInvoiceId === selectedInvoice?.id ? "Linking..." : "Link via DocumentInstance"}
            </Button>
          </div>
        }
        financial={
          <div className="space-y-2 text-sm">
            <p className="rounded-md border p-3">
              Subtotal: {selectedInvoice ? `${selectedInvoice.currency} ${selectedInvoice.amount.toLocaleString()}` : "-"}
            </p>
            <p className="rounded-md border p-3">Tax: Included in source total</p>
            <p className="rounded-md border p-3">
              Balance Due: {selectedInvoice ? `${selectedInvoice.currency} ${selectedInvoice.amount.toLocaleString()}` : "-"}
            </p>
          </div>
        }
      />
    </section>
  );
}
