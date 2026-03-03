import { createContext, type PropsWithChildren, useCallback, useContext, useMemo, useState } from "react";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";

type ToastTone = "neutral" | "success" | "warning" | "danger";

type ToastItem = {
  id: string;
  message: string;
  tone: ToastTone;
};

type ToastContextValue = {
  pushToast: (message: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const pushToast = useCallback((message: string, tone: ToastTone = "neutral") => {
    const next: ToastItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      message,
      tone,
    };
    setItems((current) => [next, ...current].slice(0, 4));

    window.setTimeout(() => {
      setItems((current) => current.filter((item) => item.id !== next.id));
    }, 3200);
  }, []);

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster position="bottom-right" richColors closeButton />
      <div className="pointer-events-none fixed bottom-4 right-4 z-[70] flex w-full max-w-sm flex-col gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "rounded-md border px-3 py-2 text-sm shadow-lg",
              item.tone === "neutral" && "border-slate-300 bg-white text-slate-900",
              item.tone === "success" && "border-emerald-300 bg-emerald-50 text-emerald-900",
              item.tone === "warning" && "border-amber-300 bg-amber-50 text-amber-900",
              item.tone === "danger" && "border-rose-300 bg-rose-50 text-rose-900",
            )}
          >
            {item.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useAppToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useAppToast must be used within ToastProvider");
  }
  return context;
}
