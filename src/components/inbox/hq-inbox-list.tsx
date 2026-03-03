import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

type HQInboxListItem = {
  id: string;
  title: string;
  context: string;
  age: string;
};

type HQInboxListProps = {
  badgeLabel: string;
  items: HQInboxListItem[];
  loading: boolean;
  error?: string;
  emptyLabel: string;
  viewAllLabel: string;
  onOpenItem: (item: HQInboxListItem) => void;
  onViewAll: () => void;
  onRetry: () => void;
};

function SkeletonRows() {
  return (
    <div className="space-y-3 p-1">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="space-y-2 rounded-md border bg-white p-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      ))}
    </div>
  );
}

export function HQInboxList({
  badgeLabel,
  items,
  loading,
  error,
  emptyLabel,
  viewAllLabel,
  onOpenItem,
  onViewAll,
  onRetry,
}: HQInboxListProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ScrollArea className="min-h-0 flex-1 pr-1">
        {loading ? <SkeletonRows /> : null}

        {!loading && error ? (
          <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            <p>{error}</p>
            <Button size="sm" variant="secondary" className="mt-2" onClick={onRetry}>
              Retry
            </Button>
          </div>
        ) : null}

        {!loading && !error && items.length === 0 ? (
          <p className="rounded-md border bg-white p-4 text-sm text-muted-foreground">{emptyLabel}</p>
        ) : null}

        {!loading && !error && items.length > 0 ? (
          <div className="space-y-2 p-1">
            {items.map((item, index) => (
              <div key={item.id}>
                <div className="flex items-start gap-3 rounded-md border bg-white p-3">
                  <div className="pt-0.5">
                    <Badge variant="muted">{badgeLabel}</Badge>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{item.context}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{item.age}</span>
                    <Button size="sm" variant="ghost" onClick={() => onOpenItem(item)}>
                      Open <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                {index < items.length - 1 ? <Separator className="my-2" /> : null}
              </div>
            ))}
          </div>
        ) : null}
      </ScrollArea>

      <Separator className="my-3" />

      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={onViewAll}>
          {viewAllLabel}
        </Button>
      </div>
    </div>
  );
}
