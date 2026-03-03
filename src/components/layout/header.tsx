import { useLocation } from "react-router-dom";
import { HQInboxButton } from "@/components/inbox/hq-inbox-button";
import { NotificationCenter } from "./notification-center";
import { GlobalCreateEntry } from "./global-create-entry";

const titles: Record<string, string> = {
  "/": "Dashboard",
  "/analytics": "Analytics",
  "/my-day": "My Day",
  "/pipeline": "Pipeline",
  "/companies": "Companies",
  "/cases": "Cases",
  "/tasks": "Tasks",
  "/approvals": "Approvals",
  "/documents": "Documents",
  "/finance": "Finance",
  "/automations": "Automations",
};

export function Header() {
  const location = useLocation();
  const title = titles[location.pathname] ?? "Novatrai";

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-4 md:px-6">
      <div>
        <h1 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h1>
      </div>
      <div className="flex items-center gap-3 text-muted-foreground">
        <NotificationCenter />
        <GlobalCreateEntry />
        <HQInboxButton />
      </div>
    </header>
  );
}
