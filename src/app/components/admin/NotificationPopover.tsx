import {
  Bell,
  Check,
  X,
  CheckCheck,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { useNotifications } from "../../context/NotificationContext";
import { format, isToday, parseISO, isValid } from "date-fns";
import { useNavigate } from "react-router";

export function NotificationPopover() {
  const [open, setOpen] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const response = await apiClient.appointments.getAll();
      if (response.success && Array.isArray(response.data)) {
        // Filter valid dates and sort by date (newest first)
        // We keep a larger set to calculate counts accurately
        const sorted = response.data
          .filter(
            (item: any) =>
              item && (item.appointmentTime || item.date),
          )
          .sort((a: any, b: any) => {
            const dateStrA = a.appointmentTime || a.date;
            const dateStrB = b.appointmentTime || b.date;
            const dateA = new Date(dateStrA);
            const dateB = new Date(dateStrB);
            if (!isValid(dateA) || !isValid(dateB)) return 0;
            return dateB.getTime() - dateA.getTime();
          });

        // Take top 50 for display to avoid rendering performance issues if list is huge
        setActivities(sorted.slice(0, 50));

        // Calculate unread/pending count
        if (sorted.length > 0) {
          const lastSeenTime = localStorage.getItem(
            "bitcoin-nail-admin-last-seen-time",
          );

          let count = 0;
          if (!lastSeenTime) {
            // If never seen, count only pending appointments
            count = sorted.filter(
              (item: any) => item.status === "pending",
            ).length;
          } else {
            const lastSeenDate = new Date(lastSeenTime);
            count = sorted.filter((item: any) => {
              const itemDate = new Date(
                item.appointmentTime || item.date,
              );
              const isNew =
                itemDate.getTime() > lastSeenDate.getTime();
              const isPending = item.status === "pending";

              // Count if it's new AND pending, OR if it's still pending (unprocessed)
              return (isNew && isPending) || isPending;
            }).length;
          }

          // Only update count if we're not currently clearing it (though the effect below handles clearing "new" status)
          // Actually, we want to show the count even if open, if they are pending.
          setUnreadCount(count);
        }
      }
    } catch (error) {
      console.error("Failed to fetch activities", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchActivities();
    }
  }, [open]);

  // When opening, we update the "last seen" timestamp.
  // This effectively clears the "isNew" part of the count,
  // but "isPending" items will still be counted in the next fetch/render.
  useEffect(() => {
    if (open && activities.length > 0) {
      const latestItem = activities[0];
      const latestTime =
        latestItem.appointmentTime || latestItem.date;
      localStorage.setItem(
        "bitcoin-nail-admin-last-seen-time",
        latestTime,
      );

      // We trigger a re-calculation by fetching (or we could calc locally)
      // For simplicity, let's just re-run the count logic on the existing data
      const lastSeenDate = new Date(latestTime);
      const count = activities.filter((item: any) => {
        const itemDate = new Date(
          item.appointmentTime || item.date,
        );
        // After updating lastSeen, isNew will be false for current items (except maybe slightly newer ones that came in ms later)
        // So mostly this counts pending items.
        return item.status === "pending";
      }).length;

      setUnreadCount(count);
    }
  }, [open, activities]);

  // Initial fetch
  useEffect(() => {
    fetchActivities();
  }, []);

  // Listen for realtime updates
  useEffect(() => {
    const handleUpdate = () => {
      fetchActivities();
    };
    window.addEventListener("booking-update", handleUpdate);
    return () =>
      window.removeEventListener(
        "booking-update",
        handleUpdate,
      );
  }, [open]);

  const formatDateDisplay = (dateStr: string) => {
    try {
      if (!dateStr) return "Date unknown";
      const date = new Date(dateStr);
      if (!isValid(date)) return "Invalid date";

      return isToday(date)
        ? `Today, ${format(date, "HH:mm")}`
        : format(date, "MMM d, HH:mm");
    } catch (e) {
      return "Date error";
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-gray-900 relative"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-2 flex h-5 min-w-[1.25rem] px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white animate-in zoom-in">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h4 className="font-semibold text-sm">
            Notifications
          </h4>
          <span className="text-xs text-gray-500">
            Recent Activity
          </span>
        </div>
        <ScrollArea className="h-[300px]">
          {loading && activities.length === 0 ? (
            <div className="flex flex-col gap-2 p-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-12 bg-gray-100 animate-pulse rounded-md"
                />
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
              <Bell className="h-8 w-8 mb-2 opacity-20" />
              <p className="text-sm">No recent activity</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {activities.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setOpen(false);
                    navigate("/admin/appointments");
                  }}
                  className="flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                >
                  <div
                    className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                      item.status === "confirmed"
                        ? "bg-green-500"
                        : item.status === "pending"
                          ? "bg-orange-500"
                          : "bg-gray-300"
                    }`}
                  />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {item.customerName ||
                        item.customer_name ||
                        "New Customer"}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {item.serviceNames?.join(", ") ||
                        "Service booking"}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                      <Clock className="h-3 w-3" />
                      <span>
                        {formatDateDisplay(
                          item.appointmentTime || item.date,
                        )}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[9px] uppercase ${
                          item.status === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}