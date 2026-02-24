import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useMessages, useSendMessage, useMarkRead } from "@/hooks/useChat";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDateSep(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Today";
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function ChatConversation() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: messages = [], isLoading } = useMessages(conversationId);
  const sendMessage = useSendMessage();
  const markRead = useMarkRead(conversationId);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const [otherName, setOtherName] = useState("");

  useEffect(() => { if (!authLoading && !user) navigate("/auth"); }, [authLoading, user, navigate]);

  // Fetch other participant's name
  useEffect(() => {
    if (!conversationId || !user) return;
    (async () => {
      const { data: parts } = await supabase
        .from("conversation_participants")
        .select("user_id")
        .eq("conversation_id", conversationId)
        .neq("user_id", user.id);
      if (parts?.length) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("name")
          .eq("user_id", parts[0].user_id)
          .maybeSingle();
        setOtherName(prof?.name || "User");
      }
    })();
  }, [conversationId, user]);

  // Mark as read on mount and when new messages arrive
  useEffect(() => { markRead(); }, [messages.length, markRead]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = () => {
    if (!text.trim() || !conversationId) return;
    const body = text.trim();
    sendMessage.mutate(
      { conversationId, body },
      {
        onSuccess: () => setText(""),
        onError: (e: any) => toast.error(e.message || "Failed to send message"),
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // Group messages by date
  let lastDate = "";

  return (
    <div className="flex flex-col h-[calc(100dvh-3.5rem-3.5rem)] md:h-[calc(100dvh-3.5rem)] max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
        <button onClick={() => navigate("/chat")} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-sm font-semibold text-foreground">{otherName || "Chat"}</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
        {isLoading ? (
          <div className="space-y-3 py-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 rounded-xl w-3/4" />)}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-muted-foreground">Send a message to start the conversation</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender_id === user?.id;
            const dateStr = formatDateSep(msg.created_at);
            let showDate = false;
            if (dateStr !== lastDate) { showDate = true; lastDate = dateStr; }
            return (
              <div key={msg.id}>
                {showDate && (
                  <div className="flex justify-center my-3">
                    <span className="text-[10px] text-muted-foreground/50 bg-muted px-2.5 py-0.5 rounded-full">{dateStr}</span>
                  </div>
                )}
                <div className={cn("flex mb-1", isMine ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm",
                    isMine
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  )}>
                    <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                    <p className={cn("text-[9px] mt-0.5", isMine ? "text-primary-foreground/60" : "text-muted-foreground/60")}>{formatTime(msg.created_at)}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border bg-card">
        <div className="flex items-center gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            rows={1}
            className="flex-1 resize-none bg-muted rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground/50"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sendMessage.isPending}
            className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 transition-opacity"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
