import { useState } from "react";
import { MessageSquare, ChevronDown, ChevronUp as ChevronUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/mock-data";
import type { MockComment } from "@/lib/types";
import VoteButtons from "./VoteButtons";

interface CommentItemProps {
  comment: MockComment;
  depth?: number;
}

export default function CommentItem({ comment, depth = 0 }: CommentItemProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const score = comment.upvote_count - comment.downvote_count;

  return (
    <div className={cn("relative", depth > 0 && "ml-5 pl-4 border-l-2 border-border/40")}>
      <div className="py-2">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <button onClick={() => setCollapsed(!collapsed)} className="text-muted-foreground hover:text-foreground">
            {collapsed ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUpIcon className="h-3.5 w-3.5" />}
          </button>
          <span className="text-sm font-medium text-foreground">{comment.author_name}</span>
          {comment.author_batch && (
            <span className="text-[11px] text-muted-foreground">{comment.author_batch}</span>
          )}
          <span className="text-[11px] text-muted-foreground">· {timeAgo(comment.created_at)}</span>
        </div>

        {!collapsed && (
          <>
            {/* Body */}
            <div className="ml-6 mb-1.5">
              <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">{comment.body}</p>
            </div>

            {/* Actions */}
            <div className="ml-6 flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <VoteButtons score={score} onUpvote={() => {}} onDownvote={() => {}} size="sm" />
              </div>
              <button
                onClick={() => setShowReply(!showReply)}
                className="flex items-center gap-1 hover:text-foreground transition-colors py-1"
              >
                <MessageSquare className="h-3 w-3" />
                Reply
              </button>
            </div>

            {/* Reply input (placeholder) */}
            {showReply && (
              <div className="ml-6 mt-2 mb-2">
                <textarea
                  className="w-full bg-muted/50 border border-border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                  placeholder="Write a reply..."
                  rows={3}
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button onClick={() => setShowReply(false)} className="text-sm text-muted-foreground hover:text-foreground px-3 py-1.5">
                    Cancel
                  </button>
                  <button className="text-sm font-medium bg-primary text-primary-foreground px-4 py-1.5 rounded-lg hover:bg-primary/90 transition-colors">
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
    </div>
  );
}
