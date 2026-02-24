import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, PenLine, Briefcase, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import FilterPills from "@/components/shared/FilterPills";
import StarRating from "@/components/shared/StarRating";
import { useInternshipCompanies } from "@/hooks/useInternshipCompanies";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { SAMPLE_INTERNSHIPS } from "@/lib/sample-data";
import { useShouldShowSamples } from "@/hooks/useShouldShowSamples";

const DOMAIN_OPTIONS = [
  { value: "all", label: "All" },
  { value: "consulting", label: "Consulting" },
  { value: "finance", label: "Finance" },
  { value: "pm", label: "Product Mgmt" },
  { value: "strategy_ops", label: "Strategy & Ops" },
  { value: "marketing", label: "Marketing" },
  { value: "tech", label: "Tech" },
  { value: "gm", label: "General Mgmt" },
];

export default function Internships() {
  const navigate = useNavigate();
  const [domain, setDomain] = useState("all");
  const [sort, setSort] = useState("rating");
  const { data: companies = [], isLoading } = useInternshipCompanies(domain, sort);
  const shouldShowSamples = useShouldShowSamples();

  const showSamples = !isLoading && companies.length === 0 && shouldShowSamples;
  const displayCompanies = showSamples ? SAMPLE_INTERNSHIPS : companies;

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Briefcase className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Internship Intel</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Company intel from your batchmates</p>
          </div>
        </div>
        <Button size="sm" className="rounded-lg gap-1.5 text-xs" onClick={() => navigate("/submit?category=internships")}>
          <PenLine className="h-3.5 w-3.5" /> Add Review
        </Button>
      </div>
      <div className="mb-5">
        <FilterPills options={DOMAIN_OPTIONS} selected={domain} onSelect={setDomain} />
      </div>
      <div className="flex items-center gap-2 mb-5">
        <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
        <FilterPills options={[
          { value: "rating", label: "Top Rated" },
          { value: "reviews", label: "Most Reviewed" },
          { value: "newest", label: "Newest" },
        ]} selected={sort} onSelect={setSort} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
      ) : displayCompanies.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <p className="text-sm font-medium">No companies found</p>
          <p className="text-xs text-muted-foreground mt-1">Be the first to share your internship experience</p>
          <Button size="sm" className="mt-4 rounded-lg" onClick={() => navigate("/submit?category=internships")}>Add Review</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {displayCompanies.map(c => (
            <button key={c.id} onClick={() => navigate(`/internships/${c.id}`)} className="text-left rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                  {c.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-medium">{c.name}</h3>
                  <p className="text-[10px] text-muted-foreground capitalize">{c.domain.replace("_", " ")} · {c.avg_stipend || "—"}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mb-2">
                <StarRating rating={Number(c.avg_rating)} />
                <span className="text-[10px] text-muted-foreground">{c.review_count} review{c.review_count !== 1 ? "s" : ""}</span>
              </div>
              {c.highlights.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {c.highlights.slice(0, 3).map(h => <Badge key={h} variant="secondary" className="text-[10px]">{h}</Badge>)}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
