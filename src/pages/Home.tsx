import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PostCard from "@/components/feed/PostCard";
import CategoryTabs from "@/components/feed/CategoryTabs";
import SortBar from "@/components/feed/SortBar";
import { MOCK_POSTS } from "@/lib/mock-data";

export default function Home() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<"hot" | "new" | "top">("hot");
  const [search, setSearch] = useState("");

  const filteredPosts = useMemo(() => {
    let posts = [...MOCK_POSTS];

    if (category !== "all") {
      posts = posts.filter((p) => p.category === category);
    }

    if (search) {
      const q = search.toLowerCase();
      posts = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.body.toLowerCase().includes(q) ||
          p.course_name?.toLowerCase().includes(q) ||
          p.company_name?.toLowerCase().includes(q) ||
          p.college_name?.toLowerCase().includes(q)
      );
    }

    if (sort === "new") {
      posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sort === "top") {
      posts.sort((a, b) => (b.upvote_count - b.downvote_count) - (a.upvote_count - a.downvote_count));
    } else {
      posts.sort((a, b) => {
        const scoreA = (a.upvote_count - a.downvote_count) + a.comment_count * 2;
        const scoreB = (b.upvote_count - b.downvote_count) + b.comment_count * 2;
        const ageA = (Date.now() - new Date(a.created_at).getTime()) / 3600000;
        const ageB = (Date.now() - new Date(b.created_at).getTime()) / 3600000;
        return (scoreB / Math.pow(ageB + 2, 1.5)) - (scoreA / Math.pow(ageA + 2, 1.5));
      });
    }

    const pinned = posts.filter((p) => p.pinned);
    const unpinned = posts.filter((p) => !p.pinned);
    return [...pinned, ...unpinned];
  }, [category, sort, search]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-4">
      <div className="flex gap-6">
        {/* Main feed */}
        <div className="flex-1 min-w-0">
          {/* Sort bar */}
          <div className="flex items-center justify-between mb-3">
            <SortBar selected={sort} onSelect={setSort} />
          </div>

          {/* Posts */}
          <div>
            {filteredPosts.length === 0 ? (
              <div className="text-center py-16 bg-card border border-border rounded-lg">
                <p className="text-sm font-medium text-foreground mb-1">No threads found</p>
                <p className="text-xs text-muted-foreground">Be the first to start a conversation</p>
              </div>
            ) : (
              filteredPosts.map((post) => (
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
                  author_name={post.author_name}
                  author_batch={post.author_batch}
                />
              ))
            )}
          </div>
        </div>

        {/* Sidebar - desktop */}
        <aside className="hidden lg:block w-80 flex-shrink-0 space-y-3">
          {/* Community card */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="bg-primary h-8" />
            <div className="p-4">
              <h2 className="font-bold text-sm text-foreground mb-1">About Digital Mitra</h2>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                The unofficial student community for IIM Bangalore. Share reviews, experiences, and insider knowledge.
              </p>
              <div className="grid grid-cols-2 gap-3 py-3 border-t border-border">
                <div>
                  <p className="font-bold text-sm text-foreground">2.1k</p>
                  <p className="text-[10px] text-muted-foreground">Members</p>
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-online" />
                    <p className="font-bold text-sm text-foreground">147</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Online</p>
                </div>
              </div>
              <Button
                className="w-full rounded-full mt-2 font-bold text-xs"
                onClick={() => navigate("/submit")}
              >
                Create Post
              </Button>
            </div>
          </div>

          {/* Category filter */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-bold text-xs text-muted-foreground uppercase tracking-wider mb-3">Communities</h3>
            <CategoryTabs selected={category} onSelect={setCategory} />
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
    </div>
  );
}
