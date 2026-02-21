import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Star, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import FilterPills from "@/components/shared/FilterPills";
import StarRating from "@/components/shared/StarRating";
import { useCampusTips } from "@/hooks/useCampusTips";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const CATEGORY_OPTIONS = [
  { value: "all", label: "All" },
  { value: "food_cafes", label: "🍕 Food & Cafes" },
  { value: "study_spots", label: "📚 Study Spots" },
  { value: "weekend_getaways", label: "🏖️ Getaways" },
  { value: "gyms_sports", label: "🏋️ Gyms & Sports" },
  { value: "transport", label: "🚗 Transport" },
  { value: "shopping", label: "🛍️ Shopping" },
];

export default function CampusLife() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("all");
  const { data: tips = [], isLoading } = useCampusTips(category);

  return (
    <div className="max-w-3xl mx-auto px-4 py-4">
      <button onClick={() => navigate("/")} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Campus Life</h1>
          <p className="text-xs text-muted-foreground mt-1">The unofficial survival guide</p>
        </div>
        <Button size="sm" className="rounded-full gap-1.5 text-xs" onClick={() => navigate("/submit")}>
          <PenLine className="h-3.5 w-3.5" /> Add Tip
        </Button>
      </div>
      <div className="mb-5">
        <FilterPills options={CATEGORY_OPTIONS} selected={category} onSelect={setCategory} />
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">{[1,2,3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
      ) : tips.length === 0 ? (
        <div className="text-center py-20 bg-card/50 border border-border/40 rounded-xl"><p className="text-sm font-medium">No tips yet</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {tips.map(t => (
            <div key={t.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary" className="text-[10px] capitalize">{t.category.replace("_", " ")}</Badge>
                <StarRating rating={t.rating} showValue={false} />
              </div>
              <h3 className="text-sm font-semibold mb-1">{t.name}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{t.tip_text}</p>
              <div className="flex items-center gap-1 mt-2 text-muted-foreground">
                <span className="text-[10px]">👍 {t.useful_count} useful</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
