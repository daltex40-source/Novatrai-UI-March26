import { useCallback, useEffect, useState } from "react";
import { getSidebarBadges, type SidebarBadges } from "@/api/services";

const initialBadges: SidebarBadges = {
  atRiskDeals: 0,
  overdueTasks: 0,
  pendingApprovals: 0,
  overdueInvoices: 0,
};

export function useSidebarBadges() {
  const [badges, setBadges] = useState<SidebarBadges>(initialBadges);

  const refreshBadges = useCallback(async () => {
    try {
      const next = await getSidebarBadges();
      setBadges(next);
    } catch {
      setBadges(initialBadges);
    }
  }, []);

  useEffect(() => {
    void refreshBadges();
    const interval = window.setInterval(() => {
      void refreshBadges();
    }, 60000);

    const onFocus = () => {
      void refreshBadges();
    };

    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [refreshBadges]);

  return badges;
}
