import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, BookOpen, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FilterPills from "@/components/shared/FilterPills";
import StarRating from "@/components/shared/StarRating";
import { useCourses } from "@/hooks/useCourses";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { SAMPLE_COURSES } from "@/lib/sample-data";

const CATEGORY_OPTIONS = [
  { value: "all", label: "All" },
  { value: "core", label: "Core" },
  { value: "elective", label: "Elective" },
];

const DOMAIN_OPTIONS = [
  { value: "all", label: "All Domains" },
  { value: "finance", label: "Finance" },
  { value: "marketing", label: "Marketing" },
  { value: "strategy", label: "Strategy" },
  { value: "operations", label: "Operations" },
  { value: "economics", label: "Economics" },
  { value: "analytics", label: "Analytics" },
  { value: "hr", label: "HR" },
  { value: "general", label: "General" },
];

export default function Academics() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("all");
  const [domain, setDomain] = useState("all");
  const [search, setSearch] = useState("");
  const { data: courses = [], isLoading } = useCourses(category, domain, search);

  const showSamples = !isLoading && courses.length === 0 && !search.trim();
  const displayCourses = showSamples ? SAMPLE_COURSES : courses;

  return (
    <div className="max-w-3xl mx-auto px-4 py-4">
      <button onClick={() => navigate("/")} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">📚 Academics</h1>
          <p className="text-xs text-muted-foreground mt-1">Course reviews, tips & study strategies from your peers</p>
        </div>
        <Button size="sm" className="rounded-full gap-1.5 text-xs" onClick={() => navigate("/submit")}>
          <PenLine className="h-3.5 w-3.5" /> Add Review
        </Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm rounded-full bg-card border-border" />
      </div>

      <div className="space-y-3 mb-5">
        <FilterPills options={CATEGORY_OPTIONS} selected={category} onSelect={setCategory} />
        <FilterPills options={DOMAIN_OPTIONS} selected={domain} onSelect={setDomain} />
      </div>

      {showSamples && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 mb-4 text-center">
          <p className="text-xs text-primary font-medium">👋 These are examples to show what this section will look like.</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Add your own reviews to make this useful for everyone!</p>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-36 rounded-xl" />)}
        </div>
      ) : displayCourses.length === 0 ? (
        <div className="text-center py-20 bg-card/50 border border-border/40 rounded-xl">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-sm font-medium">No courses found</p>
          <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {displayCourses.map((c) => (
            <button
              key={c.id}
              onClick={() => !showSamples && navigate(`/academics/${c.id}`)}
              className="text-left rounded-xl border border-border bg-card p-4 hover:border-primary/50 transition-colors relative"
            >
              {showSamples && <Badge variant="secondary" className="absolute top-2 right-2 text-[9px]">Sample</Badge>}
              <div className="flex items-start justify-between mb-2">
                <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">{c.code || "N/A"}</span>
                <span className="text-[10px] text-muted-foreground capitalize">{c.category}</span>
              </div>
              <h3 className="text-sm font-semibold mb-1 line-clamp-1">{c.name}</h3>
              <p className="text-[11px] text-muted-foreground mb-2">{c.professor || "TBD"} · {c.term || "—"}</p>
              <div className="flex items-center justify-between">
                <StarRating rating={Number(c.avg_rating)} />
                <span className="text-[10px] text-muted-foreground">{c.review_count} review{c.review_count !== 1 ? "s" : ""}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
