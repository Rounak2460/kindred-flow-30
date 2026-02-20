import { Link } from "react-router-dom";
import { MessageSquare, Pin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

const categoryColors: Record<string, string> = {
  academics: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  exchange: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  internships: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  campus: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  papers: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
};

export default function PostCard({
  id, title, body, category, flair, upvote_count, downvote_count,
  comment_count, pinned, course_code, course_name, company_name,
  college_name, created_at, author_name, author_batch,
  userVote, onUpvote, onDownvote,
}: PostCardProps) {
  const score = upvote_count - downvote_count;
  const contextLabel = course_name || company_name || college_name;
  const preview = body.length > 200 ? body.slice(0, 200) + "..." : body;

  return (
    <Link to={`/post/${id}`}>
      <article
        className={cn(
          "group flex gap-3 p-4 rounded-xl bg-card border border-border/50 shadow-soft card-hover cursor-pointer",
          pinned && "ring-1 ring-primary/20 bg-accent/30"
        )}
      >
        {/* Vote column */}
        <div className="flex-shrink-0 pt-1">
          <VoteButtons
            score={score}
            userVote={userVote}
            onUpvote={onUpvote ?? (() => {})}
            onDownvote={onDownvote ?? (() => {})}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Meta row */}
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            {pinned && (
              <span className="flex items-center gap-1 text-xs text-primary font-medium">
                <Pin className="h-3 w-3" /> Pinned
              </span>
            )}
            <span className={cn("text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded", categoryColors[category])}>
              {category}
            </span>
            {flair && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-medium">
                {flair}
              </Badge>
            )}
            {course_code && (
              <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {course_code}
              </span>
            )}
            <span className="text-[11px] text-muted-foreground">
              {author_name && <span className="font-medium text-foreground/70">{author_name}</span>}
              {author_batch && <span> · {author_batch}</span>}
              <span> · {timeAgo(created_at)}</span>
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-[15px] leading-snug text-foreground group-hover:text-primary transition-colors mb-1">
            {title}
          </h3>

          {/* Context tag */}
          {contextLabel && (
            <span className="text-xs text-muted-foreground mb-1 inline-block">
              re: {contextLabel}
            </span>
          )}

          {/* Preview */}
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-2">
            {preview.replace(/[*#_]/g, "")}
          </p>

          {/* Footer */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 hover:text-foreground transition-colors">
              <MessageSquare className="h-3.5 w-3.5" />
              {comment_count} {comment_count === 1 ? "comment" : "comments"}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
