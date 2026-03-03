import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type LifecycleStep = {
  key: string;
  label: string;
};

type LifecycleBannerProps = {
  steps: LifecycleStep[];
  activeKey: string;
  doneKeys?: string[];
};

export function LifecycleBanner({ steps, activeKey, doneKeys = [] }: LifecycleBannerProps) {
  return (
    <div className="rounded-lg border bg-white/80 p-2.5 shadow-sm">
      <ol className="flex flex-wrap items-center gap-2">
        {steps.map((step, index) => {
          const isActive = step.key === activeKey;
          const isDone = doneKeys.includes(step.key);
          return (
            <li key={step.key} className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium",
                  isActive && "border-primary bg-primary text-primary-foreground shadow-sm",
                  isDone && "border-slate-300 bg-slate-100 text-slate-700",
                  !isActive && !isDone && "border-slate-300 bg-white text-slate-600",
                )}
              >
                {isDone ? <Check className="h-3 w-3" /> : null}
                {step.label}
              </span>
              {index < steps.length - 1 ? <span className="h-px w-5 bg-slate-300" /> : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
