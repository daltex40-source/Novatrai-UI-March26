import { useEffect, useState } from "react";
import { toast } from "sonner";
import { searchCompanies, shouldShowCompaniesOfflineToast, type Company } from "@/api/companies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CompanyPickerProps = {
  label: string;
  selected: Company | null;
  onSelect: (company: Company) => void;
  onClear?: () => void;
  onCreateCompany: () => void;
  onFreeTextChange?: (value: string) => void;
};

export function CompanyPicker({ label, selected, onSelect, onClear, onCreateCompany, onFreeTextChange }: CompanyPickerProps) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selected) setQuery(selected.name);
  }, [selected]);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setItems([]);
      return;
    }

    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const result = await searchCompanies(query.trim(), 8);
        setItems(result.items);
        if (result.source === "demo" && shouldShowCompaniesOfflineToast()) {
          toast("Companies running in offline mode");
        }
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => window.clearTimeout(timer);
  }, [query]);

  return (
    <div className="space-y-2">
      <Input
        placeholder={`${label}: search companies...`}
        value={query}
        onChange={(event) => {
          onClear?.();
          const next = event.target.value;
          setQuery(next);
          onFreeTextChange?.(next);
        }}
      />
      {selected ? <p className="text-xs text-muted-foreground">Selected: {selected.name}</p> : null}
      {loading ? <p className="text-xs text-muted-foreground">Searching companies...</p> : null}
      {items.length > 0 ? (
        <div className="max-h-28 space-y-1 overflow-y-auto rounded-md border bg-white p-1">
          {items.map((item) => (
            <button
              key={item.id}
              className="w-full rounded px-2 py-1 text-left text-xs hover:bg-slate-50"
              onClick={() => {
                onSelect(item);
                setQuery(item.name);
                onFreeTextChange?.(item.name);
                setItems([]);
              }}
            >
              {item.name}
            </button>
          ))}
        </div>
      ) : null}
      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={onCreateCompany}>
        Create company...
      </Button>
    </div>
  );
}
