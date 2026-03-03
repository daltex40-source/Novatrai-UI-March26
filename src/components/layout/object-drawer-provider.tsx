import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { recordRecentItem } from "@/lib/recent-items";

type DrawerContextValue = {
  caseId: string | null;
  dealId: string | null;
  companyId: string | null;
  openCase: (caseId: string) => void;
  openDeal: (dealId: string) => void;
  openCompany: (companyId: string) => void;
  closeCase: () => void;
  closeDeal: () => void;
  closeCompany: () => void;
};

const DrawerContext = createContext<DrawerContextValue | null>(null);

export function ObjectDrawerProvider({ children }: PropsWithChildren) {
  const [caseId, setCaseId] = useState<string | null>(null);
  const [dealId, setDealId] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);

  const openCase = useCallback((nextCaseId: string) => {
    setCaseId(nextCaseId);
    recordRecentItem("Case", nextCaseId, `Case ${nextCaseId}`);
  }, []);

  const openDeal = useCallback((nextDealId: string) => {
    setDealId(nextDealId);
    recordRecentItem("Deal", nextDealId, `Deal ${nextDealId}`);
  }, []);

  const openCompany = useCallback((nextCompanyId: string) => {
    setCompanyId(nextCompanyId);
    recordRecentItem("Company", nextCompanyId, `Company ${nextCompanyId}`);
  }, []);

  const value = useMemo<DrawerContextValue>(
    () => ({
      caseId,
      dealId,
      companyId,
      openCase,
      openDeal,
      openCompany,
      closeCase: () => setCaseId(null),
      closeDeal: () => setDealId(null),
      closeCompany: () => setCompanyId(null),
    }),
    [caseId, companyId, dealId, openCase, openCompany, openDeal],
  );

  useEffect(() => {
    const globalTarget = window as Window & {
      openCase?: (id: string) => void;
      openDeal?: (id: string) => void;
      openCompany?: (id: string) => void;
    };

    globalTarget.openCase = openCase;
    globalTarget.openDeal = openDeal;
    globalTarget.openCompany = openCompany;

    return () => {
      delete globalTarget.openCase;
      delete globalTarget.openDeal;
      delete globalTarget.openCompany;
    };
  }, [openCase, openCompany, openDeal]);

  return <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>;
}

export function useObjectDrawers() {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error("useObjectDrawers must be used within ObjectDrawerProvider");
  }
  return context;
}
