import type { ComponentType } from "react";
import { LayoutDashboard, CalendarCheck2, GitBranch, Briefcase, CheckSquare, ShieldCheck, FileText, Wallet, Bot, Building2 } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

type SidebarItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  badgeKey?: "atRiskDeals" | "overdueTasks" | "pendingApprovals" | "overdueInvoices";
};

type SidebarProps = {
  badges: {
    atRiskDeals: number;
    overdueTasks: number;
    pendingApprovals: number;
    overdueInvoices: number;
  };
};

const items: SidebarItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "My Day", href: "/my-day", icon: CalendarCheck2 },
  { label: "Pipeline", href: "/pipeline", icon: GitBranch, badgeKey: "atRiskDeals" },
  { label: "Companies", href: "/companies", icon: Building2 },
  { label: "Cases", href: "/cases", icon: Briefcase },
  { label: "Tasks", href: "/tasks", icon: CheckSquare, badgeKey: "overdueTasks" },
  { label: "Approvals", href: "/approvals", icon: ShieldCheck, badgeKey: "pendingApprovals" },
  { label: "Documents", href: "/documents", icon: FileText },
  { label: "Finance", href: "/finance", icon: Wallet, badgeKey: "overdueInvoices" },
  { label: "Automations", href: "/automations", icon: Bot },
];

export function Sidebar({ badges }: SidebarProps) {
  return (
    <aside className="w-64 border-r bg-slate-100/80 p-4">
      <div className="mb-6 rounded-md border bg-white px-3 py-2">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Novatrai</p>
        <p className="text-sm font-semibold">Operating HQ</p>
      </div>
      <nav className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const badgeCount = item.badgeKey ? badges[item.badgeKey] : 0;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-between rounded-md px-3 py-2 text-sm",
                  isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                )
              }
            >
              <span className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {item.label}
              </span>
              {badgeCount > 0 ? (
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-white">{badgeCount}</span>
              ) : null}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
