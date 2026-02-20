import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MessageSquare, Share2, Bookmark } from "lucide-react";
import VoteButtons from "@/components/feed/VoteButtons";
import CommentItem from "@/components/feed/CommentItem";
import { MOCK_POSTS, MOCK_COMMENTS, timeAgo } from "@/lib/mock-data";

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const post = MOCK_POSTS.find((p) => p.id === id);
  const comments = id ? MOCK_COMMENTS[id] || [] : [];

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-2xl text-center">
        <p className="text-muted-foreground text-sm">Thread not found</p>
        <Link to="/" className="text-primary text-sm hover:underline mt-2 inline-block">← Back to feed</Link>
      </div>
    );
  }

  const score = post.upvote_count - post.downvote_count;
  const contextLabel = post.course_name || post.company_name || post.college_name;

  const renderBody = (text: string) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return <p key={i} className="font-semibold mt-3 mb-1 text-sm">{line.replace(/\*\*/g, "")}</p>;
      }
      if (line.startsWith("- ")) {
        return <li key={i} className="ml-4 text-sm leading-relaxed">{line.slice(2).replace(/\*\*/g, "")}</li>;
      }
      if (line.match(/^\d+\.\s/)) {
        return <li key={i} className="ml-4 text-sm leading-relaxed list-decimal">{line.replace(/^\d+\.\s/, "").replace(/\*\*/g, "")}</li>;
      }
      if (line.trim() === "") return <br key={i} />;
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={i} className="text-sm leading-relaxed">
          {parts.map((part, j) => (j % 2 === 1 ? <strong key={j}>{part}</strong> : part))}
        </p>
      );
    });
  };

  return (
    <div className="container mx-auto px-4 py-4 max-w-2xl">
      <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-3 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </Link>

      {/* Post */}
      <article className="bg-card border border-border rounded-md p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <VoteButtons score={score} onUpvote={() => {}} onDownvote={() => {}} />
          </div>

          <div className="flex-1 min-w-0">
            {/* Meta */}
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1">
              <span className="font-medium text-foreground/60">r/{post.category}</span>
              <span>·</span>
              <span>Posted by {post.author_name}</span>
              {post.author_batch && <span>({post.author_batch})</span>}
              <span>· {timeAgo(post.created_at)}</span>
            </div>

            {/* Title */}
            <h1 className="font-display text-lg font-bold leading-tight mb-1">
              {post.title}
            </h1>

            {/* Tags */}
            <div className="flex items-center gap-1.5 mb-3">
              {post.flair && (
                <span className="text-[10px] font-medium text-primary/80 bg-accent px-1.5 py-0.5 rounded">
                  {post.flair}
                </span>
              )}
              {post.course_code && (
                <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {post.course_code}
                </span>
              )}
              {contextLabel && (
                <span className="text-[10px] text-muted-foreground">— {contextLabel}</span>
              )}
            </div>

            {/* Body */}
            <div className="text-foreground/90 space-y-0.5 mb-4">
              {renderBody(post.body)}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-2 border-t border-border text-xs text-muted-foreground">
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
      <div className="mt-3 border border-border rounded-md p-3 bg-card">
        <textarea
          className="w-full bg-muted/30 border border-border rounded p-2.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground min-h-[72px]"
          placeholder="What are your thoughts?"
        />
        <div className="flex justify-end mt-2">
          <button className="text-xs font-medium bg-primary text-primary-foreground px-4 py-1.5 rounded hover:bg-primary/90 transition-colors">
            Comment
          </button>
        </div>
      </div>

      {/* Comments */}
      <div className="mt-3">
        <div className="text-xs text-muted-foreground mb-2">
          {comments.length} comments · sorted by Best
        </div>
        {comments.length > 0 ? (
          <div className="space-y-0">
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground text-xs">
            No comments yet. Be the first to share your thoughts.
          </div>
        )}
      </div>
    </div>
  );
}
