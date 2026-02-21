import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import FilterPills from "@/components/shared/FilterPills";
import StarRating from "@/components/shared/StarRating";
import { useExchangeColleges } from "@/hooks/useExchangeColleges";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { SAMPLE_EXCHANGE } from "@/lib/sample-data";

const REGION_OPTIONS = [
  { value: "all", label: "All" },
  { value: "europe", label: "Europe" },
  { value: "asia", label: "Asia" },
  { value: "north_america", label: "North America" },
  { value: "oceania", label: "Oceania" },
  { value: "south_america", label: "South America" },
];

export default function Exchange() {
  const navigate = useNavigate();
  const [region, setRegion] = useState("all");
  const { data: colleges = [], isLoading } = useExchangeColleges(region);

  const showSamples = !isLoading && colleges.length === 0;
  const displayColleges = showSamples ? SAMPLE_EXCHANGE : colleges;

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold">Exchange Programs</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Explore exchange colleges & read student diaries</p>
        </div>
        <Button size="sm" className="rounded-lg gap-1.5 text-xs" onClick={() => navigate("/submit?category=exchange")}>
          <PenLine className="h-3.5 w-3.5" /> Add Diary
        </Button>
      </div>
      <div className="mb-5">
        <FilterPills options={REGION_OPTIONS} selected={region} onSelect={setRegion} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
      ) : displayColleges.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <p className="text-sm font-medium">No colleges found</p>
          <p className="text-xs text-muted-foreground mt-1">Be the first to share your exchange experience</p>
          <Button size="sm" className="mt-4 rounded-lg" onClick={() => navigate("/submit?category=exchange")}>Add Diary</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {displayColleges.map(c => (
            <button key={c.id} onClick={() => navigate(`/exchange/${c.id}`)} className="text-left rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-colors">
              <h3 className="text-sm font-medium mb-1">{c.name}</h3>
              <p className="text-[11px] text-muted-foreground mb-2">{c.country} · {c.region.replace("_", " ")}</p>
              <div className="flex items-center justify-between mb-2">
                <StarRating rating={Number(c.avg_rating)} />
                <span className="text-[10px] text-muted-foreground">{c.review_count} diar{c.review_count !== 1 ? "ies" : "y"}</span>
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
