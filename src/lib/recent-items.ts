export type RecentItemType = "Case" | "Deal" | "Task" | "Approval" | "Invoice" | "Company";

export type RecentItem = {
  type: RecentItemType;
  id: string;
  label: string;
  ts: number;
};

const KEY = "novatrai_recent_items";
const MAX_ITEMS = 10;

export function getRecentItems(): RecentItem[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as RecentItem[];
  } catch {
    return [];
  }
}

export function recordRecentItem(type: RecentItemType, id: string, label: string) {
  const next: RecentItem = {
    type,
    id,
    label,
    ts: Date.now(),
  };

  const current = getRecentItems();
  const deduped = current.filter((item) => !(item.type === type && item.id === id));
  const merged = [next, ...deduped].slice(0, MAX_ITEMS);

  try {
    window.localStorage.setItem(KEY, JSON.stringify(merged));
  } catch {
    // Ignore storage issues.
  }
}
