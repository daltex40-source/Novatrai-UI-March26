import { type PropsWithChildren } from "react";
import { useSidebarBadges } from "@/hooks/use-sidebar-badges";
import { CommandPaletteProvider } from "./command-palette-provider";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

export function AppLayout({ children }: PropsWithChildren) {
  const badges = useSidebarBadges();

  return (
    <CommandPaletteProvider>
      <div className="flex h-screen bg-background">
        <Sidebar badges={badges} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header />
          <main className="min-h-0 flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </CommandPaletteProvider>
  );
}
