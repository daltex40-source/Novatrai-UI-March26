import { ReactNode } from "react";
import { StatusPill } from "@/components/shared/status-pill";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LifecycleBanner } from "./lifecycle-banner";

type ObjectDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  status: string;
  lifecycleSteps: string[];
  currentStatus: string;
  primaryAction?: ReactNode;
  overview: ReactNode;
  timeline: ReactNode;
  linked: ReactNode;
  financial?: ReactNode;
};

export function ObjectDrawer({
  open,
  onOpenChange,
  title,
  status,
  lifecycleSteps,
  currentStatus,
  primaryAction,
  overview,
  timeline,
  linked,
  financial,
}: ObjectDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex h-full flex-col">
        <div className="space-y-4 border-b pb-4 pr-8">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">{title}</h2>
              <StatusPill status={status} />
            </div>
            {primaryAction}
          </div>
          <LifecycleBanner steps={lifecycleSteps} currentStatus={currentStatus} />
        </div>
        <Tabs defaultValue="overview" className="mt-4 flex min-h-0 flex-1 flex-col">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="linked">Linked</TabsTrigger>
            {financial ? <TabsTrigger value="financial">Financial</TabsTrigger> : null}
          </TabsList>
          <div className="min-h-0 flex-1 overflow-y-auto pr-2">
            <TabsContent value="overview">{overview}</TabsContent>
            <TabsContent value="timeline">{timeline}</TabsContent>
            <TabsContent value="linked">{linked}</TabsContent>
            {financial ? <TabsContent value="financial">{financial}</TabsContent> : null}
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
