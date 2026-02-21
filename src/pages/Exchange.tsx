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
  { value: "europe", label: "🇪🇺 Europe" },
  { value: "asia", label: "🌏 Asia" },
  { value: "north_america", label: "🇺🇸 North America" },
  { value: "oceania", label: "🌊 Oceania" },
  { value: "south_america", label: "🌎 South America" },
];

export default function Exchange() {
  const navigate = useNavigate();
  const [region, setRegion] = useState("all");
  const { data: colleges = [], isLoading } = useExchangeColleges(region);

  const showSamples = !isLoading && colleges.length === 0;
  const displayColleges = showSamples ? SAMPLE_EXCHANGE : colleges;

  return (
    <div className="max-w-3xl mx-auto px-4 py-4">
      <button onClick={() => navigate("/")} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">🌍 Exchange Programs</h1>
          <p className="text-xs text-muted-foreground mt-1">Explore exchange colleges & read student diaries</p>
        </div>
        <Button size="sm" className="rounded-full gap-1.5 text-xs" onClick={() => navigate("/submit")}>
          <PenLine className="h-3.5 w-3.5" /> Add Diary
        </Button>
      </div>
      <div className="mb-5">
        <FilterPills options={REGION_OPTIONS} selected={region} onSelect={setRegion} />
      </div>

      {showSamples && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 mb-4 text-center">
          <p className="text-xs text-primary font-medium">👋 These are examples to show what this section will look like.</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Add your own exchange diaries to help future batches!</p>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-36 rounded-xl" />)}</div>
      ) : displayColleges.length === 0 ? (
        <div className="text-center py-20 bg-card/50 border border-border/40 rounded-xl">
          <div className="text-4xl mb-3">🌍</div>
          <p className="text-sm font-medium">No colleges found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {displayColleges.map(c => (
            <button key={c.id} onClick={() => !showSamples && navigate(`/exchange/${c.id}`)} className="text-left rounded-xl border border-border bg-card p-4 hover:border-primary/50 transition-colors relative">
              {showSamples && <Badge variant="secondary" className="absolute top-2 right-2 text-[9px]">Sample</Badge>}
              <h3 className="text-sm font-semibold mb-1">{c.name}</h3>
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
