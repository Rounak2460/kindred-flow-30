import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, PenLine, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import FilterPills from "@/components/shared/FilterPills";
import StarRating from "@/components/shared/StarRating";
import { useCampusTips } from "@/hooks/useCampusTips";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { SAMPLE_TIPS } from "@/lib/sample-data";
import { useShouldShowSamples } from "@/hooks/useShouldShowSamples";

const CATEGORY_OPTIONS = [
  { value: "all", label: "All" },
  { value: "food_cafes", label: "Food & Cafes" },
  { value: "study_spots", label: "Study Spots" },
  { value: "weekend_getaways", label: "Getaways" },
  { value: "gyms_sports", label: "Gyms & Sports" },
  { value: "transport", label: "Transport" },
  { value: "shopping", label: "Shopping" },
];

export default function CampusLife() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("all");
  const { data: tips = [], isLoading } = useCampusTips(category);
  const shouldShowSamples = useShouldShowSamples();

  const showSamples = !isLoading && tips.length === 0 && shouldShowSamples;
  const displayTips = showSamples ? SAMPLE_TIPS : tips;

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
            <MapPin className="h-5 w-5 text-rose-500" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Campus Life</h1>
            <p className="text-xs text-muted-foreground mt-0.5">The unofficial survival guide</p>
          </div>
        </div>
        <Button size="sm" className="rounded-lg gap-1.5 text-xs" onClick={() => navigate("/submit?category=campus")}>
          <PenLine className="h-3.5 w-3.5" /> Add Tip
        </Button>
      </div>
      <div className="mb-5">
        <FilterPills options={CATEGORY_OPTIONS} selected={category} onSelect={setCategory} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{[1,2,3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
      ) : displayTips.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <p className="text-sm font-medium">No tips yet</p>
          <p className="text-xs text-muted-foreground mt-1">Share your campus knowledge</p>
          <Button size="sm" className="mt-4 rounded-lg" onClick={() => navigate("/submit?category=campus")}>Add Tip</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {displayTips.map(t => (
            <div key={t.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary" className="text-[10px] capitalize">{t.category.replace("_", " ")}</Badge>
                <StarRating rating={t.rating} showValue={false} />
              </div>
              <h3 className="text-sm font-medium mb-1.5">{t.name}</h3>
              <div className="border-l-2 border-rose-500/40 pl-3">
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{t.tip_text}</p>
              </div>
              <div className="flex items-center gap-1.5 mt-2.5 text-muted-foreground">
                <span className="text-[10px]">👍 {t.useful_count} found useful</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
