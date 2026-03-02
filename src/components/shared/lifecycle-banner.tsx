import { cn } from "@/lib/utils";

type LifecycleBannerProps = {
  steps: string[];
  currentStatus: string;
};

export function LifecycleBanner({ steps, currentStatus }: LifecycleBannerProps) {
  const currentIndex = steps.findIndex((step) => step === currentStatus);

  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <ol className="flex flex-wrap gap-2 text-xs">
        {steps.map((step, index) => {
          const isDone = currentIndex > -1 && index < currentIndex;
          const isCurrent = step === currentStatus;
          return (
            <li
              key={step}
              className={cn(
                "rounded-md border px-2 py-1 font-medium",
                isCurrent && "border-primary bg-primary text-primary-foreground",
                isDone && "border-emerald-300 bg-emerald-50 text-emerald-900",
                !isDone && !isCurrent && "border-border bg-card text-muted-foreground",
              )}
            >
              {step.replaceAll("_", " ")}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
