import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MessageSquare, Share2, EyeOff, Bookmark } from "lucide-react";
import VoteButtons from "./VoteButtons";
import { timeAgo } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { generateAnonHandle } from "@/lib/anonymity";
import { useVote } from "@/hooks/useVote";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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

const CATEGORIES: Record<string, string> = {
  academics: "Courses",
  exchange: "Exchange",
  internships: "Careers",
  campus: "Life",
  papers: "Papers",
  general: "General",
};

export default function PostCard({
  id, title, body, category, flair, upvote_count, downvote_count,
  comment_count, pinned, course_code, course_name, company_name,
  college_name, created_at, user_id, is_anonymous = false,
}: PostCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const initialScore = upvote_count - downvote_count;
  const { score, userVote, vote, loadVote } = useVote(id, "post", initialScore);
  const contextLabel = course_name || company_name || college_name;
  const anonHandle = generateAnonHandle(user_id || id, id);
  const [authorName, setAuthorName] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => { loadVote(); }, [loadVote]);

  useEffect(() => {
    if (is_anonymous || !user_id) return;
    supabase.from("profiles").select("name").eq("user_id", user_id).maybeSingle().then(({ data }) => {
      if (data?.name) setAuthorName(data.name);
    });
  }, [is_anonymous, user_id]);

  // Check bookmark status
  useEffect(() => {
    if (!user) return;
    supabase.from("bookmarks").select("id").eq("user_id", user.id).eq("content_id", id).eq("content_type", "post").maybeSingle().then(({ data }) => {
      setBookmarked(!!data);
    });
  }, [user, id]);

  const toggleBookmark = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error("Sign in to bookmark"); return; }
    if (bookmarked) {
      await supabase.from("bookmarks").delete().eq("user_id", user.id).eq("content_id", id).eq("content_type", "post");
      setBookmarked(false);
      toast.success("Removed from saved");
    } else {
      await supabase.from("bookmarks").insert({ user_id: user.id, content_id: id, content_type: "post" });
      setBookmarked(true);
      toast.success("Saved!");
    }
  }, [user, id, bookmarked]);

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/post/${id}`);
    toast.success("Link copied!");
  };

  const displayName = is_anonymous ? anonHandle : (authorName || anonHandle);

  return (
    <Link to={`/post/${id}`}>
      <article
        className={cn(
          "bg-card border border-border/50 rounded-xl transition-all duration-150 cursor-pointer active:scale-[0.98]",
          pinned && "border-l-2 border-l-primary"
        )}
      >
        <div className="p-5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
              {CATEGORIES[category] || category}
            </span>
            <span>·</span>
            {is_anonymous ? (
              <span className="flex items-center gap-0.5"><EyeOff className="h-3 w-3" />{displayName}</span>
            ) : (
              <Link to={`/user/${user_id}`} onClick={(e) => e.stopPropagation()} className="font-medium text-primary hover:underline">{displayName}</Link>
            )}
            <span>·</span>
            <span>{timeAgo(created_at)}</span>
          </div>

          <h3 className="font-semibold text-[15px] leading-snug text-foreground mb-1.5">{title}</h3>

          {(flair || course_code || contextLabel) && (
            <div className="flex items-center gap-1.5 mb-2">
              {flair && <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground">{flair}</span>}
              {course_code && <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-md">{course_code}</span>}
              {contextLabel && !course_code && <span className="text-[10px] text-muted-foreground">{contextLabel}</span>}
            </div>
          )}

          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-3">
            {body.replace(/(\*{1,3}|#{1,6}\s|_{2,}|~~)/g, "")}
          </p>

          <div className="flex items-center gap-1.5">
            <VoteButtons score={score} userVote={userVote} onUpvote={() => vote(1)} onDownvote={() => vote(-1)} horizontal size="sm" />
            <button
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted px-3 py-1.5 rounded-lg transition-colors"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/post/${id}`); }}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="font-medium tabular-nums">{comment_count}</span>
            </button>
            <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted px-3 py-1.5 rounded-lg transition-colors" onClick={handleShare}>
              <Share2 className="h-3.5 w-3.5" />
            </button>
            <button
              className={cn("flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg transition-colors ml-auto", bookmarked ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted")}
              onClick={toggleBookmark}
            >
              <Bookmark className={cn("h-3.5 w-3.5", bookmarked && "fill-primary")} />
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}
