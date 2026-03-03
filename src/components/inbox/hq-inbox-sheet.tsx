import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { HQInboxList } from "./hq-inbox-list";

type InboxListItem = {
  id: string;
  title: string;
  context: string;
  age: string;
};

type HQInboxSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  error: {
    approvals?: string;
    tasks?: string;
    deals?: string;
    finance?: string;
  } | null;
  approvals: InboxListItem[];
  tasks: InboxListItem[];
  deals: InboxListItem[];
  finance: InboxListItem[];
  onRefresh: () => void;
  onOpenApproval: (item: InboxListItem) => void;
  onOpenTask: (item: InboxListItem) => void;
  onOpenDeal: (item: InboxListItem) => void;
  onOpenFinance: (item: InboxListItem) => void;
  onViewApprovals: () => void;
  onViewTasks: () => void;
  onViewDeals: () => void;
  onViewFinance: () => void;
};

export function HQInboxSheet({
  open,
  onOpenChange,
  loading,
  error,
  approvals,
  tasks,
  deals,
  finance,
  onRefresh,
  onOpenApproval,
  onOpenTask,
  onOpenDeal,
  onOpenFinance,
  onViewApprovals,
  onViewTasks,
  onViewDeals,
  onViewFinance,
}: HQInboxSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex h-full w-full max-w-2xl flex-col p-0">
        <div className="border-b bg-card px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">HQ Inbox</h2>
              <p className="text-sm text-muted-foreground">What needs attention right now</p>
            </div>
            <Button size="sm" variant="secondary" onClick={onRefresh}>
              Refresh
            </Button>
          </div>
        </div>

        <Tabs defaultValue="approvals" className="flex min-h-0 flex-1 flex-col px-6 pb-6">
          <TabsList className="mt-4 w-full justify-start">
            <TabsTrigger value="approvals">Approvals</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="deals">Deals</TabsTrigger>
            <TabsTrigger value="finance">Finance</TabsTrigger>
          </TabsList>

          <TabsContent value="approvals" className="mt-4 min-h-0 flex-1">
            <HQInboxList
              badgeLabel="PENDING"
              items={approvals}
              loading={loading}
              error={error?.approvals}
              emptyLabel="No pending approvals"
              viewAllLabel="View all approvals →"
              onOpenItem={onOpenApproval}
              onRetry={onRefresh}
              onViewAll={onViewApprovals}
            />
          </TabsContent>

          <TabsContent value="tasks" className="mt-4 min-h-0 flex-1">
            <HQInboxList
              badgeLabel="OVERDUE"
              items={tasks}
              loading={loading}
              error={error?.tasks}
              emptyLabel="No overdue tasks"
              viewAllLabel="View all tasks →"
              onOpenItem={onOpenTask}
              onRetry={onRefresh}
              onViewAll={onViewTasks}
            />
          </TabsContent>

          <TabsContent value="deals" className="mt-4 min-h-0 flex-1">
            <HQInboxList
              badgeLabel="AT RISK"
              items={deals}
              loading={loading}
              error={error?.deals}
              emptyLabel="No at-risk deals"
              viewAllLabel="View pipeline →"
              onOpenItem={onOpenDeal}
              onRetry={onRefresh}
              onViewAll={onViewDeals}
            />
          </TabsContent>

          <TabsContent value="finance" className="mt-4 min-h-0 flex-1">
            <HQInboxList
              badgeLabel="OVERDUE"
              items={finance}
              loading={loading}
              error={error?.finance}
              emptyLabel="No overdue invoices"
              viewAllLabel="View all invoices →"
              onOpenItem={onOpenFinance}
              onRetry={onRefresh}
              onViewAll={onViewFinance}
            />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
