import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus } from "lucide-react";
import PostCard from "@/components/feed/PostCard";
import SkeletonCard from "@/components/feed/SkeletonCard";
import { useAuth } from "@/contexts/AuthContext";
import { usePosts } from "@/hooks/usePosts";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "all", label: "All" },
  { key: "courses", label: "Courses" },
  { key: "careers", label: "Careers" },
  { key: "life", label: "Life" },
];

const TAB_CATEGORY_MAP: Record<string, string> = {
  courses: "academics,papers",
  careers: "internships,placements",
  life: "campus,exchange,marketplace,events",
};

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState("all");
  const [sort, setSort] = useState<"hot" | "new" | "top">("new");

  const category = tab === "all" ? "all" : (TAB_CATEGORY_MAP[tab] || "all");
  const { data: posts = [], isLoading, isError, refetch } = usePosts(category, sort, "");

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-4">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors",
              tab === t.key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
        <div className="flex-1" />
        <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
          <button onClick={() => setSort("new")} className={cn("px-2 py-1 rounded transition-colors", sort === "new" ? "text-foreground font-medium" : "hover:text-foreground")}>New</button>
          <button onClick={() => setSort("top")} className={cn("px-2 py-1 rounded transition-colors", sort === "top" ? "text-foreground font-medium" : "hover:text-foreground")}>Top</button>
        </div>
      </div>

      {/* Feed */}
      <div>
        {isError ? (
          <div className="text-center py-16 bg-card border border-border/50 rounded-xl">
            <p className="text-sm font-medium text-foreground mb-1">Something went wrong</p>
            <p className="text-xs text-muted-foreground mb-4">Could not load posts</p>
            <Button onClick={() => refetch()} size="sm" variant="outline" className="rounded-lg gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" /> Try Again
            </Button>
          </div>
        ) : isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border/50 rounded-xl">
            <p className="text-sm font-medium text-foreground mb-1">No posts yet</p>
            <p className="text-xs text-muted-foreground mb-4">Be the first to start a conversation</p>
            {user && (
              <Button size="sm" className="rounded-lg gap-1.5" onClick={() => navigate("/submit")}>
                <Plus className="h-3.5 w-3.5" /> Start a Thread
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                id={post.id} title={post.title} body={post.body} category={post.category}
                flair={post.flair} upvote_count={post.upvote_count} downvote_count={post.downvote_count}
                comment_count={post.comment_count} pinned={post.pinned} course_code={post.course_code}
                course_name={post.course_name} company_name={post.company_name} college_name={post.college_name}
                created_at={post.created_at} user_id={post.user_id} is_anonymous={post.is_anonymous}
              />
            ))}
          </div>
        )}
      </div>

      {/* Mobile FAB */}
      {user && (
        <button
          onClick={() => navigate("/submit")}
          className="fixed bottom-20 right-4 md:hidden h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center z-40"
          aria-label="Create post"
        >
          <Plus className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
