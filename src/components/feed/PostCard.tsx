import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MessageSquare, Share2 } from "lucide-react";
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
  "Course Review": "bg-blue-50 text-blue-700 border-blue-200",
  "Experience Diary": "bg-violet-50 text-violet-700 border-violet-200",
  "Company Review": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Interview Prep": "bg-amber-50 text-amber-700 border-amber-200",
  "Question": "bg-cyan-50 text-cyan-700 border-cyan-200",
  "Food & Cafes": "bg-orange-50 text-orange-700 border-orange-200",
  "Study Spots": "bg-teal-50 text-teal-700 border-teal-200",
  "End Term": "bg-rose-50 text-rose-700 border-rose-200",
  "Pro Tip": "bg-lime-50 text-lime-700 border-lime-200",
};

const CATEGORIES: Record<string, string> = {
  academics: "Academics",
  exchange: "Exchange",
  internships: "Internships",
  campus: "Campus",
  papers: "Papers",
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

  useEffect(() => { loadVote(); }, [loadVote]);

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/post/${id}`);
    toast.success("Link copied!");
  };

  const flairColorClass = flair ? (FLAIR_COLORS[flair] || "bg-primary/5 text-primary border-primary/20") : "";

  return (
    <Link to={`/post/${id}`}>
      <article
        className={cn(
          "group bg-card border border-border rounded-xl transition-all duration-200 cursor-pointer mb-3",
          "hover:shadow-soft hover:-translate-y-0.5",
          pinned && "border-l-2 border-l-primary"
        )}
      >
        <div className="p-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2.5">
            <span className="font-medium text-foreground/70">
              {CATEGORIES[category] || category}
            </span>
            <span>·</span>
            <span>{anonHandle}</span>
            <span>·</span>
            <span>{timeAgo(created_at)}</span>
            {contextLabel && (
              <>
                <span>·</span>
                <span className="text-foreground/50">{contextLabel}</span>
              </>
            )}
          </div>

          <h3 className="font-semibold text-[15px] leading-snug text-foreground mb-1.5">
            {title}
          </h3>

          {(flair || course_code) && (
            <div className="flex items-center gap-1.5 mb-2.5">
              {flair && (
                <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-md border", flairColorClass)}>
                  {flair}
                </span>
              )}
              {course_code && (
                <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                  {course_code}
                </span>
              )}
            </div>
          )}

          <div className="relative mb-3">
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {body.replace(/[*#_]/g, "")}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <VoteButtons score={score} userVote={userVote} onUpvote={() => vote(1)} onDownvote={() => vote(-1)} horizontal size="sm" />
            <button
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted px-3 py-1.5 rounded-lg transition-colors"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/post/${id}`); }}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="font-medium tabular-nums">{comment_count}</span>
            </button>
            <button
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted px-3 py-1.5 rounded-lg transition-colors"
              onClick={handleShare}
            >
              <Share2 className="h-3.5 w-3.5" />
              <span className="font-medium hidden sm:inline">Share</span>
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}
