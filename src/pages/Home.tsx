import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RefreshCw, BookOpen, Globe, Briefcase, FileText, Sparkles } from "lucide-react";
import PostCard from "@/components/feed/PostCard";
import CategoryTabs from "@/components/feed/CategoryTabs";
import SortBar from "@/components/feed/SortBar";
import LeaderboardWidget from "@/components/feed/LeaderboardWidget";
import FeedWelcome from "@/components/feed/FeedWelcome";
import SkeletonCard from "@/components/feed/SkeletonCard";
import StatCard from "@/components/shared/StatCard";
import QuickAccessCard from "@/components/shared/QuickAccessCard";
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      {/* Hero */}
      {!user && <FeedWelcome />}

      {/* Dashboard Section */}
      <div className="mb-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-4">
          <StatCard icon={BookOpen} label="Course Reviews" count={stats?.courseReviews ?? 0} gradient="from-blue-500/15 to-blue-500/5" />
          <StatCard icon={Globe} label="Exchange Diaries" count={stats?.exchangeDiaries ?? 0} gradient="from-green-500/15 to-green-500/5" />
          <StatCard icon={Briefcase} label="Internship Reports" count={stats?.internshipReports ?? 0} gradient="from-purple-500/15 to-purple-500/5" />
          <StatCard icon={FileText} label="Exam Papers" count={stats?.examPapers ?? 0} gradient="from-orange-500/15 to-orange-500/5" />
        </div>

        {/* Quick Access */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          <QuickAccessCard
            icon={BookOpen}
            title="Academics"
            subtitle="Course reviews, tips & ratings"
            to="/academics"
            gradient="from-blue-500/10 to-primary/5"
          />
          <QuickAccessCard
            icon={Globe}
            title="Exchange"
            subtitle="College diaries & comparisons"
            to="/exchange"
            gradient="from-green-500/10 to-primary/5"
          />
          <QuickAccessCard
            icon={Briefcase}
            title="Internships"
            subtitle="Company intel & reviews"
            to="/internships"
            gradient="from-purple-500/10 to-primary/5"
          />
        </div>
      </div>

      {/* Community Feed */}
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold">Community Feed</h2>
      </div>

      <div className="mb-3">
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
          <div className="text-center py-20 bg-card/50 border border-border/40 rounded-xl">
            <p className="text-sm font-medium text-foreground mb-1">Something went wrong</p>
            <p className="text-xs text-muted-foreground mb-4">Could not load posts</p>
            <Button onClick={() => refetch()} size="sm" variant="outline" className="rounded-full gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" /> Try Again
            </Button>
          </div>
        ) : isLoading ? (
          <div>
            {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-card/50 border border-border/40 rounded-xl">
            <p className="text-sm font-medium text-foreground mb-1">
              {search.trim() ? `No results for "${search}"` : "No threads yet"}
            </p>
            <p className="text-xs text-muted-foreground">
              {search.trim() ? "Try different keywords" : "Be the first to start a conversation"}
            </p>
          </div>
        ) : (
          <>
            {posts.map((post, i) => (
              <div key={post.id}>
                <PostCard
                  id={post.id}
                  title={post.title}
                  body={post.body}
                  category={post.category}
                  flair={post.flair}
                  upvote_count={post.upvote_count}
                  downvote_count={post.downvote_count}
                  comment_count={post.comment_count}
                  pinned={post.pinned}
                  course_code={post.course_code}
                  course_name={post.course_name}
                  company_name={post.company_name}
                  college_name={post.college_name}
                  created_at={post.created_at}
                  user_id={post.user_id}
                />
                {i === 3 && <div className="mb-3"><LeaderboardWidget /></div>}
              </div>
            ))}
          </>
        )}
      </div>
      <AuthGuardDialog open={showAuth} onOpenChange={setShowAuth} action="create a post" />
    </div>
  );
}
