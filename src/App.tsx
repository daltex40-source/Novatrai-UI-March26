import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";

const DashboardPage = lazy(() =>
  import("@/pages/dashboard-page").then((module) => ({ default: module.DashboardPage })),
);
const MyDayPage = lazy(() =>
  import("@/pages/my-day-page").then((module) => ({ default: module.MyDayPage })),
);
const PipelinePage = lazy(() =>
  import("@/pages/pipeline-page").then((module) => ({ default: module.PipelinePage })),
);
const CasesPage = lazy(() =>
  import("@/pages/cases-page").then((module) => ({ default: module.CasesPage })),
);
const CompaniesPage = lazy(() =>
  import("@/pages/companies-page").then((module) => ({ default: module.CompaniesPage })),
);
const TasksPage = lazy(() =>
  import("@/pages/tasks-page").then((module) => ({ default: module.TasksPage })),
);
const ApprovalsPage = lazy(() =>
  import("@/pages/approvals-page").then((module) => ({ default: module.ApprovalsPage })),
);
const DocumentsPage = lazy(() =>
  import("@/pages/documents-page").then((module) => ({ default: module.DocumentsPage })),
);
const FinancePage = lazy(() =>
  import("@/pages/finance-page").then((module) => ({ default: module.FinancePage })),
);
const AnalyticsPage = lazy(() =>
  import("@/pages/analytics-page").then((module) => ({ default: module.AnalyticsPage })),
);
const AutomationsPage = lazy(() =>
  import("@/pages/automations-page").then((module) => ({ default: module.AutomationsPage })),
);

export default function App() {
  return (
    <AppLayout>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/my-day" element={<MyDayPage />} />
          <Route path="/pipeline" element={<PipelinePage />} />
          <Route path="/cases" element={<CasesPage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/approvals" element={<ApprovalsPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/finance" element={<FinancePage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/automations" element={<AutomationsPage />} />
        </Routes>
      </Suspense>
    </AppLayout>
  );
}

function RouteFallback() {
  return <div className="text-sm text-muted-foreground">Loading...</div>;
}
