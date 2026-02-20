import { useState, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <div className="container mx-auto px-4 py-4 max-w-2xl">
      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Search threads…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 text-sm rounded-md bg-muted/50 border-border/50 focus-visible:bg-background"
        />
      </div>

      {/* Category tabs */}
      <CategoryTabs selected={category} onSelect={setCategory} />

      {/* Sort + Create */}
      <div className="flex items-center justify-between py-2">
        <SortBar selected={sort} onSelect={setSort} />
        <Button
          size="sm"
          variant="ghost"
          className="gap-1.5 text-xs text-primary hover:text-primary hover:bg-accent h-7"
          onClick={() => navigate("/submit")}
        >
          <Plus className="h-3 w-3" />
          Create Post
        </Button>
      </div>

      {/* Feed */}
      <div className="divide-y divide-border/50">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-sm font-medium mb-1">No threads found</p>
            <p className="text-xs">Be the first to start a conversation</p>
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
  );
}
