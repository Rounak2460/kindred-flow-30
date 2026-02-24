import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MessageSquare, Share2, EyeOff } from "lucide-react";
import VoteButtons from "./VoteButtons";
import { timeAgo } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { generateAnonHandle } from "@/lib/anonymity";
import { useVote } from "@/hooks/useVote";
import { supabase } from "@/integrations/supabase/client";

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
  is_anonymous?: boolean;
}

const FLAIR_COLORS: Record<string, string> = {
  "Course Review": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "Experience Diary": "bg-violet-500/10 text-violet-500 border-violet-500/20",
  "Company Review": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  "Interview Prep": "bg-amber-500/10 text-amber-500 border-amber-500/20",
  "Question": "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  "Food & Cafes": "bg-orange-500/10 text-orange-500 border-orange-500/20",
  "Study Spots": "bg-teal-500/10 text-teal-500 border-teal-500/20",
  "End Term": "bg-rose-500/10 text-rose-500 border-rose-500/20",
  "Pro Tip": "bg-lime-500/10 text-lime-500 border-lime-500/20",
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
  college_name, created_at, user_id, is_anonymous = false,
}: PostCardProps) {
  const navigate = useNavigate();
  const initialScore = upvote_count - downvote_count;
  const { score, userVote, vote, loadVote } = useVote(id, "post", initialScore);
  const contextLabel = course_name || company_name || college_name;
  const anonHandle = generateAnonHandle(user_id || id, id);
  const [authorName, setAuthorName] = useState<string | null>(null);

  useEffect(() => { loadVote(); }, [loadVote]);

  // Fetch author name for non-anonymous posts
  useEffect(() => {
    if (is_anonymous || !user_id) return;
    supabase.from("profiles").select("name").eq("user_id", user_id).maybeSingle().then(({ data }) => {
      if (data?.name) setAuthorName(data.name);
    });
  }, [is_anonymous, user_id]);

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/post/${id}`);
    toast.success("Link copied!");
  };

  const flairColorClass = flair ? (FLAIR_COLORS[flair] || "bg-primary/5 text-primary border-primary/20") : "";

  const displayName = is_anonymous ? anonHandle : (authorName || anonHandle);

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
            {is_anonymous ? (
              <span className="flex items-center gap-0.5"><EyeOff className="h-3 w-3" />{displayName}</span>
            ) : (
              <Link
                to={`/user/${user_id}`}
                onClick={(e) => e.stopPropagation()}
                className="font-medium text-primary hover:underline"
              >
                {displayName}
              </Link>
            )}
            <span>·</span>
            <span>{timeAgo(created_at)}</span>
            {contextLabel && (
              <>
                <span>·</span>
                <Link
                  to={course_name ? "/academics" : company_name ? "/internships" : "/exchange"}
                  onClick={(e) => e.stopPropagation()}
                  className="text-foreground/50 hover:text-primary hover:underline"
                >
                  {contextLabel}
                </Link>
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
              {body.replace(/(\*{1,3}|#{1,6}\s|_{2,}|~~)/g, "")}
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