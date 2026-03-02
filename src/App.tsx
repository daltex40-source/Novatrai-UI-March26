import { Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";
import { ApprovalsPage } from "@/pages/approvals-page";
import { CasesPage } from "@/pages/cases-page";
import { DashboardPage } from "@/pages/dashboard-page";
import { DocumentsPage } from "@/pages/documents-page";
import { FinancePage } from "@/pages/finance-page";
import { MyDayPage } from "@/pages/my-day-page";
import { PipelinePage } from "@/pages/pipeline-page";
import { TasksPage } from "@/pages/tasks-page";
import { AutomationsPage } from "@/pages/automations-page";

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/my-day" element={<MyDayPage />} />
        <Route path="/pipeline" element={<PipelinePage />} />
        <Route path="/cases" element={<CasesPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/approvals" element={<ApprovalsPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/finance" element={<FinancePage />} />
        <Route path="/automations" element={<AutomationsPage />} />
      </Routes>
    </AppLayout>
  );
}
