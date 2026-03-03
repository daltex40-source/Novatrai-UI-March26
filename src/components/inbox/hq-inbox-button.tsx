import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useObjectDrawers } from "@/components/layout/object-drawer-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useHQInboxData } from "@/hooks/use-hq-inbox-data";
import { HQInboxSheet } from "./hq-inbox-sheet";

type InboxRow = {
  id: string;
  title: string;
  context: string;
  age: string;
};

type SwitchScreenName = "approvals" | "tasks" | "pipeline" | "invoices";

function useSwitchScreen() {
  const navigate = useNavigate();
  return (name: SwitchScreenName) => {
    const globalTarget = window as Window & { switchScreen?: (screen: string) => void };
    if (typeof globalTarget.switchScreen === "function") {
      globalTarget.switchScreen(name);
      return;
    }

    if (name === "approvals") navigate("/approvals");
    if (name === "tasks") navigate("/tasks");
    if (name === "pipeline") navigate("/pipeline");
    if (name === "invoices") navigate("/finance");
  };
}

export function HQInboxButton() {
  const [open, setOpen] = useState(false);
  const switchScreen = useSwitchScreen();
  const { openCase, openDeal } = useObjectDrawers();
  const warnedRef = useRef(false);
  const { approvals, overdueTasks, atRiskDeals, overdueInvoices, counts, loading, error, refresh } = useHQInboxData({
    pollWhileOpen: open,
  });

  useEffect(() => {
    if (!open) return;
    void refresh();
  }, [open, refresh]);

  useEffect(() => {
    if (!open) {
      warnedRef.current = false;
      return;
    }
    if (!error || warnedRef.current) return;
    warnedRef.current = true;
    toast("Not wired yet", {
      description: "Some inbox sources are unavailable in this environment.",
    });
  }, [error, open]);

  const onOpenApproval = (item: InboxRow) => {
    setOpen(false);
    const match = approvals.find((entry) => entry.id === item.id);
    if (match?.caseId) {
      openCase(match.caseId);
      return;
    }
    switchScreen("approvals");
  };

  const onOpenTask = (item: InboxRow) => {
    setOpen(false);
    const match = overdueTasks.find((entry) => entry.id === item.id);
    if (match?.caseId) {
      openCase(match.caseId);
      return;
    }
    switchScreen("tasks");
  };

  const onOpenDeal = (item: InboxRow) => {
    setOpen(false);
    const match = atRiskDeals.find((entry) => entry.id === item.id);
    if (match) {
      openDeal(match.id);
      return;
    }
    switchScreen("pipeline");
  };

  const onOpenFinance = (item: InboxRow) => {
    setOpen(false);
    const match = overdueInvoices.find((entry) => entry.id === item.id);
    if (match) {
      switchScreen("invoices");
      return;
    }
    toast("Not wired yet", {
      description: "Invoice drill-down will be connected in a follow-up pass.",
    });
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" className="relative" onClick={() => setOpen(true)} aria-label="Inbox">
              <Bell className="h-4 w-4" />
              <span className="ml-1">Inbox</span>
              {counts.total > 0 ? (
                <Badge variant="danger" className="ml-2 h-5 min-w-5 justify-center px-1.5 text-[10px]">
                  {counts.total > 99 ? "99+" : counts.total}
                </Badge>
              ) : null}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Operational inbox</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <HQInboxSheet
        open={open}
        onOpenChange={setOpen}
        loading={loading}
        error={error}
        approvals={approvals}
        tasks={overdueTasks}
        deals={atRiskDeals}
        finance={overdueInvoices}
        onRefresh={() => {
          void refresh();
        }}
        onOpenApproval={onOpenApproval}
        onOpenTask={onOpenTask}
        onOpenDeal={onOpenDeal}
        onOpenFinance={onOpenFinance}
        onViewApprovals={() => {
          setOpen(false);
          switchScreen("approvals");
        }}
        onViewTasks={() => {
          setOpen(false);
          switchScreen("tasks");
        }}
        onViewDeals={() => {
          setOpen(false);
          switchScreen("pipeline");
        }}
        onViewFinance={() => {
          setOpen(false);
          switchScreen("invoices");
        }}
      />
    </>
  );
}
