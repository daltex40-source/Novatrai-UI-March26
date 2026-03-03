import {
  DndContext,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { type ReactNode, useEffect, useState } from "react";
import { ApiError } from "@/api/client";
import { getPipelineBoard, markDealWon, moveDeal, type DealCard, type PipelineBoard, type PipelineStage } from "@/api/services";
import { useObjectDrawers } from "@/components/layout/object-drawer-provider";
import {
  NeedsAttentionFlag,
  SignalStack,
  StuckBadge,
  getAgeDays,
  getDealHeatClass,
} from "@/components/shared/operational-signals";
import { useAppToast } from "@/components/layout/toast-provider";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const emptyBoard: PipelineBoard = { pipelineId: "", stages: [] };
const CONFLICT_TOAST_MESSAGE = "Update conflict detected. Another change was saved first. Refresh and try again.";

function moveDealInBoard(board: PipelineBoard, dealId: string, toStageId: string): PipelineBoard {
  const next: PipelineBoard = {
    pipelineId: board.pipelineId,
    stages: board.stages.map((stage) => ({ ...stage, deals: [...stage.deals] })),
  };

  let dealToMove: DealCard | null = null;
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

function findDealStage(board: PipelineBoard, dealId: string): string | null {
  for (const stage of board.stages) {
    if (stage.deals.some((deal) => deal.id === dealId)) return stage.id;
  }
  return null;
}

type DealCardProps = {
  deal: DealCard;
  stageId: string;
  isBusy: boolean;
  onSelect: () => void;
  onMarkWon: () => void;
};

function DraggableDealCard({ deal, stageId, isBusy, onSelect, onMarkWon }: DealCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: deal.id,
    data: { stageId },
    disabled: isBusy,
  });

  const ageDays = deal.ageDays ?? getAgeDays(deal.createdAt);
  const cardHeatClass = getDealHeatClass({ atRisk: deal.atRisk, ageDays });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn("cursor-pointer space-y-2 rounded-md border p-2 text-sm transition-colors", cardHeatClass, isDragging && "z-50 opacity-60 shadow-xl")}
      onClick={onSelect}
      {...attributes}
      {...listeners}
    >
      <p className="font-medium">{deal.title}</p>
      <p className="text-xs text-muted-foreground">{deal.companyName || "Unassigned company"}</p>
      <p className="text-xs text-muted-foreground">Value: {deal.value.toLocaleString()}</p>
      <SignalStack>
        <NeedsAttentionFlag show={deal.atRisk} label="At risk" />
        <StuckBadge since={deal.createdAt} thresholdDays={14} />
      </SignalStack>
      <Button
        size="sm"
        onClick={(event) => {
          event.stopPropagation();
          void onMarkWon();
        }}
        disabled={isBusy}
      >
        Won
      </Button>
    </div>
  );
}

type StageColumnProps = {
  stage: PipelineStage;
  children: ReactNode;
};

function StageColumn({ stage, children }: StageColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });
  return (
    <article ref={setNodeRef} className={cn("flex min-h-64 flex-col rounded-lg border bg-white p-3", isOver && "border-primary bg-slate-50")}>
      <div className="mb-3 flex items-center justify-between border-b pb-2">
        <h3 className="text-sm font-semibold">{stage.name}</h3>
        <span className="text-xs text-muted-foreground">{stage.deals.length}</span>
      </div>
      <div className="space-y-2">
        {stage.deals.length === 0 ? <p className="text-xs text-muted-foreground">Drop deals here</p> : null}
        {children}
      </div>
    </article>
  );
}

export function PipelinePage() {
  const { openDeal, openCase } = useObjectDrawers();
  const { pushToast } = useAppToast();
  const [board, setBoard] = useState<PipelineBoard>(emptyBoard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyDealId, setBusyDealId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

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

  const persistMove = async (dealId: string, toStageId: string) => {
    const previous = board;
    setBusyDealId(dealId);
    setBoard((current) => moveDealInBoard(current, dealId, toStageId));
    try {
      await moveDeal(dealId, toStageId);
    } catch (err) {
      setBoard(previous);
      if (err instanceof ApiError && err.status === 409) {
        pushToast(CONFLICT_TOAST_MESSAGE, "warning");
      } else {
        pushToast(err instanceof Error ? err.message : "Failed to move deal", "danger");
      }
    } finally {
      setBusyDealId(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const dealId = String(event.active.id);
    if (!event.over) return;
    const toStageId = String(event.over.id);
    const fromStageId = findDealStage(board, dealId);
    if (!fromStageId || fromStageId === toStageId) return;
    void persistMove(dealId, toStageId);
  };

  const handleMarkWon = async (dealId: string) => {
    setBusyDealId(dealId);
    try {
      const result = await markDealWon(dealId);
      pushToast("Deal marked won", "success");
      setBoard(await getPipelineBoard());
      if (result.caseId) openCase(result.caseId);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        pushToast(CONFLICT_TOAST_MESSAGE, "warning");
      } else {
        pushToast(err instanceof Error ? err.message : "Failed to mark won", "danger");
      }
    } finally {
      setBusyDealId(null);
    }
  };

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-2xl font-semibold">Pipeline</h2>
        <p className="text-sm text-muted-foreground">Drag deals across lifecycle stages with controlled transitions.</p>
      </header>

      {error ? <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">{error}</p> : null}
      {loading ? (
        <div className="grid gap-4 lg:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={`pipeline-skeleton-${index}`} className="rounded-lg border bg-white p-3">
              <Skeleton className="mb-3 h-4 w-24" />
              <div className="space-y-2">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {!loading ? (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="grid gap-4 lg:grid-cols-3 xl:grid-cols-5">
            {board.stages.map((stage) => (
              <StageColumn key={stage.id} stage={stage}>
                {stage.deals.map((deal) => (
                  <DraggableDealCard
                    key={deal.id}
                    deal={deal}
                    stageId={stage.id}
                    isBusy={busyDealId === deal.id}
                    onSelect={() => openDeal(deal.id)}
                    onMarkWon={() => handleMarkWon(deal.id)}
                  />
                ))}
              </StageColumn>
            ))}
          </div>
        </DndContext>
      ) : null}
    </section>
  );
}
