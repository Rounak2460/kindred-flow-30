import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus } from "lucide-react";
import PostCard from "@/components/feed/PostCard";
import CategoryTabs from "@/components/feed/CategoryTabs";
import SortBar from "@/components/feed/SortBar";
import LeaderboardWidget from "@/components/feed/LeaderboardWidget";
import FeedWelcome from "@/components/feed/FeedWelcome";
import SkeletonCard from "@/components/feed/SkeletonCard";
import QuickActionCard from "@/components/home/QuickActionCard";
import { useAuth } from "@/contexts/AuthContext";
import AuthGuardDialog from "@/components/AuthGuardDialog";
import { usePosts } from "@/hooks/usePosts";
import { useStats } from "@/hooks/useStats";

export default function Home() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<"hot" | "new" | "top">("hot");
  const urlSearch = searchParams.get("q") || "";
  const [search, setSearch] = useState(urlSearch);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => { setSearch(urlSearch); }, [urlSearch]);

  const { data: posts = [], isLoading, isError, refetch } = usePosts(category, sort, search);
  const { data: stats } = useStats();

  const quickActions = [
    { emoji: "", title: "Courses", count: stats?.courseReviews ?? 0, countLabel: "reviews", to: "/academics", addTo: "/submit?category=academics" },
    { emoji: "", title: "Exchange", count: stats?.exchangeDiaries ?? 0, countLabel: "diaries", to: "/exchange", addTo: "/submit?category=exchange" },
    { emoji: "", title: "Internships", count: stats?.internshipReports ?? 0, countLabel: "reports", to: "/internships", addTo: "/submit?category=internships" },
    { emoji: "", title: "Papers", count: stats?.examPapers ?? 0, countLabel: "papers", to: "/exam-papers", addTo: "/submit?category=papers" },
    { emoji: "", title: "Campus", count: 0, countLabel: "tips", to: "/campus", addTo: "/submit?category=campus" },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      {!user && <FeedWelcome />}

      {/* Quick Actions */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">Explore</h2>
          {user && (
            <Button variant="ghost" size="sm" className="h-7 text-xs rounded-lg gap-1 text-primary hover:text-primary" onClick={() => navigate("/submit")}>
              <Plus className="h-3 w-3" /> Contribute
            </Button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide md:grid md:grid-cols-5 md:overflow-visible">
          {quickActions.map((a) => (
            <QuickActionCard key={a.title} {...a} />
          ))}
        </div>
      </div>

      {/* Community Feed */}
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-foreground mb-3">Community Feed</h2>
        <CategoryTabs selected={category} onSelect={setCategory} />
      </div>

      <div className="flex items-center justify-between mb-4">
        <SortBar selected={sort} onSelect={setSort} />
        {search.trim() && (
          <span className="text-xs text-muted-foreground tabular-nums">{posts.length} result{posts.length !== 1 ? "s" : ""}</span>
        )}
      </div>

      <div>
        {isError ? (
          <div className="text-center py-16 bg-card border border-border rounded-xl">
            <p className="text-sm font-medium text-foreground mb-1">Something went wrong</p>
            <p className="text-xs text-muted-foreground mb-4">Could not load posts</p>
            <Button onClick={() => refetch()} size="sm" variant="outline" className="rounded-lg gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" /> Try Again
            </Button>
          </div>
        ) : isLoading ? (
          <div>
            {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-xl">
            <p className="text-sm font-medium text-foreground mb-1">
              {search.trim() ? `No results for "${search}"` : "No threads yet"}
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              {search.trim() ? "Try different keywords" : "Be the first to start a conversation"}
            </p>
            {!search.trim() && user && (
              <Button size="sm" className="rounded-lg gap-1.5" onClick={() => navigate("/submit")}>
                <Plus className="h-3.5 w-3.5" /> Start a Thread
              </Button>
            )}
          </div>
        ) : (
          <div>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                id={post.id} title={post.title} body={post.body} category={post.category}
                flair={post.flair} upvote_count={post.upvote_count} downvote_count={post.downvote_count}
                comment_count={post.comment_count} pinned={post.pinned} course_code={post.course_code}
                course_name={post.course_name} company_name={post.company_name} college_name={post.college_name}
                created_at={post.created_at} user_id={post.user_id}
              />
            ))}
            <div className="mt-4">
              <LeaderboardWidget />
            </div>
          </div>
        )}
      </div>

      {/* Mobile FAB */}
      {user && (
        <button
          onClick={() => navigate("/submit")}
          className="fixed bottom-20 right-4 md:hidden h-12 w-12 rounded-xl bg-primary text-primary-foreground shadow-elevated flex items-center justify-center z-40"
          aria-label="Create post"
        >
          <Plus className="h-5 w-5" />
        </button>
      )}

      <AuthGuardDialog open={showAuth} onOpenChange={setShowAuth} action="create a post" />
    </div>
  );
}
