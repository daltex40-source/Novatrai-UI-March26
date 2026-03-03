import { useEffect, useMemo, useState } from "react";
import { ApiError } from "@/api/client";
import {
  getDealById,
  getDealDrawerData,
  getPipelineBoard,
  markDealLost,
  markDealWon,
  moveDeal,
  type DealDetail,
  type DealDrawerData,
} from "@/api/services";
import { useObjectDrawers } from "@/components/layout/object-drawer-provider";
import { useAppToast } from "@/components/layout/toast-provider";
import { LifecycleBanner } from "@/components/shared/lifecycle-banner";
import { ObjectDrawer } from "@/components/shared/object-drawer";
import { StatusPill } from "@/components/shared/status-pill";
import { Button } from "@/components/ui/button";

const defaultSteps = [
  { key: "PROSPECT", label: "Prospect" },
  { key: "QUALIFIED", label: "Qualified" },
  { key: "PROPOSAL", label: "Proposal" },
  { key: "NEGOTIATION", label: "Negotiation" },
  { key: "WON_LOST", label: "Won/Lost" },
];

const emptyDrawerData: DealDrawerData = { timeline: [], linked: [] };

export function DealDrawer() {
  const { dealId, openCase, closeDeal } = useObjectDrawers();
  const { pushToast } = useAppToast();
  const [detail, setDetail] = useState<DealDetail | null>(null);
  const [data, setData] = useState<DealDrawerData>(emptyDrawerData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [steps, setSteps] = useState(defaultSteps);
  const [stageOptions, setStageOptions] = useState<Array<{ id: string; key: string; label: string }>>([]);
  const [toStageId, setToStageId] = useState("");
  const [lostReason, setLostReason] = useState("");

  const activeKey = useMemo(() => {
    if (!detail?.stageName) return "PROSPECT";
    return detail.stageName.toUpperCase().replaceAll(" ", "_");
  }, [detail?.stageName]);

  const doneKeys = useMemo(() => {
    const index = steps.findIndex((step) => step.key === activeKey);
    if (index < 0) return [] as string[];
    return steps.slice(0, index).map((step) => step.key);
  }, [activeKey, steps]);

  const nearEnd = useMemo(() => {
    const index = steps.findIndex((step) => step.key === activeKey);
    return index >= steps.length - 2;
  }, [activeKey, steps]);

  const load = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const [detailData, drawerData, board] = await Promise.all([
        getDealById(id),
        getDealDrawerData(id),
        getPipelineBoard(),
      ]);
      setDetail(detailData);
      setData(drawerData);
      const stepList = board.stages.map((stage) => ({
        id: stage.id,
        key: stage.name.toUpperCase().replaceAll(" ", "_"),
        label: stage.name,
      }));
      if (stepList.length > 0) {
        setSteps([...stepList, { key: "WON_LOST", label: "Won/Lost" }]);
        setStageOptions(stepList);
      }
      setToStageId(detailData?.stageId || stepList[0]?.id || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load deal");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!dealId) {
      setDetail(null);
      setData(emptyDrawerData);
      setError(null);
      setLostReason("");
      return;
    }
    void load(dealId);
  }, [dealId]);

  const withConflictHandling = async (action: () => Promise<void>, successMessage: string) => {
    if (!dealId) return;
    setBusy(true);
    try {
      await action();
      pushToast(successMessage, "success");
      await load(dealId);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        pushToast("Conflict detected. Refresh and retry suggested.", "warning");
        return;
      }
      pushToast(err instanceof Error ? err.message : "Action failed", "danger");
    } finally {
      setBusy(false);
    }
  };

  const onMarkWon = async () => {
    if (!dealId) return;
    setBusy(true);
    try {
      const result = await markDealWon(dealId);
      pushToast("Deal marked won", "success");
      closeDeal();
      if (result.caseId) {
        openCase(result.caseId);
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        pushToast("Conflict detected. Refresh and retry suggested.", "warning");
        return;
      }
      pushToast(err instanceof Error ? err.message : "Failed to mark won", "danger");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ObjectDrawer
      open={Boolean(dealId)}
      onOpenChange={(open) => {
        if (!open) closeDeal();
      }}
      title={detail?.title ?? "Deal"}
      subtitle={detail?.id}
      statusNode={<StatusPill kind="deal" value={detail?.status ?? activeKey} />}
      lifecycleNode={<LifecycleBanner steps={steps} activeKey={activeKey} doneKeys={doneKeys} />}
      primaryAction={
        nearEnd ? (
          <Button size="sm" onClick={() => void onMarkWon()} disabled={busy || !dealId}>Mark Won</Button>
        ) : (
          <div className="flex items-center gap-2">
            <select
              className="rounded-md border px-2 py-1 text-sm"
              value={toStageId}
              onChange={(event) => setToStageId(event.target.value)}
              disabled={busy}
            >
              {stageOptions.map((step) => (
                <option key={step.id} value={step.id}>{step.label}</option>
              ))}
            </select>
            <Button
              size="sm"
              onClick={() =>
                dealId &&
                void withConflictHandling(
                  () => moveDeal(dealId, toStageId),
                  "Deal stage moved",
                )
              }
              disabled={busy || !dealId}
            >
              Move Stage
            </Button>
          </div>
        )
      }
      secondaryActions={
        <div className="flex items-center gap-2">
          <input
            className="w-44 rounded-md border px-2 py-1 text-sm"
            placeholder="Reason for loss"
            value={lostReason}
            onChange={(event) => setLostReason(event.target.value)}
            disabled={busy}
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              dealId &&
              void withConflictHandling(
                () => markDealLost(dealId, lostReason || "Not specified"),
                "Deal marked lost",
              )
            }
            disabled={busy || !dealId}
          >
            Mark Lost
          </Button>
        </div>
      }
      overview={
        <div className="space-y-3 text-sm">
          {loading ? <p className="text-muted-foreground">Loading deal...</p> : null}
          {error ? (
            <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-900">
              <p>{error}</p>
              {dealId ? <Button className="mt-2" size="sm" variant="secondary" onClick={() => void load(dealId)}>Retry</Button> : null}
            </div>
          ) : null}
          {!loading && detail ? (
            <>
              <p><span className="font-medium">Deal ID:</span> {detail.id}</p>
              <p><span className="font-medium">Company:</span> {detail.companyName || "Unassigned"}</p>
              <p><span className="font-medium">Value:</span> {detail.value.toLocaleString()}</p>
              <p><span className="font-medium">Stage:</span> {detail.stageName || "-"}</p>
              <p><span className="font-medium">Expected Close:</span> {detail.expectedCloseAt || "-"}</p>
              <p><span className="font-medium">Owner:</span> {detail.ownerName}</p>
            </>
          ) : null}
        </div>
      }
      timeline={
        <div className="space-y-2 text-sm">
          {loading ? <p className="text-muted-foreground">Loading timeline...</p> : null}
          {!loading && data.timeline.length === 0 ? <p className="text-muted-foreground">No timeline events.</p> : null}
          {data.timeline.map((item) => (
            <div key={item.id} className="rounded-md border p-3">
              <p>{item.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{new Date(item.timestamp).toLocaleString()}</p>
            </div>
          ))}
        </div>
      }
      linked={
        <div className="space-y-2 text-sm">
          {loading ? <p className="text-muted-foreground">Loading linked entities...</p> : null}
          {!loading && data.linked.length === 0 ? <p className="text-muted-foreground">No linked records.</p> : null}
          {data.linked.map((item) => (
            <p key={item.id} className="rounded-md border p-3">{item.type}: {item.label}</p>
          ))}
        </div>
      }
      activity={
        <div className="space-y-2 text-sm">
          <p className="rounded-md border p-3">Deal transitions emit lifecycle and audit events.</p>
        </div>
      }
    />
  );
}
