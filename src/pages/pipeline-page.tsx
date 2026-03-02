import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPipelineBoard, markDealWon, moveDeal, type PipelineBoard, type PipelineStage } from "@/api/services";
import { LifecycleBanner } from "@/components/shared/lifecycle-banner";
import { ObjectDrawer } from "@/components/shared/object-drawer";
import { Button } from "@/components/ui/button";

const emptyBoard: PipelineBoard = { pipelineId: "", stages: [] };

function moveDealInBoard(board: PipelineBoard, dealId: string, toStageId: string): PipelineBoard {
  const next: PipelineBoard = {
    pipelineId: board.pipelineId,
    stages: board.stages.map((stage) => ({ ...stage, deals: [...stage.deals] })),
  };

  let dealToMove: PipelineStage["deals"][number] | null = null;
  let fromStageId = "";

  for (const stage of next.stages) {
    const dealIndex = stage.deals.findIndex((deal) => deal.id === dealId);
    if (dealIndex >= 0) {
      dealToMove = stage.deals[dealIndex];
      fromStageId = stage.id;
      stage.deals.splice(dealIndex, 1);
      break;
    }
  }

  if (!dealToMove || fromStageId === toStageId) return board;

  const targetStage = next.stages.find((stage) => stage.id === toStageId);
  if (!targetStage) return board;

  targetStage.deals.push(dealToMove);
  return next;
}

export function PipelinePage() {
  const navigate = useNavigate();
  const [board, setBoard] = useState<PipelineBoard>(emptyBoard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyDealId, setBusyDealId] = useState<string | null>(null);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const [createdCaseId, setCreatedCaseId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        setBoard(await getPipelineBoard());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load pipeline board");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const stageIndexById = useMemo(() => {
    const map = new Map<string, number>();
    board.stages.forEach((stage, index) => map.set(stage.id, index));
    return map;
  }, [board.stages]);

  const stageSteps = useMemo(() => board.stages.map((stage) => stage.name), [board.stages]);

  const selectedStage = useMemo(
    () => board.stages.find((stage) => stage.id === selectedStageId) ?? null,
    [board.stages, selectedStageId],
  );
  const selectedDeal = useMemo(
    () => selectedStage?.deals.find((deal) => deal.id === selectedDealId) ?? null,
    [selectedDealId, selectedStage],
  );

  const handleMove = async (dealId: string, currentStageId: string, direction: -1 | 1) => {
    const currentIndex = stageIndexById.get(currentStageId);
    if (currentIndex === undefined) return;
    const targetStage = board.stages[currentIndex + direction];
    if (!targetStage) return;

    const previous = board;
    setBusyDealId(dealId);
    setError(null);
    setBoard((current) => moveDealInBoard(current, dealId, targetStage.id));

    try {
      await moveDeal(dealId, targetStage.id);
    } catch (err) {
      setBoard(previous);
      setError(err instanceof Error ? err.message : "Failed to move deal");
    } finally {
      setBusyDealId(null);
    }
  };

  const handleMarkWon = async (dealId: string) => {
    setBusyDealId(dealId);
    setError(null);
    try {
      const result = await markDealWon(dealId);
      setCreatedCaseId(result.caseId);
      setBoard(await getPipelineBoard());
      setSelectedDealId(null);
      setSelectedStageId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark deal won");
    } finally {
      setBusyDealId(null);
    }
  };

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-2xl font-semibold">Pipeline</h2>
        <p className="text-sm text-muted-foreground">Lifecycle movement across deal stages with controlled transitions.</p>
      </header>

      {error ? <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">{error}</p> : null}
      {createdCaseId ? (
        <div className="flex items-center justify-between rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          <p>Deal marked won. Linked case created: {createdCaseId}</p>
          <Button size="sm" variant="secondary" onClick={() => navigate(`/cases?caseId=${encodeURIComponent(createdCaseId)}`)}>
            Open Case
          </Button>
        </div>
      ) : null}
      {loading ? <p className="rounded-md border bg-white px-3 py-2 text-sm text-muted-foreground">Loading pipeline board...</p> : null}

      {!loading ? (
        <div className="grid gap-4 lg:grid-cols-3 xl:grid-cols-5">
          {board.stages.map((stage) => (
            <article key={stage.id} className="flex min-h-64 flex-col rounded-lg border bg-white p-3">
              <div className="mb-3 flex items-center justify-between border-b pb-2">
                <h3 className="text-sm font-semibold">{stage.name}</h3>
                <span className="text-xs text-muted-foreground">{stage.deals.length}</span>
              </div>

              <div className="space-y-2">
                {stage.deals.length === 0 ? <p className="text-xs text-muted-foreground">No deals</p> : null}
                {stage.deals.map((deal) => {
                  const stageIndex = stageIndexById.get(stage.id) ?? 0;
                  const hasLeft = stageIndex > 0;
                  const hasRight = stageIndex < board.stages.length - 1;
                  const isBusy = busyDealId === deal.id;

                  return (
                    <div
                      key={deal.id}
                      className="cursor-pointer space-y-2 rounded-md border p-2 text-sm hover:bg-slate-50"
                      onClick={() => {
                        setSelectedDealId(deal.id);
                        setSelectedStageId(stage.id);
                      }}
                    >
                      <p className="font-medium">{deal.title}</p>
                      <p className="text-xs text-muted-foreground">{deal.companyName || "Unassigned company"}</p>
                      <p className="text-xs text-muted-foreground">Value: {deal.value.toLocaleString()}</p>

                      <div className="flex flex-wrap gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={!hasLeft || isBusy}
                          onClick={(event) => {
                            event.stopPropagation();
                            void handleMove(deal.id, stage.id, -1);
                          }}
                        >
                          Back
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={!hasRight || isBusy}
                          onClick={(event) => {
                            event.stopPropagation();
                            void handleMove(deal.id, stage.id, 1);
                          }}
                        >
                          Forward
                        </Button>
                        <Button
                          size="sm"
                          disabled={isBusy}
                          onClick={(event) => {
                            event.stopPropagation();
                            void handleMarkWon(deal.id);
                          }}
                        >
                          Won
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      ) : null}

      <ObjectDrawer
        open={Boolean(selectedDeal && selectedStage)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedDealId(null);
            setSelectedStageId(null);
          }
        }}
        title={selectedDeal?.title ?? "Deal"}
        status={(selectedStage?.name ?? "PROSPECT").toUpperCase().replaceAll(" ", "_")}
        lifecycleSteps={stageSteps.length > 0 ? stageSteps : ["Prospect", "Qualified", "Proposal", "Negotiation", "Won/Lost"]}
        currentStatus={selectedStage?.name ?? "Prospect"}
        primaryAction={
          <Button
            size="sm"
            disabled={!selectedDeal || busyDealId === selectedDeal.id}
            onClick={() => selectedDeal && void handleMarkWon(selectedDeal.id)}
          >
            {busyDealId === selectedDeal?.id ? "Saving..." : "Mark Won"}
          </Button>
        }
        overview={
          <div className="space-y-3 text-sm">
            <p><span className="font-medium">Deal ID:</span> {selectedDeal?.id}</p>
            <p><span className="font-medium">Company:</span> {selectedDeal?.companyName || "Unassigned"}</p>
            <p><span className="font-medium">Value:</span> {selectedDeal ? selectedDeal.value.toLocaleString() : "-"}</p>
            <LifecycleBanner
              steps={stageSteps.length > 0 ? stageSteps : ["Prospect", "Qualified", "Proposal", "Negotiation", "Won/Lost"]}
              currentStatus={selectedStage?.name ?? "Prospect"}
            />
          </div>
        }
        timeline={
          <div className="space-y-2 text-sm">
            <p className="rounded-md border p-3">Deal entered stage: {selectedStage?.name ?? "Prospect"}.</p>
            <p className="rounded-md border p-3">Latest update synced from pipeline board.</p>
          </div>
        }
        linked={
          <div className="space-y-2 text-sm">
            <p className="rounded-md border p-3">Linked Case: {createdCaseId ?? "None yet"}</p>
            <p className="rounded-md border p-3">Linked Documents: Not connected in this phase.</p>
          </div>
        }
        financial={
          <div className="space-y-2 text-sm">
            <p className="rounded-md border p-3">Pipeline Value: {selectedDeal ? selectedDeal.value.toLocaleString() : "-"}</p>
            <p className="rounded-md border p-3">Forecast: Derived from active stage placement.</p>
          </div>
        }
      />
    </section>
  );
}
