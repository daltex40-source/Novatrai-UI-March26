import { type PropsWithChildren } from "react";
import { CaseDrawer } from "@/components/drawers/case-drawer";
import { CompanyDrawer } from "@/components/drawers/company-drawer";
import { DealDrawer } from "@/components/drawers/deal-drawer";
import { useSidebarBadges } from "@/hooks/use-sidebar-badges";
import { ObjectDrawerProvider } from "./object-drawer-provider";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { ToastProvider } from "./toast-provider";

export function AppLayout({ children }: PropsWithChildren) {
  const badges = useSidebarBadges();

  return (
    <ToastProvider>
      <ObjectDrawerProvider>
        <div className="flex h-screen bg-background">
          <Sidebar badges={badges} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header />
          <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
          <CaseDrawer />
          <DealDrawer />
          <CompanyDrawer />
        </div>
      </ObjectDrawerProvider>
    </ToastProvider>
  );
}
