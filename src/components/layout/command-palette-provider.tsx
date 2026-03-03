import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";

type CommandPaletteContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null);

export function CommandPaletteProvider({ children }: PropsWithChildren) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isOpenShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (isOpenShortcut) {
        event.preventDefault();
        setOpen((current) => !current);
      }
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const value = useMemo(() => ({ open, setOpen }), [open]);

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
      {open ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/20 p-6 pt-24" onClick={() => setOpen(false)}>
          <div className="w-full max-w-2xl rounded-lg border bg-white p-4 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Command Palette</p>
            <p className="mt-2 text-sm font-medium">Foundation active (Ctrl/Cmd+K).</p>
            <p className="mt-1 text-sm text-muted-foreground">Actions and searchable commands will be added in a dedicated implementation pass.</p>
          </div>
        </div>
      ) : null}
    </CommandPaletteContext.Provider>
  );
}

export function useCommandPalette() {
  const context = useContext(CommandPaletteContext);
  if (!context) {
    throw new Error("useCommandPalette must be used within CommandPaletteProvider");
  }
  return context;
}
