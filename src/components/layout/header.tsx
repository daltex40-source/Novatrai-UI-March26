import { useLocation } from "react-router-dom";
import { HQInboxButton } from "@/components/inbox/hq-inbox-button";
import { GlobalCreateEntry } from "./global-create-entry";

const titles: Record<string, string> = {
  "/": "Dashboard",
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
    <header className="flex h-14 items-center justify-between border-b bg-white px-6">
      <div>
        <h1 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h1>
      </div>
      <div className="flex items-center gap-3 text-muted-foreground">
        <GlobalCreateEntry />
        <HQInboxButton />
      </div>
    </header>
  );
}
