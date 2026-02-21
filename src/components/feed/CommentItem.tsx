import { useState, useEffect } from "react";
import { MessageSquare, ChevronDown, ChevronUp as ChevronUpIcon, MoreHorizontal, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/mock-data";
import type { Comment } from "@/hooks/useComments";
import VoteButtons from "./VoteButtons";
import { useVote } from "@/hooks/useVote";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import AuthGuardDialog from "@/components/AuthGuardDialog";
import { generateAnonHandle } from "@/lib/anonymity";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface CommentItemProps {
  comment: Comment;
  postId: string;
  depth?: number;
}

export default function CommentItem({ comment, postId, depth = 0 }: CommentItemProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [collapsed, setCollapsed] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const initialScore = comment.upvote_count - comment.downvote_count;
  const { score, userVote, vote, loadVote } = useVote(comment.id, "comment", initialScore);
  const anonHandle = generateAnonHandle(comment.user_id);

  useEffect(() => { loadVote(); }, [loadVote]);

  const handleReply = async () => {
    if (!replyText.trim() || !user) return;
    setSubmitting(true);
    const { data, error } = await supabase.from("comments").insert({
      post_id: postId,
      parent_id: comment.id,
      user_id: user.id,
      body: replyText.trim(),
      moderation_status: "approved",
    }).select("id").single();
    if (error) { toast.error(error.message); }
    else {
      toast.success("Reply posted!");
      setReplyText("");
      setShowReply(false);
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      supabase.functions.invoke("moderate-content", {
        body: { content_type: "comment", content_id: data.id, title: null, body: replyText.trim() },
      }).then(() => queryClient.invalidateQueries({ queryKey: ["comments", postId] }));
    }
    setSubmitting(false);
  };

  const handleReplyClick = () => {
    if (!user) { setShowAuth(true); return; }
    setShowReply(!showReply);
  };

  return (
    <div className={cn("relative", depth > 0 && "ml-5")}>
      {/* Thread line */}
      {depth > 0 && (
        <button onClick={() => setCollapsed(!collapsed)} className="absolute left-0 top-0 bottom-0 w-5 group">
          <div className="absolute left-2 top-0 bottom-0 w-0.5 rounded-full bg-border/60 group-hover:bg-primary/50 transition-colors" />
        </button>
      )}

      <div className={cn("py-3", depth > 0 && "pl-5")}>
        <div className="flex items-center gap-2 mb-1.5">
          {depth === 0 && (
            <button onClick={() => setCollapsed(!collapsed)} className="text-muted-foreground hover:text-foreground transition-colors">
              {collapsed ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUpIcon className="h-3.5 w-3.5" />}
            </button>
          )}
          <div className="h-5 w-5 rounded-full bg-secondary flex items-center justify-center">
            <span className="text-[9px] font-bold text-muted-foreground">{anonHandle.slice(0, 2).toUpperCase()}</span>
          </div>
          <span className="text-xs font-semibold text-foreground">{anonHandle}</span>
          <span className="text-[11px] text-muted-foreground">· {timeAgo(comment.created_at)}</span>
        </div>

        {!collapsed && (
          <>
            <div className="mb-2">
              <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-line">{comment.body}</p>
            </div>

            <div className="flex items-center gap-1 text-xs">
              <VoteButtons score={score} userVote={userVote} onUpvote={() => vote(1)} onDownvote={() => vote(-1)} size="sm" horizontal />
              <button
                onClick={handleReplyClick}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground hover:bg-accent px-2.5 py-1 rounded-full transition-colors font-medium"
              >
                <MessageSquare className="h-3.5 w-3.5" /> Reply
              </button>
              <button
                onClick={() => { navigator.clipboard.writeText(comment.body); toast.success("Copied!"); }}
                className="flex items-center text-muted-foreground hover:text-foreground hover:bg-accent px-2 py-1 rounded-full transition-colors"
              >
                <Share2 className="h-3.5 w-3.5" />
              </button>
              <button className="text-muted-foreground hover:text-foreground hover:bg-accent p-1 rounded-full transition-colors">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
            </div>

            {showReply && (
              <div className="mt-3 mb-1 border border-border/50 rounded-xl overflow-hidden bg-secondary/30">
                <textarea
                  className="w-full bg-transparent p-3 text-sm resize-none focus:outline-none placeholder:text-muted-foreground min-h-[70px]"
                  placeholder="Share your thoughts…"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={3}
                />
                <div className="flex justify-end gap-2 px-3 py-2 border-t border-border/30">
                  <button onClick={() => { setShowReply(false); setReplyText(""); }} className="text-xs font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-full hover:bg-accent transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={handleReply}
                    disabled={!replyText.trim() || submitting}
                    className="text-xs font-semibold bg-primary text-primary-foreground px-4 py-1.5 rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Posting…" : "Reply"}
                  </button>
                </div>
              </div>
            )}

            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-1">
                {comment.replies.map((reply) => (
                  <CommentItem key={reply.id} comment={reply} postId={postId} depth={depth + 1} />
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
