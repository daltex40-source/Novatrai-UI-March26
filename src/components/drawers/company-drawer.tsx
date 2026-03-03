import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  addCompanyContact,
  createPerson,
  getCompanyById,
  getCompanyContacts,
  getCompanyLinks,
  getCompanyTimeline,
  linkCompanyPerson,
  type Company,
  type CompanyContact,
  type CompanyLinkedItem,
  type CompanyTimelineItem,
} from "@/api/companies";
import { useObjectDrawers } from "@/components/layout/object-drawer-provider";
import { LifecycleBanner } from "@/components/shared/lifecycle-banner";
import { ObjectDrawer } from "@/components/shared/object-drawer";
import { StatusPill } from "@/components/shared/status-pill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { dispatchOpenCreate } from "@/lib/global-create-events";

const companyLifecycle = [
  { key: "PROSPECT", label: "Prospect" },
  { key: "ACTIVE", label: "Active" },
  { key: "DORMANT", label: "Dormant" },
  { key: "ARCHIVED", label: "Archived" },
];

export function CompanyDrawer() {
  const navigate = useNavigate();
  const { companyId, closeCompany, openCase, openDeal } = useObjectDrawers();
  const [company, setCompany] = useState<Company | null>(null);
  const [contacts, setContacts] = useState<CompanyContact[]>([]);
  const [timeline, setTimeline] = useState<CompanyTimelineItem[]>([]);
  const [linked, setLinked] = useState<CompanyLinkedItem[]>([]);
  const [contactsWired, setContactsWired] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [createPersonOpen, setCreatePersonOpen] = useState(false);
  const [personName, setPersonName] = useState("");
  const [personEmail, setPersonEmail] = useState("");
  const [personPhone, setPersonPhone] = useState("");
  const [busy, setBusy] = useState(false);

  const activeStatus = company?.status ?? "PROSPECT";
  const doneKeys = useMemo(() => {
    const index = companyLifecycle.findIndex((item) => item.key === activeStatus);
    if (index < 0) return [] as string[];
    return companyLifecycle.slice(0, index).map((item) => item.key);
  }, [activeStatus]);

  const load = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const [detail, companyTimeline, companyLinks, companyContacts] = await Promise.all([
        getCompanyById(id),
        getCompanyTimeline(id),
        getCompanyLinks(id),
        getCompanyContacts(id),
      ]);
      setCompany(detail);
      setTimeline(companyTimeline);
      setLinked(companyLinks);
      setContacts(companyContacts.contacts);
      setContactsWired(companyContacts.wired);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load company");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!companyId) {
      setCompany(null);
      setContacts([]);
      setTimeline([]);
      setLinked([]);
      setError(null);
      return;
    }
    void load(companyId);
  }, [companyId]);

  const createPersonAndLink = async () => {
    if (!companyId || !personName.trim()) return;
    setBusy(true);
    try {
      const person = await createPerson({
        name: personName.trim(),
        email: personEmail.trim(),
        phone: personPhone.trim(),
      });
      let linkedToCompany = await addCompanyContact(companyId, person.id);
      if (!linkedToCompany) {
        linkedToCompany = await linkCompanyPerson(companyId, person.id);
      }
      if (!linkedToCompany) {
        toast("Not wired yet", { description: "Person created, but link endpoint is not available yet." });
      } else {
        toast.success("Contact added");
      }
      setCreatePersonOpen(false);
      setPersonName("");
      setPersonEmail("");
      setPersonPhone("");
      await load(companyId);
    } catch {
      toast("Not wired yet", { description: "Person creation endpoint is not available in this environment." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <ObjectDrawer
        open={Boolean(companyId)}
        onOpenChange={(open) => {
          if (!open) closeCompany();
        }}
        title={company?.name ?? "Company"}
        subtitle={company?.id}
        statusNode={<StatusPill kind="company" value={company?.status ?? "PROSPECT"} />}
        lifecycleNode={<LifecycleBanner steps={companyLifecycle} activeKey={activeStatus} doneKeys={doneKeys} />}
        primaryAction={
          activeStatus === "PROSPECT" ? (
            <Button
              size="sm"
              onClick={() =>
                dispatchOpenCreate({
                  type: "deal",
                  company: { id: company?.id, name: company?.name ?? "" },
                })
              }
            >
              Create Deal
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() =>
                dispatchOpenCreate({
                  type: "case",
                  company: { id: company?.id, name: company?.name ?? "" },
                })
              }
            >
              New Case
            </Button>
          )
        }
        secondaryActions={
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              dispatchOpenCreate({
                type: "invoice",
                company: { id: company?.id, name: company?.name ?? "" },
              })
            }
          >
            Create Invoice Draft
          </Button>
        }
        tabLabels={{ timeline: "Contacts", linked: "Timeline", activity: "Linked" }}
        overview={
          <div className="space-y-4 text-sm">
            {loading ? <p className="text-muted-foreground">Loading company...</p> : null}
            {error ? (
              <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-900">
                <p>{error}</p>
                {companyId ? (
                  <Button className="mt-2" size="sm" variant="secondary" onClick={() => void load(companyId)}>
                    Retry
                  </Button>
                ) : null}
              </div>
            ) : null}
            {!loading && company ? (
              <>
                <div className="rounded-lg border bg-white p-4 shadow-sm">
                  <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                    <p><span className="font-medium text-muted-foreground">Legal Name:</span> {company.name}</p>
                    <p><span className="font-medium text-muted-foreground">Trading Name:</span> {company.tradingName || "-"}</p>
                    <p><span className="font-medium text-muted-foreground">Registration No:</span> {company.registrationNo || "-"}</p>
                    <p><span className="font-medium text-muted-foreground">VAT No:</span> {company.vatNo || "-"}</p>
                    <p><span className="font-medium text-muted-foreground">Industry:</span> {company.industry || "-"}</p>
                    <p><span className="font-medium text-muted-foreground">Notes:</span> {company.notes || "-"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 rounded-lg border bg-slate-50 p-3 text-xs">
                  <p>Deals: {company.openDealsCount ?? "—"}</p>
                  <p>Cases: {company.openCasesCount ?? "—"}</p>
                  <p>Updated: {new Date(company.updatedAt).toLocaleDateString()}</p>
                </div>
              </>
            ) : null}
          </div>
        }
        timeline={
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">People linked to this company.</p>
              <Button size="sm" variant="secondary" onClick={() => setCreatePersonOpen(true)}>
                Add Contact
              </Button>
            </div>
            {!contactsWired ? (
              <p className="rounded-md border bg-slate-50 p-3 text-xs text-muted-foreground">
                Contacts are coming soon. For now, create a person and we will try linking via entity links.
              </p>
            ) : null}
            {contacts.length === 0 ? (
              <div className="rounded-lg border bg-white p-4 text-muted-foreground shadow-sm">No contacts linked yet.</div>
            ) : null}
            {contacts.map((contact) => (
              <div key={contact.id} className="rounded-lg border bg-white p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{contact.name}</p>
                  {contact.isPrimary ? <Badge variant="muted">PRIMARY</Badge> : null}
                </div>
                <p className="text-xs text-muted-foreground">{contact.roleTitle || "Role not set"}</p>
                <p className="text-xs text-muted-foreground">{contact.email || "No email"} · {contact.phone || "No phone"}</p>
              </div>
            ))}
          </div>
        }
        linked={
          <div className="space-y-3 text-sm">
            {timeline.length === 0 ? (
              <div className="rounded-lg border bg-white p-4 text-muted-foreground shadow-sm">No timeline events yet.</div>
            ) : null}
            {timeline.map((event) => (
              <div key={event.id} className="rounded-lg border bg-white p-3 shadow-sm">
                <p>{event.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {event.actor} · {new Date(event.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        }
        activity={
          <div className="space-y-3 text-sm">
            {linked.length === 0 ? (
              <div className="rounded-lg border bg-white p-4 text-muted-foreground shadow-sm">No linked records.</div>
            ) : null}
            {linked.map((item) => (
              <button
                key={`${item.type}-${item.id}`}
                className="w-full rounded-lg border bg-white p-3 text-left shadow-sm transition-colors hover:bg-slate-50"
                onClick={() => {
                  const kind = item.type.toUpperCase();
                  if (kind.includes("CASE")) {
                    openCase(item.id);
                    return;
                  }
                  if (kind.includes("DEAL")) {
                    openDeal(item.id);
                    return;
                  }
                  if (kind.includes("DOC")) {
                    navigate("/documents");
                    return;
                  }
                  if (kind.includes("TASK")) {
                    navigate("/tasks");
                    return;
                  }
                  if (kind.includes("INVOICE")) {
                    navigate("/finance");
                    return;
                  }
                  toast("Not wired yet", { description: "Opening this linked entity is not implemented yet." });
                }}
              >
                {item.type}: {item.label}
              </button>
            ))}
          </div>
        }
      />

      <Dialog open={createPersonOpen} onOpenChange={setCreatePersonOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Person</DialogTitle>
            <DialogDescription>Add a person and link to this company.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Full name" value={personName} onChange={(event) => setPersonName(event.target.value)} />
            <Input placeholder="Email (optional)" value={personEmail} onChange={(event) => setPersonEmail(event.target.value)} />
            <Input placeholder="Phone (optional)" value={personPhone} onChange={(event) => setPersonPhone(event.target.value)} />
          </div>
          <DialogFooter>
            <Button onClick={() => void createPersonAndLink()} disabled={busy || !personName.trim()}>
              {busy ? "Saving..." : "Create Person"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
