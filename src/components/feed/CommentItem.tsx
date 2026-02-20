import { useState } from "react";
import { MessageSquare, ChevronDown, ChevronUp as ChevronUpIcon, MoreHorizontal, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/mock-data";
import type { MockComment } from "@/lib/types";
import VoteButtons from "./VoteButtons";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import AuthGuardDialog from "@/components/AuthGuardDialog";

interface CommentItemProps {
  comment: MockComment;
  depth?: number;
}

export default function CommentItem({ comment, depth = 0 }: CommentItemProps) {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const score = comment.upvote_count - comment.downvote_count;

  const handleReply = () => {
    if (replyText.trim()) {
      toast.success("Reply posted!");
      setReplyText("");
      setShowReply(false);
    }
  };

  const handleReplyClick = () => {
    if (!user) { setShowAuth(true); return; }
    setShowReply(!showReply);
  };

  return (
    <div className={cn("relative", depth > 0 && "ml-4")}>
      {depth > 0 && (
        <button onClick={() => setCollapsed(!collapsed)} className="absolute left-0 top-0 bottom-0 w-4 group">
          <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-border group-hover:bg-primary transition-colors" />
        </button>
      )}

      <div className={cn("py-2", depth > 0 && "pl-5")}>
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          {depth === 0 && (
            <button onClick={() => setCollapsed(!collapsed)} className="text-muted-foreground hover:text-foreground">
              {collapsed ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUpIcon className="h-3.5 w-3.5" />}
            </button>
          )}
          <span className="text-xs font-bold text-foreground hover:underline cursor-pointer">
            u/{comment.author_name?.replace(" ", "").toLowerCase()}
          </span>
          {comment.author_batch && (
            <span className="text-[10px] text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded-full">{comment.author_batch}</span>
          )}
          <span className="text-[11px] text-muted-foreground">• {timeAgo(comment.created_at)}</span>
        </div>

        {!collapsed && (
          <>
            <div className="mb-1.5">
              <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">{comment.body}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 text-xs">
              <VoteButtons score={score} onUpvote={() => {}} onDownvote={() => {}} size="sm" horizontal />
              <button
                onClick={handleReplyClick}
                className="flex items-center gap-1.5 text-muted-foreground hover:bg-accent px-2 py-1 rounded-full transition-colors font-medium"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Reply
              </button>
              <button
                onClick={() => { navigator.clipboard.writeText(comment.body); toast.success("Copied!"); }}
                className="flex items-center gap-1.5 text-muted-foreground hover:bg-accent px-2 py-1 rounded-full transition-colors"
              >
                <Share2 className="h-3.5 w-3.5" />
              </button>
              <button className="text-muted-foreground hover:bg-accent p-1 rounded-full transition-colors">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Reply input */}
            {showReply && (
              <div className="mt-2 mb-2 border border-border rounded-lg overflow-hidden">
                <textarea
                  className="w-full bg-secondary p-3 text-sm resize-none focus:outline-none placeholder:text-muted-foreground min-h-[80px]"
                  placeholder="What are your thoughts?"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={3}
                />
                <div className="flex justify-end gap-2 px-3 py-2 bg-secondary border-t border-border">
                  <button onClick={() => { setShowReply(false); setReplyText(""); }} className="text-xs font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-full hover:bg-accent transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={handleReply}
                    disabled={!replyText.trim()}
                    className="text-xs font-bold bg-primary text-primary-foreground px-4 py-1.5 rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reply
                  </button>
                </div>
              </div>
            )}

            {/* Nested replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-1">
                {comment.replies.map((reply) => (
                  <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <AuthGuardDialog open={showAuth} onOpenChange={setShowAuth} action="reply to comments" />
    </div>
  );
}
