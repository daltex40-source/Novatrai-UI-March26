import { Bell } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getNotificationCenterData, type NotificationCenterData } from "@/api/services";
import { cn } from "@/lib/utils";

const emptyNotifications: NotificationCenterData = {
  unreadCount: 0,
  items: [],
};

export function NotificationCenter() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<NotificationCenterData>(emptyNotifications);
  const [loading, setLoading] = useState(false);

  const unreadLabel = useMemo(() => (data.unreadCount > 99 ? "99+" : String(data.unreadCount)), [data.unreadCount]);

  useEffect(() => {
    if (!open) return;

    const load = async () => {
      setLoading(true);
      try {
        setData(await getNotificationCenterData());
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [open]);

  return (
    <div className="relative">
      <button className="relative rounded-md p-2 hover:bg-muted" aria-label="Notifications" onClick={() => setOpen((current) => !current)}>
        <Bell className="h-4 w-4" />
        {data.unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
            {unreadLabel}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-96 rounded-lg border bg-white p-3 shadow-2xl">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Notifications</p>
            <span className="text-xs text-muted-foreground">{data.unreadCount} unread</span>
          </div>

          {loading ? <p className="p-2 text-sm text-muted-foreground">Loading notifications...</p> : null}
          {!loading && data.items.length === 0 ? <p className="p-2 text-sm text-muted-foreground">No new notifications.</p> : null}

          <div className="max-h-80 space-y-1 overflow-y-auto">
            {data.items.map((item) => (
              <button
                key={item.id}
                className={cn(
                  "w-full rounded-md border p-2 text-left text-sm hover:bg-slate-50",
                  item.unread && "border-slate-300",
                )}
                onClick={() => {
                  setOpen(false);
                  navigate(item.href);
                }}
              >
                <p className="font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.detail}</p>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
