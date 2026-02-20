import { Link } from "react-router-dom";
import { MessageSquare, Pin } from "lucide-react";
import VoteButtons from "./VoteButtons";
import { timeAgo } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface PostCardProps {
  id: string;
  title: string;
  body: string;
  category: string;
  flair?: string | null;
  upvote_count: number;
  downvote_count: number;
  comment_count: number;
  pinned?: boolean;
  course_code?: string | null;
  course_name?: string | null;
  company_name?: string | null;
  college_name?: string | null;
  created_at: string;
  author_name?: string;
  author_batch?: string;
  userVote?: 1 | -1 | null;
  onUpvote?: () => void;
  onDownvote?: () => void;
}

export default function PostCard({
  id, title, body, category, flair, upvote_count, downvote_count,
  comment_count, pinned, course_code, course_name, company_name,
  college_name, created_at, author_name, author_batch,
  userVote, onUpvote, onDownvote,
}: PostCardProps) {
  const score = upvote_count - downvote_count;
  const contextLabel = course_name || company_name || college_name;
  const preview = body.length > 180 ? body.slice(0, 180) + "…" : body;

  return (
    <Link to={`/post/${id}`}>
      <article
        className={cn(
          "group flex gap-3 py-2.5 px-3 rounded-md hover:bg-muted/60 transition-colors cursor-pointer",
          pinned && "bg-accent/40"
        )}
      >
        {/* Vote column */}
        <div className="flex-shrink-0 pt-0.5">
          <VoteButtons
            score={score}
            userVote={userVote}
            onUpvote={onUpvote ?? (() => {})}
            onDownvote={onDownvote ?? (() => {})}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Meta line */}
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-0.5">
            {pinned && (
              <span className="flex items-center gap-0.5 text-primary font-medium">
                <Pin className="h-2.5 w-2.5" /> pinned
              </span>
            )}
            <span className="font-medium text-foreground/60">r/{category}</span>
            <span>·</span>
            {author_name && <span>Posted by {author_name}</span>}
            {author_batch && <span>({author_batch})</span>}
            <span>· {timeAgo(created_at)}</span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-sm leading-snug text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>

          {/* Inline tags */}
          <div className="flex items-center gap-1.5 mt-0.5">
            {flair && (
              <span className="text-[10px] font-medium text-primary/80 bg-accent px-1.5 py-0.5 rounded">
                {flair}
              </span>
            )}
            {course_code && (
              <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {course_code}
              </span>
            )}
            {contextLabel && (
              <span className="text-[10px] text-muted-foreground">
                — {contextLabel}
              </span>
            )}
          </div>

          {/* Preview */}
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mt-1">
            {preview.replace(/[*#_]/g, "")}
          </p>

          {/* Footer */}
          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1 hover:text-foreground transition-colors">
              <MessageSquare className="h-3 w-3" />
              {comment_count} {comment_count === 1 ? "comment" : "comments"}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
