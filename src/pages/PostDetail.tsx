import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquare, Share2, Bookmark, MoreHorizontal, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import VoteButtons from "@/components/feed/VoteButtons";
import CommentItem from "@/components/feed/CommentItem";
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

function sortComments(comments: Comment[], sort: "best" | "new" | "top"): Comment[] {
  const sorted = [...comments];
  if (sort === "new") {
    sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } else if (sort === "top") {
    sorted.sort((a, b) => (b.upvote_count - b.downvote_count) - (a.upvote_count - a.downvote_count));
  } else {
    // best: combo of votes + recency
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
  const [saved, setSaved] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentSort, setCommentSort] = useState<"best" | "new" | "top">("best");
  const [showAuth, setShowAuth] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const initialScore = (post?.upvote_count ?? 0) - (post?.downvote_count ?? 0);
  const { score, userVote, vote, loadVote } = useVote(id ?? "", "post", initialScore);

  useEffect(() => { if (post) loadVote(); }, [post, loadVote]);

  const sortedComments = useMemo(() => sortComments(comments, commentSort), [comments, commentSort]);

  if (isError) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-sm font-medium text-foreground mb-1">Something went wrong</p>
        <p className="text-xs text-muted-foreground mb-3">Could not load this post</p>
        <Button onClick={() => refetch()} size="sm" variant="outline" className="rounded-full gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" /> Try Again
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground text-sm">Thread not found</p>
        <Link to="/" className="text-primary text-sm hover:underline mt-2 inline-block">← Back to feed</Link>
      </div>
    );
  }

  const contextLabel = post.course_name || post.company_name || post.college_name;
  const anonHandle = generateAnonHandle(post.user_id);

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

  const handleCommentFocus = () => {
    if (!user) { setShowAuth(true); }
  };

  const renderBody = (text: string) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return <p key={i} className="font-bold mt-4 mb-1.5 text-sm text-foreground">{line.replace(/\*\*/g, "")}</p>;
      }
      if (line.startsWith("- ")) {
        return <li key={i} className="ml-4 text-sm leading-relaxed text-foreground/80 list-disc">{line.slice(2).replace(/\*\*/g, "")}</li>;
      }
      if (line.match(/^\d+\.\s/)) {
        return <li key={i} className="ml-4 text-sm leading-relaxed text-foreground/80 list-decimal">{line.replace(/^\d+\.\s/, "").replace(/\*\*/g, "")}</li>;
      }
      if (line.trim() === "") return <br key={i} />;
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={i} className="text-sm leading-relaxed text-foreground/80">
          {parts.map((part, j) => (j % 2 === 1 ? <strong key={j} className="text-foreground">{part}</strong> : part))}
        </p>
      );
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-4">
      <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-3 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to feed
      </Link>

      <article className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center gap-1.5 text-xs mb-2">
          <button onClick={() => navigate(`/d/${post.category}`)} className="font-bold text-foreground hover:underline">d/{post.category}</button>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">
            Posted by <span className="font-medium">{anonHandle}</span>
          </span>
          <span className="text-muted-foreground">• {timeAgo(post.created_at)}</span>
        </div>

        <h1 className="font-bold text-xl leading-tight mb-2 text-foreground">{post.title}</h1>

        <div className="flex items-center gap-1.5 mb-4">
          {post.flair && (
            <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">{post.flair}</span>
          )}
          {post.course_code && (
            <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{post.course_code}</span>
          )}
          {contextLabel && <span className="text-[10px] text-muted-foreground">{contextLabel}</span>}
        </div>

        <div className="mb-4 space-y-0.5">{renderBody(post.body)}</div>

        <div className="flex items-center gap-2 pt-3 border-t border-border">
          <VoteButtons score={score} userVote={userVote} onUpvote={() => vote(1)} onDownvote={() => vote(-1)} horizontal />
          <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:bg-accent px-3 py-1.5 rounded-full transition-colors font-medium">
            <MessageSquare className="h-4 w-4" /> {post.comment_count} Comments
          </button>
          <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:bg-accent px-3 py-1.5 rounded-full transition-colors font-medium" onClick={handleShare}>
            <Share2 className="h-4 w-4" /> Share
          </button>
          <button
            className={cn("flex items-center gap-1.5 text-xs hover:bg-accent px-3 py-1.5 rounded-full transition-colors font-medium", saved ? "text-primary" : "text-muted-foreground")}
            onClick={() => { setSaved(!saved); toast.success(saved ? "Unsaved" : "Saved!"); }}
          >
            <Bookmark className={cn("h-4 w-4", saved && "fill-current")} /> {saved ? "Saved" : "Save"}
          </button>
          <button className="text-muted-foreground hover:bg-accent p-1.5 rounded-full transition-colors ml-auto" onClick={() => toast.info("More options coming soon!")}>
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </article>

      {/* Comment input */}
      <div className="mt-3 bg-card border border-border rounded-lg overflow-hidden">
        <textarea
          className="w-full bg-transparent p-3 text-sm resize-none focus:outline-none placeholder:text-muted-foreground min-h-[100px]"
          placeholder={user ? "What are your thoughts?" : "Sign in to share your thoughts..."}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onFocus={handleCommentFocus}
          readOnly={!user}
        />
        <div className="flex items-center justify-between px-3 py-2 border-t border-border">
          {!user && (
            <p className="text-[11px] text-muted-foreground">Sign in to comment</p>
          )}
          <div className="ml-auto">
            <button
              onClick={handleComment}
              disabled={!commentText.trim() || submitting}
              className="text-xs font-bold bg-primary text-primary-foreground px-4 py-1.5 rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Posting..." : "Comment"}
            </button>
          </div>
        </div>
      </div>

      {/* Comment sort */}
      <div className="flex items-center gap-2 mt-4 mb-2">
        <span className="text-xs text-muted-foreground">Sort by:</span>
        {(["best", "new", "top"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setCommentSort(s)}
            className={cn(
              "text-xs font-medium px-2 py-1 rounded transition-colors capitalize",
              commentSort === s ? "text-foreground bg-accent" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Comments */}
      <div>
        {commentsError ? (
          <div className="text-center py-8 bg-card border border-border rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Could not load comments</p>
            <Button onClick={() => refetchComments()} size="sm" variant="outline" className="rounded-full gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" /> Try Again
            </Button>
          </div>
        ) : commentsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : sortedComments.length > 0 ? (
          <div>
            {sortedComments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} postId={id!} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <MessageSquare className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No comments yet</p>
            <p className="text-xs text-muted-foreground/60">Be the first to share your thoughts</p>
          </div>
        )}
      </div>

      <AuthGuardDialog open={showAuth} onOpenChange={setShowAuth} action="comment on posts" />
    </div>
  );
}
