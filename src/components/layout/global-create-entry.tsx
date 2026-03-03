import { Building2, Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { createCompany, type Company } from "@/api/companies";
import { apiGetRaw } from "@/api/client";
import {
  createApprovalRequestDraft,
  createCaseDraft,
  createDealDraft,
  createInvoiceDraft,
  createTaskDraft,
} from "@/api/services";
import { CompanyPicker } from "@/components/companies/company-picker";
import { useObjectDrawers } from "@/components/layout/object-drawer-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useHotkeys } from "@/hooks/use-hotkeys";
import { onOpenCreate } from "@/lib/global-create-events";
import { getRecentItems } from "@/lib/recent-items";
import { Separator } from "@/components/ui/separator";

type CreateType = "deal" | "case" | "task" | "invoice" | "approval" | "company";

type SearchResultItem = {
  type: "Case" | "Deal" | "Task" | "Approval";
  id: string;
  label: string;
};

function extractItems(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  const p = payload as Record<string, unknown>;
  if (Array.isArray(p.items)) return p.items;
  if (p.data && typeof p.data === "object") {
    const data = p.data as Record<string, unknown>;
    if (Array.isArray(data.items)) return data.items;
  }
  return [];
}

export function GlobalCreateEntry() {
  const navigate = useNavigate();
  const { caseId: caseContextId, openCase, openDeal, openCompany } = useObjectDrawers();
  const createButtonRef = useRef<HTMLButtonElement | null>(null);

  const [createType, setCreateType] = useState<CreateType | null>(null);
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [busy, setBusy] = useState(false);

  const [dealTitle, setDealTitle] = useState("");
  const [dealValue, setDealValue] = useState("0");
  const [dealCompany, setDealCompany] = useState("");
  const [dealStage, setDealStage] = useState("prospect");
  const [dealExpectedClose, setDealExpectedClose] = useState("");

  const [caseTitle, setCaseTitle] = useState("");
  const [casePriority, setCasePriority] = useState("MEDIUM");
  const [caseDueDate, setCaseDueDate] = useState("");
  const [assignToMe, setAssignToMe] = useState(true);
  const [caseCompanyName, setCaseCompanyName] = useState("");

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskCaseId, setTaskCaseId] = useState("");

  const [invoiceClient, setInvoiceClient] = useState("");
  const [invoiceCaseId, setInvoiceCaseId] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("0");

  const [approvalTitle, setApprovalTitle] = useState("");
  const [approvalCaseId, setApprovalCaseId] = useState("");
  const [approvalRequester, setApprovalRequester] = useState("");

  const [selectedDealCompany, setSelectedDealCompany] = useState<Company | null>(null);
  const [selectedCaseCompany, setSelectedCaseCompany] = useState<Company | null>(null);
  const [selectedInvoiceCompany, setSelectedInvoiceCompany] = useState<Company | null>(null);
  const [createCompanyName, setCreateCompanyName] = useState("");
  const [createCompanyTradingName, setCreateCompanyTradingName] = useState("");

  useHotkeys(
    (event) => (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k",
    () => {
      setCommandOpen((current) => !current);
    },
  );

  useHotkeys(
    (event) => event.key === "Escape",
    () => {
      setCommandOpen(false);
    },
    { preventDefault: false },
  );

  useEffect(() => {
    if (!commandOpen) return;
    if (commandQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = window.setTimeout(async () => {
      const query = encodeURIComponent(commandQuery.trim());
      const [cases, deals, tasks, approvals] = await Promise.allSettled([
        apiGetRaw(`/cases/my?q=${query}&limit=5`),
        apiGetRaw(`/deals?q=${query}&limit=5`),
        apiGetRaw(`/tasks/my?q=${query}&limit=5`),
        apiGetRaw(`/approvals/my?q=${query}&limit=5`),
      ]);

      const caseResults =
        cases.status === "fulfilled"
          ? extractItems(cases.value).map((item) => {
              const row = item as Record<string, unknown>;
              const id = String(row.id ?? row.case_id ?? "");
              return id ? ({ type: "Case", id, label: String(row.title ?? row.case_number ?? id) } as SearchResultItem) : null;
            })
          : [];
      const dealResults =
        deals.status === "fulfilled"
          ? extractItems(deals.value).map((item) => {
              const row = item as Record<string, unknown>;
              const id = String(row.id ?? row.deal_id ?? "");
              return id ? ({ type: "Deal", id, label: String(row.title ?? row.name ?? id) } as SearchResultItem) : null;
            })
          : [];
      const taskResults =
        tasks.status === "fulfilled"
          ? extractItems(tasks.value).map((item) => {
              const row = item as Record<string, unknown>;
              const id = String(row.id ?? row.task_id ?? "");
              return id ? ({ type: "Task", id, label: String(row.title ?? row.task_title ?? id) } as SearchResultItem) : null;
            })
          : [];
      const approvalResults =
        approvals.status === "fulfilled"
          ? extractItems(approvals.value).map((item) => {
              const row = item as Record<string, unknown>;
              const id = String(row.id ?? row.approval_id ?? "");
              return id ? ({ type: "Approval", id, label: String(row.title ?? row.workflow_name ?? id) } as SearchResultItem) : null;
            })
          : [];

      const merged = [...caseResults, ...dealResults, ...taskResults, ...approvalResults].filter(
        (item): item is SearchResultItem => item !== null,
      );
      setSearchResults(merged.slice(0, 12));
    }, 220);

    return () => {
      window.clearTimeout(timer);
    };
  }, [commandOpen, commandQuery]);

  useEffect(() => {
    const dispose = onOpenCreate((payload) => {
      setCreateType(payload.type);
      setCommandOpen(false);
      if (!payload.company) return;
      const seeded: Company = {
        id: payload.company.id || "",
        name: payload.company.name,
        tradingName: "",
        status: "PROSPECT",
        primaryContact: "",
        openDealsCount: null,
        openCasesCount: null,
        updatedAt: new Date().toISOString(),
        registrationNo: "",
        vatNo: "",
        industry: "",
        notes: "",
      };
      if (payload.type === "deal") {
        setSelectedDealCompany(seeded);
        setDealCompany(payload.company.name);
      }
      if (payload.type === "case") {
        setSelectedCaseCompany(seeded);
        setCaseCompanyName(payload.company.name);
      }
      if (payload.type === "invoice") {
        setSelectedInvoiceCompany(seeded);
        setInvoiceClient(payload.company.name);
      }
    });
    return dispose;
  }, []);

  const recentItems = useMemo(() => getRecentItems(), [commandOpen]);

  const closeDialogs = () => {
    setCreateType(null);
    setBusy(false);
  };

  const finishCreate = (message = "Created") => {
    toast.success(message);
    closeDialogs();
    setCommandOpen(false);
    window.requestAnimationFrame(() => createButtonRef.current?.focus());
  };

  const notWired = () => {
    toast("Not wired yet", { description: "This action is available in UI and will be connected soon." });
  };

  const createDeal = async () => {
    setBusy(true);
    try {
      const created = await createDealDraft({
        title: dealTitle || "New Deal",
        companyName: selectedDealCompany?.name || dealCompany,
        companyId: selectedDealCompany?.id || undefined,
        value: Number.parseFloat(dealValue) || 0,
      });
      openDeal(created.id);
      finishCreate("Deal created");
    } catch {
      notWired();
      setBusy(false);
    }
  };

  const createCase = async () => {
    setBusy(true);
    try {
      const created = await createCaseDraft({
        title: caseTitle || "New Case",
        accountName: selectedCaseCompany?.name || caseCompanyName || (assignToMe ? "Assigned to me" : casePriority),
        companyId: selectedCaseCompany?.id || undefined,
        companyName: selectedCaseCompany?.name || caseCompanyName || undefined,
      });
      openCase(created.id);
      finishCreate("Case created");
    } catch {
      notWired();
      setBusy(false);
    }
  };

  const createTask = async () => {
    setBusy(true);
    try {
      const created = await createTaskDraft({ title: taskTitle || "New Task", dueDate: taskDueDate, caseId: taskCaseId || undefined });
      navigate(`/tasks?taskId=${encodeURIComponent(created.id)}`);
      finishCreate("Task created");
    } catch {
      notWired();
      setBusy(false);
    }
  };

  const createInvoice = async () => {
    setBusy(true);
    try {
      const created = await createInvoiceDraft({
        client: selectedInvoiceCompany?.name || invoiceClient,
        amount: Number.parseFloat(invoiceAmount) || 0,
        dueDate: "",
        linkedCaseId: invoiceCaseId || undefined,
        companyId: selectedInvoiceCompany?.id || undefined,
        companyName: selectedInvoiceCompany?.name || invoiceClient || undefined,
      });
      navigate(`/finance?invoiceId=${encodeURIComponent(created.id)}`);
      finishCreate("Invoice draft created");
    } catch {
      notWired();
      setBusy(false);
    }
  };

  const createApproval = async () => {
    setBusy(true);
    try {
      const caseId = approvalCaseId || caseContextId;
      if (!caseId) {
        toast.error("Case context required");
        setBusy(false);
        return;
      }
      const created = await createApprovalRequestDraft({
        title: approvalTitle || "Approval Request",
        requester: approvalRequester || "Current user",
        caseId,
      });
      navigate(`/approvals?approvalId=${encodeURIComponent(created.id)}`);
      finishCreate("Approval requested");
    } catch {
      notWired();
      setBusy(false);
    }
  };

  const openCreate = (type: CreateType) => {
    setCreateType(type);
    setCommandOpen(false);
  };

  const createCompanyInline = async () => {
    if (!createCompanyName.trim()) return;
    setBusy(true);
    try {
      const created = await createCompany({
        name: createCompanyName.trim(),
        tradingName: createCompanyTradingName.trim(),
        status: "PROSPECT",
      });
      setSelectedDealCompany(created);
      setSelectedCaseCompany(created);
      setSelectedInvoiceCompany(created);
      setDealCompany(created.name);
      setCaseCompanyName(created.name);
      setInvoiceClient(created.name);
      setCreateType(null);
      setCreateCompanyName("");
      setCreateCompanyTradingName("");
      openCompany(created.id);
      toast.success("Company created");
    } catch {
      notWired();
    } finally {
      setBusy(false);
    }
  };

  const handleSelectRecent = (type: string, id: string) => {
    setCommandOpen(false);
    if (type === "Case") openCase(id);
    if (type === "Deal") openDeal(id);
    if (type === "Task") navigate(`/tasks?taskId=${encodeURIComponent(id)}`);
    if (type === "Approval") navigate(`/approvals?approvalId=${encodeURIComponent(id)}`);
    if (type === "Invoice") navigate(`/finance?invoiceId=${encodeURIComponent(id)}`);
    if (type === "Company") openCompany(id);
  };

  const restoreCreateButtonFocus = (event: Event) => {
    event.preventDefault();
    createButtonRef.current?.focus();
  };

  const handleSelectSearchResult = (item: SearchResultItem) => {
    setCommandOpen(false);
    if (item.type === "Case") openCase(item.id);
    if (item.type === "Deal") openDeal(item.id);
    if (item.type === "Task") navigate(`/tasks?taskId=${encodeURIComponent(item.id)}`);
    if (item.type === "Approval") navigate(`/approvals?approvalId=${encodeURIComponent(item.id)}`);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button ref={createButtonRef} size="sm" variant="secondary" className="gap-2">
            <Plus className="h-4 w-4" />
            Create
            <Badge variant="muted" className="ml-1 text-[10px]">⌘K</Badge>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Global Create</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => openCreate("deal")}>New Deal</DropdownMenuItem>
          <DropdownMenuItem onClick={() => openCreate("case")}>New Case</DropdownMenuItem>
          <DropdownMenuItem onClick={() => openCreate("task")}>New Task</DropdownMenuItem>
          <DropdownMenuItem onClick={() => openCreate("invoice")}>New Invoice Draft</DropdownMenuItem>
          <DropdownMenuItem disabled={!caseContextId} onClick={() => openCreate("approval")}>
            Request Approval (from Case)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={commandOpen} onOpenChange={setCommandOpen}>
        <DialogContent className="max-w-2xl p-0" onCloseAutoFocus={restoreCreateButtonFocus}>
          <Command shouldFilter>
            <CommandInput placeholder="Type a command or search..." value={commandQuery} onValueChange={setCommandQuery} />
            <CommandList>
              <CommandEmpty>No matching commands.</CommandEmpty>

              <CommandGroup heading="Navigate">
                <CommandItem onSelect={() => { setCommandOpen(false); navigate("/"); }}>Dashboard</CommandItem>
                <CommandItem onSelect={() => { setCommandOpen(false); navigate("/my-day"); }}>My Day</CommandItem>
                <CommandItem onSelect={() => { setCommandOpen(false); navigate("/pipeline"); }}>Pipeline</CommandItem>
                <CommandItem onSelect={() => { setCommandOpen(false); navigate("/cases"); }}>Cases</CommandItem>
                <CommandItem onSelect={() => { setCommandOpen(false); navigate("/companies"); }}>Companies</CommandItem>
                <CommandItem onSelect={() => { setCommandOpen(false); navigate("/tasks"); }}>Tasks</CommandItem>
                <CommandItem onSelect={() => { setCommandOpen(false); navigate("/approvals"); }}>Approvals</CommandItem>
                <CommandItem onSelect={() => { setCommandOpen(false); navigate("/documents"); }}>Documents</CommandItem>
                <CommandItem onSelect={() => { setCommandOpen(false); navigate("/finance"); }}>Finance</CommandItem>
              </CommandGroup>

              <CommandSeparator />

              <CommandGroup heading="Create">
                <CommandItem onSelect={() => openCreate("deal")}>New Deal</CommandItem>
                <CommandItem onSelect={() => openCreate("case")}>New Case</CommandItem>
                <CommandItem onSelect={() => openCreate("task")}>New Task</CommandItem>
                <CommandItem onSelect={() => openCreate("invoice")}>New Invoice Draft</CommandItem>
                <CommandItem disabled={!caseContextId} onSelect={() => openCreate("approval")}>Request Approval (from Case)</CommandItem>
              </CommandGroup>

              <CommandSeparator />

              <CommandGroup heading="Jump To Recent">
                {recentItems.length === 0 ? <CommandItem disabled>No recent items</CommandItem> : null}
                {recentItems.map((item) => (
                  <CommandItem key={`${item.type}-${item.id}`} onSelect={() => handleSelectRecent(item.type, item.id)}>
                    {item.type} · {item.label}
                  </CommandItem>
                ))}
              </CommandGroup>

              <CommandSeparator />

              <CommandGroup heading="Search Results">
                {searchResults.length === 0 ? <CommandItem disabled>Type to search (or endpoint unavailable)</CommandItem> : null}
                {searchResults.map((item) => (
                  <CommandItem key={`${item.type}-${item.id}`} onSelect={() => handleSelectSearchResult(item)}>
                    {item.type} · {item.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>

      <Dialog open={createType === "deal"} onOpenChange={(open) => !open && closeDialogs()}>
        <DialogContent className="max-w-xl p-0" onCloseAutoFocus={restoreCreateButtonFocus}>
          <DialogHeader className="rounded-t-lg border-b bg-slate-50 px-6 py-5">
            <DialogTitle>New Deal</DialogTitle>
            <DialogDescription>Capture the opportunity with only essential fields.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 px-6 py-5 text-sm">
            <div className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Deal Title</label>
                  <input className="w-full rounded-md border bg-white px-3 py-2" placeholder="Title" value={dealTitle} onChange={(event) => setDealTitle(event.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Deal Value</label>
                  <input className="w-full rounded-md border bg-white px-3 py-2" placeholder="Value" value={dealValue} onChange={(event) => setDealValue(event.target.value)} />
                </div>
                <CompanyPicker
                  label="Company"
                  selected={selectedDealCompany}
                  onSelect={(company) => {
                    setSelectedDealCompany(company);
                    setDealCompany(company.name);
                  }}
                  onClear={() => setSelectedDealCompany(null)}
                  onCreateCompany={() => setCreateType("company")}
                  onFreeTextChange={(value) => setDealCompany(value)}
                />
              </div>
            </div>
            <div className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Stage</label>
                  <select className="w-full rounded-md border bg-white px-2 py-2" value={dealStage} onChange={(event) => setDealStage(event.target.value)}>
                    <option value="prospect">Prospect</option>
                    <option value="qualified">Qualified</option>
                    <option value="proposal">Proposal</option>
                    <option value="negotiation">Negotiation</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Expected Close</label>
                  <input type="date" className="w-full rounded-md border bg-white px-2 py-2" value={dealExpectedClose} onChange={(event) => setDealExpectedClose(event.target.value)} />
                </div>
              </div>
            </div>
            <Separator />
            <p className="text-xs text-muted-foreground">Saved with calm defaults. You can refine details in the deal drawer.</p>
          </div>
          <DialogFooter className="border-t bg-slate-50 px-6 py-4">
            <Button variant="ghost" onClick={() => closeDialogs()}>Cancel</Button>
            <Button onClick={() => void createDeal()} disabled={busy}>{busy ? "Creating..." : "Create Deal"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={createType === "case"} onOpenChange={(open) => !open && closeDialogs()}>
        <DialogContent className="max-w-xl p-0" onCloseAutoFocus={restoreCreateButtonFocus}>
          <DialogHeader className="rounded-t-lg border-b bg-slate-50 px-6 py-5">
            <DialogTitle>New Case</DialogTitle>
            <DialogDescription>Open a new execution case quickly.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 px-6 py-5 text-sm">
            <div className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Case Title</label>
                  <input className="w-full rounded-md border bg-white px-3 py-2" placeholder="Title" value={caseTitle} onChange={(event) => setCaseTitle(event.target.value)} />
                </div>
                <CompanyPicker
                  label="Company"
                  selected={selectedCaseCompany}
                  onSelect={(company) => setSelectedCaseCompany(company)}
                  onClear={() => setSelectedCaseCompany(null)}
                  onCreateCompany={() => setCreateType("company")}
                  onFreeTextChange={(value) => setCaseCompanyName(value)}
                />
              </div>
            </div>
            <div className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Priority</label>
                  <select className="w-full rounded-md border bg-white px-2 py-2" value={casePriority} onChange={(event) => setCasePriority(event.target.value)}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Due Date</label>
                  <input type="date" className="w-full rounded-md border bg-white px-2 py-2" value={caseDueDate} onChange={(event) => setCaseDueDate(event.target.value)} />
                </div>
              </div>
              <label className="mt-3 flex items-center gap-2 rounded-md bg-slate-50 px-2 py-2 text-sm">
                <input type="checkbox" checked={assignToMe} onChange={(event) => setAssignToMe(event.target.checked)} />
                Assign to me
              </label>
            </div>
            <Separator />
            <p className="text-xs text-muted-foreground">Create the case now and complete deeper details from the case drawer.</p>
          </div>
          <DialogFooter className="border-t bg-slate-50 px-6 py-4">
            <Button variant="ghost" onClick={() => closeDialogs()}>Cancel</Button>
            <Button onClick={() => void createCase()} disabled={busy}>{busy ? "Creating..." : "Create Case"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={createType === "task"} onOpenChange={(open) => !open && closeDialogs()}>
        <DialogContent onCloseAutoFocus={restoreCreateButtonFocus}>
          <DialogHeader>
            <DialogTitle>New Task</DialogTitle>
            <DialogDescription>Fast task capture with optional case link.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <input className="w-full rounded-md border bg-white px-3 py-2" placeholder="Title" value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} />
            <input type="date" className="w-full rounded-md border bg-white px-3 py-2" value={taskDueDate} onChange={(event) => setTaskDueDate(event.target.value)} />
            <input className="w-full rounded-md border bg-white px-3 py-2" placeholder="Paste Case ID (optional)" value={taskCaseId} onChange={(event) => setTaskCaseId(event.target.value)} />
            <p className="text-xs text-muted-foreground">Case search coming soon.</p>
          </div>
          <DialogFooter><Button onClick={() => void createTask()} disabled={busy}>{busy ? "Creating..." : "Create"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={createType === "invoice"} onOpenChange={(open) => !open && closeDialogs()}>
        <DialogContent className="max-w-xl p-0" onCloseAutoFocus={restoreCreateButtonFocus}>
          <DialogHeader className="rounded-t-lg border-b bg-slate-50 px-6 py-5">
            <DialogTitle>New Invoice Draft</DialogTitle>
            <DialogDescription>Create a draft and optionally link to a case.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 px-6 py-5 text-sm">
            <div className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Client / Company</label>
                  <input className="w-full rounded-md border bg-white px-3 py-2" placeholder="Client / Company (optional)" value={invoiceClient} onChange={(event) => setInvoiceClient(event.target.value)} />
                </div>
                <CompanyPicker
                  label="Company"
                  selected={selectedInvoiceCompany}
                  onSelect={(company) => {
                    setSelectedInvoiceCompany(company);
                    setInvoiceClient(company.name);
                  }}
                  onClear={() => setSelectedInvoiceCompany(null)}
                  onCreateCompany={() => setCreateType("company")}
                  onFreeTextChange={(value) => setInvoiceClient(value)}
                />
              </div>
            </div>
            <div className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Link to Case</label>
                  <input className="w-full rounded-md border bg-white px-3 py-2" placeholder="Paste Case ID (optional)" value={invoiceCaseId} onChange={(event) => setInvoiceCaseId(event.target.value)} />
                  <p className="text-xs text-muted-foreground">Case search coming soon.</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Amount</label>
                  <input className="w-full rounded-md border bg-white px-3 py-2" placeholder="Amount (optional)" value={invoiceAmount} onChange={(event) => setInvoiceAmount(event.target.value)} />
                </div>
              </div>
            </div>
            <Separator />
            <p className="text-xs text-muted-foreground">Draft first, then finalize line items and links from Finance.</p>
          </div>
          <DialogFooter className="border-t bg-slate-50 px-6 py-4">
            <Button variant="ghost" onClick={() => closeDialogs()}>Cancel</Button>
            <Button onClick={() => void createInvoice()} disabled={busy}>{busy ? "Creating..." : "Create Draft"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={createType === "approval"} onOpenChange={(open) => !open && closeDialogs()}>
        <DialogContent onCloseAutoFocus={restoreCreateButtonFocus}>
          <DialogHeader>
            <DialogTitle>Request Approval</DialogTitle>
            <DialogDescription>Request governance decision from a case context.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <input className="w-full rounded-md border bg-white px-3 py-2" placeholder="Title" value={approvalTitle} onChange={(event) => setApprovalTitle(event.target.value)} />
            <input className="w-full rounded-md border bg-white px-3 py-2" placeholder="Requester" value={approvalRequester} onChange={(event) => setApprovalRequester(event.target.value)} />
            <input className="w-full rounded-md border bg-white px-3 py-2" placeholder="Case ID" value={approvalCaseId} onChange={(event) => setApprovalCaseId(event.target.value)} />
            {caseContextId ? <p className="text-xs text-muted-foreground">Current case context: {caseContextId}</p> : null}
          </div>
          <DialogFooter><Button onClick={() => void createApproval()} disabled={busy}>{busy ? "Creating..." : "Create"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={createType === "company"} onOpenChange={(open) => !open && closeDialogs()}>
        <DialogContent className="max-w-xl p-0" onCloseAutoFocus={restoreCreateButtonFocus}>
          <DialogHeader className="rounded-t-lg border-b bg-slate-50 px-6 py-5">
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-slate-600" />
              Create Company
            </DialogTitle>
            <DialogDescription>Add a company and continue creating work against it.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 px-6 py-5 text-sm">
            <div className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Legal Name</label>
                  <input
                    className="w-full rounded-md border bg-white px-3 py-2"
                    placeholder="Company name"
                    value={createCompanyName}
                    onChange={(event) => setCreateCompanyName(event.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Trading Name</label>
                  <input
                    className="w-full rounded-md border bg-white px-3 py-2"
                    placeholder="Trading name (optional)"
                    value={createCompanyTradingName}
                    onChange={(event) => setCreateCompanyTradingName(event.target.value)}
                  />
                </div>
              </div>
            </div>
            <Separator />
            <p className="text-xs text-muted-foreground">Default status on create: PROSPECT</p>
          </div>
          <DialogFooter className="border-t bg-slate-50 px-6 py-4">
            <Button variant="ghost" onClick={() => closeDialogs()}>Cancel</Button>
            <Button onClick={() => void createCompanyInline()} disabled={busy || !createCompanyName.trim()}>
              {busy ? "Creating..." : "Create Company"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
