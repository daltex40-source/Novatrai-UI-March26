import { Bell, Search } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useCommandPalette } from "./command-palette-provider";

const titles: Record<string, string> = {
  "/": "Dashboard",
  "/my-day": "My Day",
  "/pipeline": "Pipeline",
  "/cases": "Cases",
  "/tasks": "Tasks",
  "/approvals": "Approvals",
  "/documents": "Documents",
  "/finance": "Finance",
  "/automations": "Automations",
};

export function Header() {
  const location = useLocation();
  const { setOpen } = useCommandPalette();
  const title = titles[location.pathname] ?? "Novatrai";

  return (
    <header className="flex h-14 items-center justify-between border-b bg-white px-6">
      <div>
        <h1 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h1>
      </div>
      <div className="flex items-center gap-3 text-muted-foreground">
        <button className="rounded-md p-2 hover:bg-muted" aria-label="Search" onClick={() => setOpen(true)}>
          <Search className="h-4 w-4" />
        </button>
        <button className="rounded-md p-2 hover:bg-muted" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
