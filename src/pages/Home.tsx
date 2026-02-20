import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, Loader2 } from "lucide-react";
import PostCard from "@/components/feed/PostCard";
import CategoryTabs from "@/components/feed/CategoryTabs";
import SortBar from "@/components/feed/SortBar";
import LeaderboardWidget from "@/components/feed/LeaderboardWidget";
import { useAuth } from "@/contexts/AuthContext";
import AuthGuardDialog from "@/components/AuthGuardDialog";
import { usePosts } from "@/hooks/usePosts";
import { useVote } from "@/hooks/useVote";
import { CATEGORIES } from "@/lib/mock-data";

const COMMUNITIES = [
  { key: "academics", label: "Academics", icon: "📚", members: "1.8k" },
  { key: "exchange", label: "Exchange", icon: "✈️", members: "920" },
  { key: "internships", label: "Internships", icon: "💼", members: "1.5k" },
  { key: "campus", label: "Campus Life", icon: "🏫", members: "2.1k" },
  { key: "papers", label: "Exam Papers", icon: "📝", members: "1.2k" },
];

export default function Home() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<"hot" | "new" | "top">("hot");
  const [search, setSearch] = useState("");
  const [showAuth, setShowAuth] = useState(false);

  const { data: posts = [], isLoading } = usePosts(category, sort, search);

  return (
    <div className="max-w-5xl mx-auto px-4 py-4">
      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts, courses, companies…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-9 h-10 bg-card border-border text-sm rounded-full hover:bg-accent focus-visible:bg-accent focus-visible:ring-1 focus-visible:ring-border"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="mb-3">
            <CategoryTabs selected={category} onSelect={setCategory} />
          </div>

          <div className="flex items-center justify-between mb-3">
            <SortBar selected={sort} onSelect={setSort} />
            {search.trim() && (
              <span className="text-xs text-muted-foreground">{posts.length} result{posts.length !== 1 ? "s" : ""}</span>
            )}
          </div>

          {/* Posts */}
          <div>
            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16 bg-card border border-border rounded-lg">
                <p className="text-sm font-medium text-foreground mb-1">
                  {search.trim() ? `No results for "${search}"` : "No threads found"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {search.trim() ? "Try different keywords" : "Be the first to start a conversation"}
                </p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
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
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:block w-80 flex-shrink-0 space-y-3">
          {/* About card */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="bg-primary h-8" />
            <div className="p-4">
              <h2 className="font-bold text-sm text-foreground mb-1">About Digital Mitra</h2>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                The unofficial student community for IIM Bangalore. Share reviews, experiences, and insider knowledge.
              </p>
              {/* Early adopter banner */}
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-3">
                <p className="text-[11px] font-bold text-primary mb-1">🔥 Early Adopter Bonus Active</p>
                <p className="text-[10px] text-muted-foreground">
                  First 50 posters get <span className="text-foreground font-bold">Founding Contributor</span> badge + <span className="text-foreground font-bold">2× credits</span> per post!
                </p>
              </div>
              {profile && (
                <div className="grid grid-cols-2 gap-3 py-3 border-t border-border">
                  <div>
                    <p className="font-bold text-sm text-foreground">{profile.credits}</p>
                    <p className="text-[10px] text-muted-foreground">Your Credits</p>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-foreground">{Math.max(0, 5 - profile.free_views_used)}</p>
                    <p className="text-[10px] text-muted-foreground">Free Views Left</p>
                  </div>
                </div>
              )}
              <Button
                className="w-full rounded-full mt-2 font-bold text-xs"
                onClick={() => {
                  if (!user) { setShowAuth(true); return; }
                  navigate("/submit");
                }}
              >
                Create Post
              </Button>
            </div>
          </div>

          {/* Leaderboard */}
          <LeaderboardWidget />

          {/* Communities */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-bold text-xs text-muted-foreground uppercase tracking-wider mb-3">Communities</h3>
            <div className="space-y-1">
              {COMMUNITIES.map((c) => (
                <button
                  key={c.key}
                  onClick={() => navigate(`/d/${c.key}`)}
                  className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-accent transition-colors text-left"
                >
                  <span className="text-lg">{c.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">d/{c.key}</p>
                    <p className="text-[10px] text-muted-foreground">{c.members} members</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Rules */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-bold text-xs text-muted-foreground uppercase tracking-wider mb-3">Rules</h3>
            <ol className="space-y-2 text-xs text-muted-foreground">
              <li className="flex gap-2"><span className="text-foreground font-bold">1.</span> Use @iimb.ac.in email to verify</li>
              <li className="flex gap-2"><span className="text-foreground font-bold">2.</span> Be respectful and constructive</li>
              <li className="flex gap-2"><span className="text-foreground font-bold">3.</span> No placement-specific numbers</li>
              <li className="flex gap-2"><span className="text-foreground font-bold">4.</span> Tag posts with correct flair</li>
              <li className="flex gap-2"><span className="text-foreground font-bold">5.</span> No doxxing or personal attacks</li>
            </ol>
          </div>
        </aside>
      </div>
      <AuthGuardDialog open={showAuth} onOpenChange={setShowAuth} action="create a post" />
    </div>
  );
}
