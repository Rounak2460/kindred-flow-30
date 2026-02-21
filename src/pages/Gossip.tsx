import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useGossipPosts, useGossipComments, useCreateGossipPost, useCreateGossipComment, GossipPost, GossipComment } from "@/hooks/useGossip";
import { generateGossipHandle } from "@/lib/anonymity";
import { useVote } from "@/hooks/useVote";
import VoteButtons from "@/components/feed/VoteButtons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ShieldCheck, EyeOff, MessageCircle, Send, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

function timeAgo(date: string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

function GossipGate({ onJoin }: { onJoin: () => void }) {
  const [joining, setJoining] = useState(false);
  const handleJoin = async () => { setJoining(true); onJoin(); };

  return (
    <div className="max-w-md mx-auto px-4 py-12 text-center">
      <div className="bg-card border border-border rounded-xl p-8 space-y-5">
        <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center mx-auto">
          <EyeOff className="h-7 w-7 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-semibold text-foreground">Gossip Central</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          A voluntary, fully anonymous space for IIMB students. Your identity is never revealed —
          you get a unique random handle for every post.
        </p>
        <div className="text-left space-y-2 bg-muted/50 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Community Rules
          </h3>
          <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
            <li>No identifying information about anyone</li>
            <li>No unverified rumors about faculty or students</li>
            <li>No defamation, hate speech, or harassment</li>
            <li>No private conversations or confidential info</li>
            <li>Stricter AI moderation based on IIMB media policy</li>
          </ul>
        </div>
        <Button onClick={handleJoin} disabled={joining} className="w-full">
          {joining ? "Joining..." : "Join Gossip Central"}
        </Button>
      </div>
    </div>
  );
}

function GossipCommentItem({ comment, gossipId, depth = 0 }: { comment: GossipComment; gossipId: string; depth?: number }) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const { user } = useAuth();
  const createComment = useCreateGossipComment();
  const anonHandle = generateGossipHandle("comment-" + comment.id, gossipId);
  const score = comment.upvote_count - comment.downvote_count;
  const { score: liveScore, userVote, vote, loadVote } = useVote(comment.id, "gossip_comment", score);
  const handleUpvote = () => { loadVote(); vote(1); };
  const handleDownvote = () => { loadVote(); vote(-1); };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    try {
      await createComment.mutateAsync({ gossipId, parentId: comment.id, body: replyText.trim() });
      setReplyText("");
      setShowReply(false);
      toast.success("Reply posted (pending moderation)");
    } catch {
      toast.error("Failed to post reply");
    }
  };

  return (
    <div className={depth > 0 ? "ml-4 pl-3 border-l border-border/40" : ""}>
      <div className="py-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
          <span className="text-foreground/70 font-medium">{anonHandle}</span>
          <span>·</span>
          <span>{timeAgo(comment.created_at)}</span>
        </div>
        <p className="text-sm text-foreground/90">{comment.body}</p>
        <div className="flex items-center gap-3 mt-1.5">
          <VoteButtons score={liveScore} userVote={userVote} onUpvote={handleUpvote} onDownvote={handleDownvote} size="sm" horizontal />
          {user && depth < 3 && (
            <button onClick={() => setShowReply(!showReply)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Reply
            </button>
          )}
        </div>
        {showReply && (
          <div className="mt-2 flex gap-2">
            <Textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Reply anonymously..." className="min-h-[40px] text-sm bg-muted/50 resize-none" rows={1} />
            <Button size="sm" onClick={handleReply} disabled={createComment.isPending} className="h-auto">
              <Send className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
      {comment.replies?.map((r) => (
        <GossipCommentItem key={r.id} comment={r} gossipId={gossipId} depth={depth + 1} />
      ))}
    </div>
  );
}

function GossipPostCard({ post }: { post: GossipPost }) {
  const [expanded, setExpanded] = useState(false);
  const [commentText, setCommentText] = useState("");
  const { user } = useAuth();
  const anonHandle = generateGossipHandle("post-" + post.id, post.id);
  const score = post.upvote_count - post.downvote_count;
  const { score: liveScore, userVote, vote, loadVote } = useVote(post.id, "gossip_post", score);
  const handleUpvote = () => { loadVote(); vote(1); };
  const handleDownvote = () => { loadVote(); vote(-1); };
  const { data: comments = [] } = useGossipComments(expanded ? post.id : undefined);
  const createComment = useCreateGossipComment();

  const handleComment = async () => {
    if (!commentText.trim()) return;
    try {
      await createComment.mutateAsync({ gossipId: post.id, body: commentText.trim() });
      setCommentText("");
      toast.success("Comment posted (pending moderation)");
    } catch {
      toast.error("Failed to post comment");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
    >
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
        <span className="text-foreground/70 font-medium">{anonHandle}</span>
        <span>·</span>
        <span>{timeAgo(post.created_at)}</span>
      </div>
      <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{post.body}</p>

      <div className="flex items-center gap-4 mt-3">
        <VoteButtons score={liveScore} userVote={userVote} onUpvote={handleUpvote} onDownvote={handleDownvote} size="sm" horizontal />
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          {post.comment_count}
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="mt-3 pt-3 border-t border-border/30 space-y-2">
              {user && (
                <div className="flex gap-2 mb-3">
                  <Textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Comment anonymously..." className="min-h-[40px] text-sm bg-muted/50 resize-none" rows={1} />
                  <Button size="sm" onClick={handleComment} disabled={createComment.isPending} className="h-auto">
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
              )}
              {comments.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">No comments yet</p>}
              {comments.map((c) => <GossipCommentItem key={c.id} comment={c} gossipId={post.id} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Gossip() {
  const navigate = useNavigate();
  const { user, profile, loading, refreshProfile } = useAuth();
  const [postText, setPostText] = useState("");
  const { data: posts = [], isLoading } = useGossipPosts();
  const createPost = useCreateGossipPost();

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center space-y-4">
        <h1 className="text-xl font-semibold text-foreground">Gossip Central</h1>
        <p className="text-sm text-muted-foreground">Sign in to access Gossip Central.</p>
        <Button onClick={() => navigate("/auth")}>Sign In</Button>
      </div>
    );
  }

  const isMember = (profile as any)?.gossip_member === true;

  const handleJoin = async () => {
    await supabase.from("profiles").update({ gossip_member: true }).eq("user_id", user.id);
    await refreshProfile();
    toast.success("Welcome to Gossip Central!");
  };

  if (!isMember) return <GossipGate onJoin={handleJoin} />;

  const handlePost = async () => {
    if (!postText.trim()) return;
    try {
      await createPost.mutateAsync(postText.trim());
      setPostText("");
      toast.success("Posted! Pending moderation.");
    } catch {
      toast.error("Failed to post");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <EyeOff className="h-4 w-4 text-muted-foreground" />
        <h1 className="text-lg font-semibold text-foreground">Gossip Central</h1>
        <Badge variant="secondary" className="text-[10px]">Anonymous</Badge>
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        <Textarea
          value={postText}
          onChange={(e) => setPostText(e.target.value.slice(0, 500))}
          placeholder="Share something anonymously..."
          className="bg-transparent border-none focus-visible:ring-0 resize-none min-h-[60px] text-sm placeholder:text-muted-foreground/50"
          rows={2}
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] text-muted-foreground">{postText.length}/500</span>
          <Button size="sm" onClick={handlePost} disabled={!postText.trim() || createPost.isPending} className="gap-1">
            <Send className="h-3 w-3" /> Post
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : posts.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-8">No gossip yet. Be the first!</p>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => <GossipPostCard key={post.id} post={post} />)}
        </div>
      )}
    </div>
  );
}
