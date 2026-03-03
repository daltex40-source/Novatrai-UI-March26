import type { ReactNode } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ObjectDrawerShellProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  statusNode: ReactNode;
  lifecycleNode: ReactNode;
  primaryAction?: ReactNode;
  secondaryActions?: ReactNode;
  overview: ReactNode;
  timeline: ReactNode;
  linked: ReactNode;
  activity: ReactNode;
  tabLabels?: {
    overview?: string;
    timeline?: string;
    linked?: string;
    activity?: string;
  };
};

export function ObjectDrawer({
  open,
  onOpenChange,
  title,
  subtitle,
  statusNode,
  lifecycleNode,
  primaryAction,
  secondaryActions,
  overview,
  timeline,
  linked,
  activity,
  tabLabels,
}: ObjectDrawerShellProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex h-full flex-col p-0">
        <div className="sticky top-0 z-10 border-b bg-gradient-to-b from-white to-slate-50 px-6 py-5 pr-12">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-1.5">
              <h2 className="text-xl font-semibold leading-tight">{title}</h2>
              {subtitle ? <p className="text-xs uppercase tracking-wide text-muted-foreground">{subtitle}</p> : null}
              <div>{statusNode}</div>
            </div>
            <div className="flex items-center gap-2 lg:justify-end">{primaryAction}</div>
          </div>
          <div className="mt-4">{lifecycleNode}</div>
          {secondaryActions ? <div className="mt-3 flex flex-wrap items-center gap-2">{secondaryActions}</div> : null}
        </div>

        <Tabs defaultValue="overview" className="flex min-h-0 flex-1 flex-col px-6 pb-6 pt-2">
          <TabsList className="mt-4 w-full justify-start overflow-x-auto">
            <TabsTrigger value="overview">{tabLabels?.overview ?? "Overview"}</TabsTrigger>
            <TabsTrigger value="timeline">{tabLabels?.timeline ?? "Timeline"}</TabsTrigger>
            <TabsTrigger value="linked">{tabLabels?.linked ?? "Linked"}</TabsTrigger>
            <TabsTrigger value="activity">{tabLabels?.activity ?? "Activity"}</TabsTrigger>
          </TabsList>
          <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
            <TabsContent value="overview">{overview}</TabsContent>
            <TabsContent value="timeline">{timeline}</TabsContent>
            <TabsContent value="linked">{linked}</TabsContent>
            <TabsContent value="activity">{activity}</TabsContent>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
