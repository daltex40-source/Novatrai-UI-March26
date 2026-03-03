import { Building2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  createCompany,
  forceCompaniesOfflineMode,
  listCompanies,
  resetDemoCompanyStores,
  seedDemoCompanyStores,
  shouldShowCompaniesOfflineToast,
  type Company,
  type CompanyStatus,
} from "@/api/companies";
import { useObjectDrawers } from "@/components/layout/object-drawer-provider";
import { StatusPill } from "@/components/shared/status-pill";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const statusFilters: Array<"ALL" | CompanyStatus> = ["ALL", "PROSPECT", "ACTIVE", "DORMANT", "ARCHIVED"];

export function CompaniesPage() {
  const { openCompany } = useObjectDrawers();
  const [items, setItems] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"ALL" | CompanyStatus>("ALL");
  const [cursor, setCursor] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [tradingName, setTradingName] = useState("");
  const [createBusy, setCreateBusy] = useState(false);

  const reloadUnfiltered = async () => {
    const page = await listCompanies({
      q: "",
      status: "ALL",
      limit: 20,
    });
    setQuery("");
    setStatus("ALL");
    setItems(page.items);
    setCursor(page.nextCursor);
  };

  const load = async (append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError(null);
    try {
      const page = await listCompanies({
        q: query,
        status,
        limit: 20,
        cursor: append ? cursor || undefined : undefined,
      });
      if (page.source === "demo" && shouldShowCompaniesOfflineToast()) {
        toast("Companies running in offline mode");
      }
      setItems((current) => (append ? [...current, ...page.items] : page.items));
      setCursor(page.nextCursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load companies");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load(false);
    }, 220);
    return () => window.clearTimeout(timer);
  }, [query, status]);

  const onCreateCompany = async () => {
    if (!name.trim()) return;
    setCreateBusy(true);
    try {
      const created = await createCompany({
        name: name.trim(),
        tradingName: tradingName.trim(),
        status: "PROSPECT",
      });
      toast.success("Company created");
      setCreateOpen(false);
      setName("");
      setTradingName("");
      await load(false);
      openCompany(created.id);
    } catch {
      toast("Not wired yet", { description: "Company endpoint is not available in this environment." });
    } finally {
      setCreateBusy(false);
    }
  };

  return (
    <section className="space-y-4">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Companies</h2>
          <p className="text-sm text-muted-foreground">Identity backbone for deals, cases, and documents.</p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="secondary">Demo Data</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={() => {
                  forceCompaniesOfflineMode();
                  seedDemoCompanyStores();
                  toast.success("Demo company stores seeded (offline mode)");
                  void reloadUnfiltered();
                }}
              >
                Seed demo stores
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  forceCompaniesOfflineMode();
                  resetDemoCompanyStores();
                  toast.success("Demo company stores reset (offline mode)");
                  void reloadUnfiltered();
                }}
              >
                Reset demo stores
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            New Company
          </Button>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-white p-3">
        <Input
          className="max-w-sm"
          placeholder="Search companies..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <select
          className="h-10 rounded-md border bg-white px-3 text-sm"
          value={status}
          onChange={(event) => setStatus(event.target.value as "ALL" | CompanyStatus)}
        >
          {statusFilters.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          <p>{error}</p>
          <Button size="sm" variant="secondary" className="mt-2" onClick={() => void load(false)}>
            Retry
          </Button>
        </div>
      ) : null}

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Primary Contact</TableHead>
              <TableHead>Open Deals</TableHead>
              <TableHead>Open Cases</TableHead>
              <TableHead>Last Activity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <TableRow key={`sk-${index}`}>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : null}

            {!loading && items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="flex flex-col items-center gap-2 py-6 text-center text-sm text-muted-foreground">
                    <Building2 className="h-5 w-5" />
                    <p>No companies found.</p>
                    <Button size="sm" variant="secondary" onClick={() => setCreateOpen(true)}>
                      Create Company
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : null}

            {items.map((company) => (
              <TableRow
                key={company.id}
                className="cursor-pointer hover:bg-slate-50"
                onClick={() => openCompany(company.id)}
              >
                <TableCell>
                  <p className="font-medium">{company.name}</p>
                  <p className="text-xs text-muted-foreground">{company.tradingName || "—"}</p>
                </TableCell>
                <TableCell>
                  <StatusPill kind="company" value={company.status} />
                </TableCell>
                <TableCell>{company.primaryContact || "—"}</TableCell>
                <TableCell>{company.openDealsCount ?? "—"}</TableCell>
                <TableCell>{company.openCasesCount ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{new Date(company.updatedAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {cursor ? (
        <div className="flex justify-center">
          <Button variant="secondary" onClick={() => void load(true)} disabled={loadingMore}>
            {loadingMore ? "Loading..." : "Load more"}
          </Button>
        </div>
      ) : null}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-xl p-0">
          <DialogHeader className="rounded-t-lg border-b bg-slate-50 px-6 py-5">
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-slate-600" />
              Create Company
            </DialogTitle>
            <DialogDescription>Add a legal identity to anchor work and relationships.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 px-6 py-5">
            <div className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Legal Name</label>
                  <Input placeholder="Company name" value={name} onChange={(event) => setName(event.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Trading Name</label>
                  <Input placeholder="Trading name (optional)" value={tradingName} onChange={(event) => setTradingName(event.target.value)} />
                </div>
              </div>
            </div>
            <Separator />
            <p className="text-xs text-muted-foreground">Default status on create: PROSPECT</p>
          </div>
          <DialogFooter className="border-t bg-slate-50 px-6 py-4">
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={() => void onCreateCompany()} disabled={createBusy || !name.trim()}>
              {createBusy ? "Creating..." : "Create Company"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
