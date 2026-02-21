import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MessageSquare, Share2, Bookmark, MoreHorizontal } from "lucide-react";
import VoteButtons from "./VoteButtons";
import { timeAgo } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { generateAnonHandle } from "@/lib/anonymity";
import { useVote } from "@/hooks/useVote";

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
  user_id?: string;
}

const FLAIR_COLORS: Record<string, string> = {
  "Course Review": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Experience Diary": "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "Company Review": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "Interview Prep": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "Question": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  "Food & Cafes": "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "Study Spots": "bg-teal-500/10 text-teal-400 border-teal-500/20",
  "End Term": "bg-rose-500/10 text-rose-400 border-rose-500/20",
  "Pro Tip": "bg-lime-500/10 text-lime-400 border-lime-500/20",
};

export default function PostCard({
  id, title, body, category, flair, upvote_count, downvote_count,
  comment_count, pinned, course_code, course_name, company_name,
  college_name, created_at, user_id,
}: PostCardProps) {
  const navigate = useNavigate();
  const initialScore = upvote_count - downvote_count;
  const { score, userVote, vote, loadVote } = useVote(id, "post", initialScore);
  const contextLabel = course_name || company_name || college_name;
  const anonHandle = generateAnonHandle(user_id || id, id);
  const [saved, setSaved] = useState(false);

  useEffect(() => { loadVote(); }, [loadVote]);

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/post/${id}`);
    toast.success("Link copied!");
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved(!saved);
    toast.success(saved ? "Unsaved" : "Saved!");
  };

  const flairColorClass = flair ? (FLAIR_COLORS[flair] || "bg-primary/10 text-primary border-primary/20") : "";

  return (
    <Link to={`/post/${id}`}>
      <article
        className={cn(
          "group bg-card border border-border/50 rounded-xl transition-all duration-200 cursor-pointer mb-3",
          "hover:border-border hover:bg-accent/30 hover:-translate-y-0.5 hover:shadow-card-hover",
          pinned && "border-t-2 border-t-primary/40"
        )}
      >
        <div className="p-4">
          {/* Meta row */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2.5">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/d/${category}`); }}
              className="font-semibold text-foreground/80 hover:text-primary transition-colors"
            >
              d/{category}
            </button>
            <span>·</span>
            <span>{anonHandle}</span>
            <span>·</span>
            <span>{timeAgo(created_at)}</span>
            {contextLabel && (
              <>
                <span>·</span>
                <span className="text-foreground/60">{contextLabel}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className="font-sans font-semibold text-[16px] leading-snug text-foreground mb-1.5 group-hover:text-foreground">
            {title}
          </h3>

          {/* Flair / tags */}
          {(flair || course_code) && (
            <div className="flex items-center gap-1.5 mb-2.5">
              {flair && (
                <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full border", flairColorClass)}>
                  {flair}
                </span>
              )}
              {course_code && (
                <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                  {course_code}
                </span>
              )}
            </div>
          )}

          {/* Body preview with gradient fade */}
          <div className="relative mb-3">
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {body.replace(/[*#_]/g, "")}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            <VoteButtons score={score} userVote={userVote} onUpvote={() => vote(1)} onDownvote={() => vote(-1)} horizontal size="sm" />
            <button
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent px-3 py-1.5 rounded-full transition-colors"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/post/${id}`); }}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="font-medium tabular-nums">{comment_count}</span>
            </button>
            <button
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent px-3 py-1.5 rounded-full transition-colors"
              onClick={handleShare}
            >
              <Share2 className="h-3.5 w-3.5" />
              <span className="font-medium hidden sm:inline">Share</span>
            </button>
            <button
              className={cn(
                "flex items-center gap-1.5 text-xs hover:bg-accent px-3 py-1.5 rounded-full transition-colors",
                saved ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
              onClick={handleSave}
            >
              <Bookmark className={cn("h-3.5 w-3.5", saved && "fill-current")} />
            </button>
            <button
              className="flex items-center text-muted-foreground hover:text-foreground hover:bg-accent p-1.5 rounded-full transition-colors ml-auto"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toast.info("More options coming soon!"); }}
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}
