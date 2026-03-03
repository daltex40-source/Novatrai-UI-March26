import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError } from "@/api/client";
import { addCaseNote, getCaseDrawerData, updateCaseStatus, type CaseDrawerData } from "@/api/services";
import { useObjectDrawers } from "@/components/layout/object-drawer-provider";
import { useAppToast } from "@/components/layout/toast-provider";
import { LifecycleBanner } from "@/components/shared/lifecycle-banner";
import { ObjectDrawer } from "@/components/shared/object-drawer";
import { NeedsAttentionFlag, SignalStack, StuckBadge } from "@/components/shared/operational-signals";
import { StatusPill } from "@/components/shared/status-pill";
import { Button } from "@/components/ui/button";

const caseLifecycle = [
  { key: "OPEN", label: "Open" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "WAITING", label: "Waiting" },
  { key: "CLOSED", label: "Closed" },
];

const emptyData: CaseDrawerData = {
  detail: null,
  timeline: [],
  linked: [],
  tasks: [],
};

const CONFLICT_TOAST_MESSAGE = "Update conflict detected. Another change was saved first. Refresh and try again.";

export function CaseDrawer() {
  const navigate = useNavigate();
  const { caseId, closeCase } = useObjectDrawers();
  const { pushToast } = useAppToast();
  const [data, setData] = useState<CaseDrawerData>(emptyData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!caseId) {
      setData(emptyData);
      setError(null);
      setNoteText("");
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        setData(await getCaseDrawerData(caseId));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load case");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [caseId]);

  const activeStatus = data.detail?.status ?? "OPEN";
  const doneKeys = useMemo(() => {
    const index = caseLifecycle.findIndex((step) => step.key === activeStatus);
    if (index < 0) return [] as string[];
    return caseLifecycle.slice(0, index).map((step) => step.key);
  }, [activeStatus]);

  const reload = async () => {
    if (!caseId) return;
    setData(await getCaseDrawerData(caseId));
  };

  const setStatus = async (nextStatus: string) => {
    if (!caseId) return;
    setBusy(true);
    try {
      await updateCaseStatus(caseId, nextStatus as "OPEN" | "IN_PROGRESS" | "WAITING" | "CLOSED" | "CANCELLED");
      pushToast("Case status updated", "success");
      await reload();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        pushToast(CONFLICT_TOAST_MESSAGE, "warning");
        return;
      }
      pushToast(err instanceof Error ? err.message : "Failed to update status", "danger");
    } finally {
      setBusy(false);
    }
  };

  const submitNote = async () => {
    if (!caseId || !noteText.trim()) return;
    setBusy(true);
    try {
      await addCaseNote(caseId, noteText.trim());
      setNoteText("");
      pushToast("Note added", "success");
      await reload();
    } catch (err) {
      pushToast(err instanceof Error ? err.message : "Failed to add note", "danger");
    } finally {
      setBusy(false);
    }
  };

  const primaryAction = (() => {
    if (activeStatus === "OPEN") {
      return (
        <Button size="sm" onClick={() => pushToast("Add Task: coming soon", "neutral")}>
          Add Task
        </Button>
      );
    }
    if (activeStatus === "IN_PROGRESS") {
      return (
        <Button size="sm" onClick={() => navigate("/finance")}>Create Invoice Draft</Button>
      );
    }
    if (activeStatus === "WAITING") {
      return (
        <Button size="sm" variant="secondary" onClick={() => pushToast("Add Note below in timeline", "neutral")}>
          Add Note
        </Button>
      );
    }
    return undefined;
  })();

  return (
    <ObjectDrawer
      open={Boolean(caseId)}
      onOpenChange={(open) => {
        if (!open) closeCase();
      }}
      title={data.detail?.title ?? "Case"}
      subtitle={data.detail?.id}
      statusNode={<StatusPill kind="case" value={data.detail?.status ?? "OPEN"} />}
      lifecycleNode={
        <LifecycleBanner
          steps={caseLifecycle}
          activeKey={activeStatus}
          doneKeys={doneKeys}
        />
      }
      primaryAction={primaryAction}
      secondaryActions={
        <div className="flex items-center gap-2">
          <select
            className="rounded-md border px-2 py-1 text-sm"
            value={activeStatus}
            onChange={(event) => void setStatus(event.target.value)}
            disabled={busy || !data.detail}
          >
            {caseLifecycle.map((step) => (
              <option key={step.key} value={step.key}>{step.label}</option>
            ))}
            <option value="CANCELLED">Cancelled</option>
          </select>
          <Button size="sm" variant="ghost" onClick={() => void reload()} disabled={busy || !caseId}>Refresh</Button>
        </div>
      }
      overview={
        <div className="space-y-3 text-sm">
          {loading ? <p className="text-muted-foreground">Loading case...</p> : null}
          {error ? (
            <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-900">
              <p>{error}</p>
              <Button className="mt-2" size="sm" variant="secondary" onClick={() => void reload()}>Retry</Button>
            </div>
          ) : null}
          {!loading && data.detail ? (
            <>
              <p><span className="font-medium">Case Number:</span> {data.detail.id}</p>
              <p><span className="font-medium">Title:</span> {data.detail.title}</p>
              <p><span className="font-medium">Status:</span> {data.detail.status}</p>
              <p><span className="font-medium">Assigned Account:</span> {data.detail.accountName}</p>
              <p><span className="font-medium">Updated:</span> {new Date(data.detail.updatedAt).toLocaleString()}</p>
              <SignalStack>
                <StuckBadge since={data.detail.updatedAt} thresholdDays={14} />
                <NeedsAttentionFlag show={data.detail.status === "WAITING"} label="Needs follow-up" />
              </SignalStack>
            </>
          ) : null}
        </div>
      }
      timeline={
        <div className="space-y-3 text-sm">
          <div className="space-y-2">
            <textarea
              className="min-h-24 w-full rounded-md border p-2"
              placeholder="Add note..."
              value={noteText}
              onChange={(event) => setNoteText(event.target.value)}
            />
            <Button size="sm" variant="secondary" onClick={() => void submitNote()} disabled={busy || !noteText.trim()}>
              {busy ? "Saving..." : "Add Note"}
            </Button>
          </div>
          {loading ? <p className="text-muted-foreground">Loading timeline...</p> : null}
          {!loading && data.timeline.length === 0 ? <p className="text-muted-foreground">No timeline events.</p> : null}
          {data.timeline.map((event) => (
            <div key={event.id} className="rounded-md border p-3">
              <p className="font-medium">{event.summary}</p>
              <p className="mt-1 text-xs text-muted-foreground">{event.type} · {event.actor} · {new Date(event.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      }
      linked={
        <div className="space-y-2 text-sm">
          {loading ? <p className="text-muted-foreground">Loading links...</p> : null}
          {!loading && data.linked.length === 0 ? <p className="text-muted-foreground">No linked entities.</p> : null}
          {data.linked.map((item) => (
            <p key={item.id} className="rounded-md border p-3">{item.type}: {item.label}</p>
          ))}
        </div>
      }
      activity={
        <div className="space-y-2 text-sm">
          {data.tasks.length === 0 ? <p className="text-muted-foreground">No related tasks found.</p> : null}
          {data.tasks.map((task) => (
            <p key={task.id} className="rounded-md border p-3">Task · {task.title} · {task.status}</p>
          ))}
        </div>
      }
    />
  );
}
