import { Link, useNavigate } from "react-router-dom";
import { MessageSquare, Share2, Bookmark, Pin, MoreHorizontal } from "lucide-react";
import VoteButtons from "./VoteButtons";
import { timeAgo } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

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
  const navigate = useNavigate();
  const score = upvote_count - downvote_count;
  const contextLabel = course_name || company_name || college_name;
  const preview = body.length > 200 ? body.slice(0, 200) + "…" : body;
  const [saved, setSaved] = useState(false);

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/post/${id}`);
    toast.success("Link copied to clipboard!");
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved(!saved);
    toast.success(saved ? "Unsaved" : "Post saved!");
  };

  const handleCategoryClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/d/${category}`);
  };

  return (
    <Link to={`/post/${id}`}>
      <article
        className={cn(
          "group bg-card border border-border rounded-lg hover:border-muted-foreground/30 transition-colors cursor-pointer mb-2.5",
          pinned && "border-primary/30"
        )}
      >
        {pinned && (
          <div className="flex items-center gap-1.5 px-3 pt-2 text-[11px] text-primary font-medium">
            <Pin className="h-3 w-3" /> Pinned by moderators
          </div>
        )}

        <div className="p-3">
          {/* Subreddit + author meta */}
          <div className="flex items-center gap-1.5 text-xs mb-2">
            <button onClick={handleCategoryClick} className="font-bold text-foreground hover:underline">
              d/{category}
            </button>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              Posted by {author_name && <span className="hover:underline">u/{author_name.replace(" ", "").toLowerCase()}</span>}
              {author_batch && <span className="ml-1 text-muted-foreground/60">{author_batch}</span>}
            </span>
            <span className="text-muted-foreground">• {timeAgo(created_at)}</span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-[15px] leading-snug text-foreground mb-1.5">
            {title}
          </h3>

          {/* Tags */}
          <div className="flex items-center gap-1.5 mb-2">
            {flair && (
              <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                {flair}
              </span>
            )}
            {course_code && (
              <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                {course_code}
              </span>
            )}
            {contextLabel && (
              <span className="text-[10px] text-muted-foreground">{contextLabel}</span>
            )}
          </div>

          {/* Preview */}
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-3">
            {preview.replace(/[*#_]/g, "")}
          </p>

          {/* Action bar */}
          <div className="flex items-center gap-2">
            <VoteButtons
              score={score}
              userVote={userVote}
              onUpvote={onUpvote ?? (() => {})}
              onDownvote={onDownvote ?? (() => {})}
              horizontal
              size="sm"
            />
            <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:bg-accent px-3 py-1.5 rounded-full transition-colors"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
              <MessageSquare className="h-4 w-4" />
              <span className="font-medium">{comment_count}</span>
            </button>
            <button
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:bg-accent px-3 py-1.5 rounded-full transition-colors"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
              <span className="font-medium hidden sm:inline">Share</span>
            </button>
            <button
              className={cn(
                "flex items-center gap-1.5 text-xs hover:bg-accent px-3 py-1.5 rounded-full transition-colors",
                saved ? "text-primary" : "text-muted-foreground"
              )}
              onClick={handleSave}
            >
              <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
              <span className="font-medium hidden sm:inline">{saved ? "Saved" : "Save"}</span>
            </button>
            <button
              className="flex items-center text-muted-foreground hover:bg-accent p-1.5 rounded-full transition-colors ml-auto"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}
