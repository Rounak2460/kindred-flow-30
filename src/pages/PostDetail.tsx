import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquare, Share2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import VoteButtons from "@/components/feed/VoteButtons";
import CommentItem from "@/components/feed/CommentItem";
import SkeletonCard from "@/components/feed/SkeletonCard";
import { timeAgo } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import AuthGuardDialog from "@/components/AuthGuardDialog";
import { supabase } from "@/integrations/supabase/client";
import { generateAnonHandle } from "@/lib/anonymity";
import { usePost } from "@/hooks/usePosts";
import { useComments, Comment } from "@/hooks/useComments";
import { useQueryClient } from "@tanstack/react-query";
import { useVote } from "@/hooks/useVote";

const CATEGORIES: Record<string, string> = {
  academics: "Academics",
  exchange: "Exchange",
  internships: "Internships",
  campus: "Campus",
  papers: "Papers",
};

function sortComments(comments: Comment[], sort: "best" | "new" | "top"): Comment[] {
  const sorted = [...comments];
  if (sort === "new") {
    sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } else if (sort === "top") {
    sorted.sort((a, b) => (b.upvote_count - b.downvote_count) - (a.upvote_count - a.downvote_count));
  } else {
    sorted.sort((a, b) => {
      const scoreA = (a.upvote_count - a.downvote_count) + a.replies.length;
      const scoreB = (b.upvote_count - b.downvote_count) + b.replies.length;
      return scoreB - scoreA;
    });
  }
  return sorted;
}

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: post, isLoading, isError, refetch } = usePost(id);
  const { data: comments = [], isLoading: commentsLoading, isError: commentsError, refetch: refetchComments } = useComments(id);
  const [commentText, setCommentText] = useState("");
  const [commentSort, setCommentSort] = useState<"best" | "new" | "top">("best");
  const [showAuth, setShowAuth] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [authorName, setAuthorName] = useState<string | null>(null);

  const initialScore = (post?.upvote_count ?? 0) - (post?.downvote_count ?? 0);
  const { score, userVote, vote, loadVote } = useVote(id ?? "", "post", initialScore);

  useEffect(() => { if (post) loadVote(); }, [post, loadVote]);

  useEffect(() => {
    if (!post || post.is_anonymous || !post.user_id) return;
    supabase.from("profiles").select("name").eq("user_id", post.user_id).maybeSingle().then(({ data }) => {
      if (data?.name) setAuthorName(data.name);
    });
  }, [post?.is_anonymous, post?.user_id]);

  const sortedComments = useMemo(() => sortComments(comments, commentSort), [comments, commentSort]);

  const anonHandle = post ? generateAnonHandle(post.user_id) : "";
  const displayName = post?.is_anonymous ? anonHandle : (authorName || anonHandle);
  const contextLabel = post ? (post.course_name || post.company_name || post.college_name) : null;

  if (isError) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-sm font-medium text-foreground mb-1">Something went wrong</p>
        <p className="text-xs text-muted-foreground mb-3">Could not load this post</p>
        <Button onClick={() => refetch()} size="sm" variant="outline" className="rounded-lg gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" /> Try Again
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground text-sm">Thread not found</p>
        <Link to="/" className="text-primary text-sm hover:underline mt-2 inline-block">← Back to feed</Link>
      </div>
    );
  }

  const handleComment = async () => {
    if (!user) { setShowAuth(true); return; }
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const { data: commentData, error } = await supabase.from("comments").insert({
        post_id: id!,
        user_id: user.id,
        body: commentText.trim(),
        moderation_status: "approved",
      }).select("id").single();
      if (error) throw error;
      toast.success("Comment posted!");
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["comments", id] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      supabase.functions.invoke("moderate-content", {
        body: { content_type: "comment", content_id: commentData.id, title: null, body: commentText.trim() },
      }).then(({ error: modErr }) => {
        if (modErr) console.error("Moderation error:", modErr);
        queryClient.invalidateQueries({ queryKey: ["comments", id] });
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied!");
  };

  const renderBody = (text: string) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return <p key={i} className="font-semibold mt-5 mb-1.5 text-foreground">{line.replace(/\*\*/g, "")}</p>;
      }
      if (line.startsWith("- ")) {
        return <li key={i} className="ml-4 text-foreground/80 list-disc">{line.slice(2).replace(/\*\*/g, "")}</li>;
      }
      if (line.match(/^\d+\.\s/)) {
        return <li key={i} className="ml-4 text-foreground/80 list-decimal">{line.replace(/^\d+\.\s/, "").replace(/\*\*/g, "")}</li>;
      }
      if (line.trim() === "") return <br key={i} />;
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={i} className="text-foreground/80 leading-[1.75]">
          {parts.map((part, j) => (j % 2 === 1 ? <strong key={j} className="text-foreground font-semibold">{part}</strong> : part))}
        </p>
      );
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </Link>

      <article className="bg-card border border-border rounded-xl p-5 sm:p-6">
        {/* Meta */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
          <span className="font-medium text-foreground/80">
            {CATEGORIES[post.category] || post.category}
          </span>
          <span>·</span>
          {post.is_anonymous ? (
            <span>{displayName}</span>
          ) : (
            <Link to={`/user/${post.user_id}`} className="font-medium text-primary hover:underline">{displayName}</Link>
          )}
          <span>·</span>
          <span>{timeAgo(post.created_at)}</span>
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-semibold leading-tight mb-3 text-foreground">{post.title}</h1>

        {/* Tags */}
        <div className="flex items-center gap-1.5 mb-5">
          {post.flair && (
            <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">{post.flair}</span>
          )}
          {post.course_code && (
            <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">{post.course_code}</span>
          )}
          {contextLabel && <span className="text-[10px] text-muted-foreground">{contextLabel}</span>}
        </div>

        {/* Body */}
        <div className="mb-6 text-[15px] leading-[1.75] space-y-0.5">{renderBody(post.body)}</div>

        {/* Action bar */}
        <div className="flex items-center gap-1.5 pt-4 border-t border-border/30">
          <VoteButtons score={score} userVote={userVote} onUpvote={() => vote(1)} onDownvote={() => vote(-1)} horizontal />
          <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted px-3 py-1.5 rounded-lg transition-colors font-medium">
            <MessageSquare className="h-4 w-4" /> {post.comment_count}
          </button>
          <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted px-3 py-1.5 rounded-lg transition-colors font-medium" onClick={handleShare}>
            <Share2 className="h-4 w-4" /> Share
          </button>
        </div>
      </article>

      {/* Comment input */}
      <div className="mt-4 bg-card border border-border rounded-xl overflow-hidden">
        <textarea
          className="w-full bg-transparent p-4 text-sm resize-none focus:outline-none placeholder:text-muted-foreground min-h-[80px]"
          placeholder={user ? "Share your thoughts…" : "Sign in to share your thoughts…"}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onFocus={() => { if (!user) setShowAuth(true); }}
          readOnly={!user}
        />
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-border/20">
          {!user && <p className="text-[11px] text-muted-foreground">Sign in to comment</p>}
          <div className="ml-auto">
            <button
              onClick={handleComment}
              disabled={!commentText.trim() || submitting}
              className="text-xs font-semibold bg-primary text-primary-foreground px-5 py-1.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Posting…" : "Comment"}
            </button>
          </div>
        </div>
      </div>

      {/* Comment sort */}
      <div className="flex items-center gap-2 mt-5 mb-3">
        <span className="text-xs text-muted-foreground">Sort by</span>
        {(["best", "new", "top"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setCommentSort(s)}
            className={cn(
              "text-xs font-medium px-2.5 py-1 rounded-lg transition-colors capitalize",
              commentSort === s ? "text-foreground bg-muted" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Comments */}
      <div>
        {commentsError ? (
          <div className="text-center py-10 bg-card border border-border rounded-xl">
            <p className="text-sm text-muted-foreground mb-2">Could not load comments</p>
            <Button onClick={() => refetchComments()} size="sm" variant="outline" className="rounded-lg gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" /> Try Again
            </Button>
          </div>
        ) : commentsLoading ? (
          <div className="space-y-2">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : sortedComments.length > 0 ? (
          <div className="divide-y divide-border/20">
            {sortedComments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} postId={id!} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-card border border-border rounded-xl">
            <MessageSquare className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No comments yet</p>
            <p className="text-xs text-muted-foreground/60 mt-0.5">Be the first to share your thoughts</p>
          </div>
        )}
      </div>

      <AuthGuardDialog open={showAuth} onOpenChange={setShowAuth} action="comment on posts" />
    </div>
  );
}
