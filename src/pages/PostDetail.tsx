import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MessageSquare, Share2, Bookmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import VoteButtons from "@/components/feed/VoteButtons";
import CommentItem from "@/components/feed/CommentItem";
import { MOCK_POSTS, MOCK_COMMENTS, timeAgo } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const categoryColors: Record<string, string> = {
  academics: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  exchange: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  internships: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  campus: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  papers: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
};

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const post = MOCK_POSTS.find((p) => p.id === id);
  const comments = id ? MOCK_COMMENTS[id] || [] : [];

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-3xl text-center">
        <p className="text-muted-foreground">Thread not found</p>
        <Link to="/" className="text-primary text-sm hover:underline mt-2 inline-block">← Back to feed</Link>
      </div>
    );
  }

  const score = post.upvote_count - post.downvote_count;
  const contextLabel = post.course_name || post.company_name || post.college_name;

  // Simple markdown-ish rendering
  const renderBody = (text: string) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return <p key={i} className="font-semibold mt-3 mb-1">{line.replace(/\*\*/g, "")}</p>;
      }
      if (line.startsWith("- ")) {
        return <li key={i} className="ml-4 text-sm leading-relaxed">{line.slice(2).replace(/\*\*/g, "")}</li>;
      }
      if (line.match(/^\d+\.\s/)) {
        return <li key={i} className="ml-4 text-sm leading-relaxed list-decimal">{line.replace(/^\d+\.\s/, "").replace(/\*\*/g, "")}</li>;
      }
      if (line.trim() === "") return <br key={i} />;
      // Bold within line
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={i} className="text-sm leading-relaxed">
          {parts.map((part, j) => (j % 2 === 1 ? <strong key={j}>{part}</strong> : part))}
        </p>
      );
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      {/* Back */}
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to feed
      </Link>

      {/* Post */}
      <article className="bg-card border border-border/50 rounded-xl shadow-soft p-5">
        <div className="flex gap-4">
          {/* Votes */}
          <div className="flex-shrink-0">
            <VoteButtons score={score} onUpvote={() => {}} onDownvote={() => {}} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Meta */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className={cn("text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded", categoryColors[post.category])}>
                {post.category}
              </span>
              {post.flair && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">{post.flair}</Badge>
              )}
              {post.course_code && (
                <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {post.course_code}
                </span>
              )}
              <span className="text-[11px] text-muted-foreground">
                Posted by <span className="font-medium text-foreground/70">{post.author_name}</span>
                {post.author_batch && <span> · {post.author_batch}</span>}
                <span> · {timeAgo(post.created_at)}</span>
              </span>
            </div>

            {/* Title */}
            <h1 className="font-display text-xl md:text-2xl font-bold leading-tight mb-1">
              {post.title}
            </h1>

            {contextLabel && (
              <p className="text-xs text-muted-foreground mb-3">re: {contextLabel}</p>
            )}

            {/* Body */}
            <div className="prose-sm text-foreground/90 mb-4 space-y-0.5">
              {renderBody(post.body)}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-3 border-t border-border/50 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                {post.comment_count} comments
              </span>
              <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                <Share2 className="h-3.5 w-3.5" /> Share
              </button>
              <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                <Bookmark className="h-3.5 w-3.5" /> Save
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* Comment input */}
      <div className="mt-4 bg-card border border-border/50 rounded-xl p-4 shadow-soft">
        <textarea
          className="w-full bg-muted/30 border border-border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground min-h-[80px]"
          placeholder="Share your thoughts..."
        />
        <div className="flex justify-end mt-2">
          <button className="text-sm font-medium bg-primary text-primary-foreground px-5 py-2 rounded-lg hover:bg-primary/90 transition-colors">
            Comment
          </button>
        </div>
      </div>

      {/* Comments */}
      <div className="mt-4">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-semibold text-foreground">{comments.length} Comments</h2>
          <span className="text-[11px] text-muted-foreground">sorted by Best</span>
        </div>
        {comments.length > 0 ? (
          <div className="space-y-1">
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No comments yet. Be the first to share your thoughts!
          </div>
        )}
      </div>
    </div>
  );
}
