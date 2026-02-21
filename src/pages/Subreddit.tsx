import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import PostCard from "@/components/feed/PostCard";
import SortBar from "@/components/feed/SortBar";
import { CATEGORIES } from "@/lib/mock-data";
import { useAuth } from "@/contexts/AuthContext";
import AuthGuardDialog from "@/components/AuthGuardDialog";
import { usePosts } from "@/hooks/usePosts";

const SUBREDDIT_INFO: Record<string, { desc: string; members: string; icon: string }> = {
  academics: { desc: "Course reviews, professor insights, study tips, and elective advice from fellow IIMB students.", members: "1.8k", icon: "📚" },
  exchange: { desc: "Exchange semester experiences, application tips, and living abroad guides.", members: "920", icon: "✈️" },
  internships: { desc: "Company reviews, interview prep, stipend info, and PPO experiences.", members: "1.5k", icon: "💼" },
  campus: { desc: "Food spots, study locations, weekend getaways, and campus life tips.", members: "2.1k", icon: "🏫" },
  papers: { desc: "Exam papers, solutions, quizzes, and study materials shared by students.", members: "1.2k", icon: "📝" },
};

export default function Subreddit() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sort, setSort] = useState<"hot" | "new" | "top">("hot");
  const [showAuth, setShowAuth] = useState(false);

  const catInfo = category ? SUBREDDIT_INFO[category] : null;
  const catLabel = CATEGORIES.find(c => c.key === category)?.label || category;

  const { data: posts = [], isLoading, isError, refetch } = usePosts(category, sort);

  if (!catInfo) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-lg font-semibold text-foreground mb-2">Community not found</p>
        <p className="text-sm text-muted-foreground mb-4">d/{category} doesn't exist yet.</p>
        <Button variant="outline" onClick={() => navigate("/")}>Back to Home</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      {/* Banner */}
      <div className="bg-card border border-border rounded-xl overflow-hidden mb-4">
        <div className="h-20 bg-gradient-to-r from-primary/30 to-primary/10" />
        <div className="p-4 -mt-6">
          <div className="flex items-end gap-3 mb-3">
            <div className="h-14 w-14 rounded-full bg-card border-4 border-card flex items-center justify-center text-2xl shadow-md">
              {catInfo.icon}
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <h1 className="font-semibold text-xl text-foreground">d/{category}</h1>
              <p className="text-xs text-muted-foreground">{catLabel} • {catInfo.members} members</p>
            </div>
            <Button
              size="sm"
              className="rounded-lg font-semibold text-xs"
              onClick={() => {
                if (!user) { setShowAuth(true); return; }
                navigate(`/submit?category=${category}`);
              }}
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Create Post
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">{catInfo.desc}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <SortBar selected={sort} onSelect={setSort} />
        <span className="text-xs text-muted-foreground">{posts.length} posts</span>
      </div>

      <div>
        {isError ? (
          <div className="text-center py-16 bg-card border border-border rounded-xl">
            <p className="text-sm font-medium text-foreground mb-1">Something went wrong</p>
            <p className="text-xs text-muted-foreground mb-3">Could not load posts</p>
            <Button onClick={() => refetch()} size="sm" variant="outline" className="rounded-lg gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" /> Try Again
            </Button>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-xl">
            <p className="text-sm font-medium text-foreground mb-1">No posts in d/{category} yet</p>
            <p className="text-xs text-muted-foreground">Be the first to start a conversation</p>
          </div>
        ) : (
          posts.map(post => (
            <PostCard
              key={post.id}
              id={post.id} title={post.title} body={post.body} category={post.category}
              flair={post.flair} upvote_count={post.upvote_count} downvote_count={post.downvote_count}
              comment_count={post.comment_count} pinned={post.pinned} course_code={post.course_code}
              course_name={post.course_name} company_name={post.company_name} college_name={post.college_name}
              created_at={post.created_at} user_id={post.user_id}
            />
          ))
        )}
      </div>
      <AuthGuardDialog open={showAuth} onOpenChange={setShowAuth} action="create a post" />
    </div>
  );
}
