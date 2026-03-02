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
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPipelineBoard,
  getDealDrawerData,
  markDealWon,
  moveDeal,
  type DealCard,
  type DealDrawerData,
  type PipelineBoard,
  type PipelineStage,
} from "@/api/services";
import { LifecycleBanner } from "@/components/shared/lifecycle-banner";
import { ObjectDrawer } from "@/components/shared/object-drawer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const emptyBoard: PipelineBoard = { pipelineId: "", stages: [] };
const emptyDealDrawerData: DealDrawerData = { timeline: [], linked: [] };

type SelectedDeal = {
  deal: DealCard;
  stage: PipelineStage;
};

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
    if (stage.deals.some((deal) => deal.id === dealId)) {
      return stage.id;
    }
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

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "cursor-pointer space-y-2 rounded-md border bg-white p-2 text-sm",
        isDragging && "z-50 opacity-60 shadow-xl",
      )}
      onClick={onSelect}
      {...attributes}
      {...listeners}
    >
      <p className="font-medium">{deal.title}</p>
      <p className="text-xs text-muted-foreground">{deal.companyName || "Unassigned company"}</p>
      <p className="text-xs text-muted-foreground">Value: {deal.value.toLocaleString()}</p>
      {deal.atRisk ? <p className="text-xs font-medium text-amber-700">At risk</p> : null}

      <div className="flex flex-wrap gap-1">
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
    <article
      ref={setNodeRef}
      className={cn(
        "flex min-h-64 flex-col rounded-lg border bg-white p-3 transition-colors",
        isOver && "border-primary bg-slate-50",
      )}
    >
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
  const navigate = useNavigate();
  const [board, setBoard] = useState<PipelineBoard>(emptyBoard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyDealId, setBusyDealId] = useState<string | null>(null);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [createdCaseId, setCreatedCaseId] = useState<string | null>(null);
  const [dealDrawerData, setDealDrawerData] = useState<DealDrawerData>(emptyDealDrawerData);
  const [dealDrawerLoading, setDealDrawerLoading] = useState(false);

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

  const stageSteps = useMemo(() => board.stages.map((stage) => stage.name), [board.stages]);

  const selected = useMemo<SelectedDeal | null>(() => {
    if (!selectedDealId) return null;

    for (const stage of board.stages) {
      const deal = stage.deals.find((item) => item.id === selectedDealId);
      if (deal) {
        return { deal, stage };
      }
    }
    return null;
  }, [board.stages, selectedDealId]);

  useEffect(() => {
    if (!selectedDealId) {
      setDealDrawerData(emptyDealDrawerData);
      return;
    }

    const loadDrawerData = async () => {
      setDealDrawerLoading(true);
      try {
        setDealDrawerData(await getDealDrawerData(selectedDealId));
      } catch {
        setDealDrawerData(emptyDealDrawerData);
      } finally {
        setDealDrawerLoading(false);
      }
    };

    void loadDrawerData();
  }, [selectedDealId]);

  const persistMove = async (dealId: string, toStageId: string) => {
    const previous = board;
    setBusyDealId(dealId);
    setError(null);
    setBoard((current) => moveDealInBoard(current, dealId, toStageId));

    try {
      await moveDeal(dealId, toStageId);
    } catch (err) {
      setBoard(previous);
      setError(err instanceof Error ? err.message : "Failed to move deal");
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
    setError(null);
    try {
      const result = await markDealWon(dealId);
      setCreatedCaseId(result.caseId);
      setBoard(await getPipelineBoard());
      setSelectedDealId(null);
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
        <p className="text-sm text-muted-foreground">Drag deals across lifecycle stages with controlled transitions.</p>
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
                    onSelect={() => setSelectedDealId(deal.id)}
                    onMarkWon={() => handleMarkWon(deal.id)}
                  />
                ))}
              </StageColumn>
            ))}
          </div>
        </DndContext>
      ) : null}

      <ObjectDrawer
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedDealId(null);
          }
        }}
        title={selected?.deal.title ?? "Deal"}
        status={(selected?.stage.name ?? "PROSPECT").toUpperCase().replaceAll(" ", "_")}
        lifecycleSteps={stageSteps.length > 0 ? stageSteps : ["Prospect", "Qualified", "Proposal", "Negotiation", "Won/Lost"]}
        currentStatus={selected?.stage.name ?? "Prospect"}
        primaryAction={
          <Button
            size="sm"
            disabled={!selected || busyDealId === selected.deal.id}
            onClick={() => selected && void handleMarkWon(selected.deal.id)}
          >
            {busyDealId === selected?.deal.id ? "Saving..." : "Mark Won"}
          </Button>
        }
        overview={
          <div className="space-y-3 text-sm">
            <p><span className="font-medium">Deal ID:</span> {selected?.deal.id}</p>
            <p><span className="font-medium">Company:</span> {selected?.deal.companyName || "Unassigned"}</p>
            <p><span className="font-medium">Value:</span> {selected ? selected.deal.value.toLocaleString() : "-"}</p>
            <LifecycleBanner
              steps={stageSteps.length > 0 ? stageSteps : ["Prospect", "Qualified", "Proposal", "Negotiation", "Won/Lost"]}
              currentStatus={selected?.stage.name ?? "Prospect"}
            />
          </div>
        }
        timeline={
          <div className="space-y-2 text-sm">
            <p className="rounded-md border p-3">Deal entered stage: {selected?.stage.name ?? "Prospect"}.</p>
            <p className="rounded-md border p-3">Stage changes persist to backend with rollback on failure.</p>
            {dealDrawerLoading ? <p className="text-muted-foreground">Loading timeline...</p> : null}
            {!dealDrawerLoading && dealDrawerData.timeline.length === 0 ? (
              <p className="text-muted-foreground">No timeline events returned by backend.</p>
            ) : null}
            {dealDrawerData.timeline.map((event) => (
              <div key={event.id} className="rounded-md border p-3">
                <p>{event.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{new Date(event.timestamp).toLocaleString()}</p>
              </div>
            ))}
          </div>
        }
        linked={
          <div className="space-y-2 text-sm">
            <p className="rounded-md border p-3">Linked Case: {createdCaseId ?? "None yet"}</p>
            {dealDrawerLoading ? <p className="text-muted-foreground">Loading linked records...</p> : null}
            {!dealDrawerLoading && dealDrawerData.linked.length === 0 ? (
              <p className="text-muted-foreground">No linked records returned by backend.</p>
            ) : null}
            {dealDrawerData.linked.map((item) => (
              <p key={item.id} className="rounded-md border p-3">
                {item.type}: {item.label}
              </p>
            ))}
          </div>
        }
        financial={
          <div className="space-y-2 text-sm">
            <p className="rounded-md border p-3">Pipeline Value: {selected ? selected.deal.value.toLocaleString() : "-"}</p>
            <p className="rounded-md border p-3">Forecast: Derived from active stage placement.</p>
          </div>
        }
      />
    </section>
  );
}
