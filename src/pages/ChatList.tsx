import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useConversations } from "@/hooks/useChat";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { useOnlinePresence } from "@/hooks/usePresence";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}

export default function ChatList() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { data: conversations = [], isLoading } = useConversations();
  const onlineUsers = useOnlinePresence();

  useEffect(() => { if (!loading && !user) navigate("/auth"); }, [loading, user, navigate]);

  if (isLoading || loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-xl font-semibold text-foreground mb-4">Messages</h1>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-muted/50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      <h1 className="text-xl font-semibold text-foreground mb-4">Messages</h1>

      {conversations.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-xl">
          <MessageCircle className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">No messages yet</p>
          <p className="text-xs text-muted-foreground">Start a conversation from someone's profile</p>
        </div>
      ) : (
        <div className="space-y-1">
          {conversations.map((conv) => {
            const initials = conv.other_user.name
              .split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "??";
            return (
              <button
                key={conv.id}
                onClick={() => navigate(`/chat/${conv.id}`)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors hover:bg-muted/50",
                  conv.unread && "bg-primary/5"
                )}
              >
                <div className="relative flex-shrink-0">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">{initials}</AvatarFallback>
                  </Avatar>
                  {onlineUsers.has(conv.other_user.user_id) && (
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-card" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={cn("text-sm font-medium", conv.unread && "text-foreground")}>{conv.other_user.name}</span>
                    {conv.last_message && (
                      <span className="text-[10px] text-muted-foreground flex-shrink-0">{timeAgo(conv.last_message.created_at)}</span>
                    )}
                  </div>
                  {conv.last_message && (
                    <p className={cn("text-xs truncate mt-0.5", conv.unread ? "text-foreground/80 font-medium" : "text-muted-foreground")}>
                      {conv.last_message.sender_id === user?.id ? "You: " : ""}{conv.last_message.body}
                    </p>
                  )}
                </div>
                {conv.unread && <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
