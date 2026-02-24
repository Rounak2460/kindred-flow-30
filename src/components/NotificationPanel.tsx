import { useNavigate } from "react-router-dom";
import { MessageSquare, ArrowUp, Check, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Notification } from "@/hooks/useNotifications";

interface NotificationPanelProps {
  notifications: Notification[];
  loading: boolean;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

const typeIcon: Record<string, typeof MessageSquare> = {
  comment: MessageSquare,
  upvote: ArrowUp,
  reply: MessageSquare,
  message: MessageCircle,
};

export default function NotificationPanel({
  notifications,
  loading,
  onMarkRead,
  onMarkAllRead,
}: NotificationPanelProps) {
  const navigate = useNavigate();

  const handleClick = (n: Notification) => {
    if (!n.is_read) onMarkRead(n.id);
    if (n.type === "message") {
      navigate("/chat");
    } else if (n.post_id) {
      navigate(`/post/${n.post_id}`);
    }
  };

  return (
    <div className="flex flex-col max-h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
        {notifications.some((n) => !n.is_read) && (
          <button
            onClick={onMarkAllRead}
            className="text-[11px] font-medium text-primary hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="overflow-y-auto flex-1">
        {loading ? (
          <div className="p-6 text-center text-xs text-muted-foreground">Loading…</div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">No notifications yet</div>
        ) : (
          notifications.map((n) => {
            const Icon = typeIcon[n.type] || MessageSquare;
            return (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={cn(
                  "w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors border-b border-border/40 last:border-0",
                  !n.is_read && "bg-primary/5"
                )}
              >
                <div className={cn(
                  "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                  n.type === "upvote" ? "bg-green-500/10 text-green-500" : n.type === "message" ? "bg-blue-500/10 text-blue-500" : "bg-primary/10 text-primary"
                )}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{n.title}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{n.body}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">{timeAgo(n.created_at)}</p>
                </div>
                {!n.is_read && (
                  <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
