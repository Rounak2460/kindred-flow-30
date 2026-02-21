import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import StarRating from "@/components/shared/StarRating";
import RatingBar from "@/components/shared/RatingBar";
import { useExchangeCollege } from "@/hooks/useExchangeColleges";
import { useExchangeReviews } from "@/hooks/useExchangeReviews";
import { generateAnonHandle } from "@/lib/anonymity";
import { formatDistanceToNow } from "date-fns";

export default function ExchangeDetail() {
  const { collegeId } = useParams();
  const navigate = useNavigate();
  const { data: college, isLoading } = useExchangeCollege(collegeId);
  const { data: reviews = [] } = useExchangeReviews(collegeId);

  const avg = (key: "academics_rating" | "living_costs_rating" | "social_life_rating" | "travel_rating") =>
    reviews.length ? reviews.reduce((s, r) => s + r[key], 0) / reviews.length : 0;

  if (isLoading) return <div className="max-w-3xl mx-auto px-4 py-8"><Skeleton className="h-48 rounded-xl" /></div>;
  if (!college) return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-sm text-muted-foreground">College not found</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-4">
      <button onClick={() => navigate("/exchange")} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-3.5 w-3.5" /> Exchange
      </button>
      <div className="rounded-xl border border-border bg-card p-5 mb-4">
        <h1 className="text-lg font-bold mb-1">{college.name}</h1>
        <p className="text-xs text-muted-foreground mb-3">{college.country} · {college.region.replace("_", " ")}</p>
        <StarRating rating={Number(college.avg_rating)} size="md" />
        {college.description && <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{college.description}</p>}
      </div>

      {reviews.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5 mb-4 space-y-3">
          <h2 className="text-sm font-semibold">Rating Breakdown</h2>
          <RatingBar label="Academics" value={avg("academics_rating")} />
          <RatingBar label="Living & Costs" value={avg("living_costs_rating")} />
          <RatingBar label="Social Life" value={avg("social_life_rating")} />
          <RatingBar label="Travel" value={avg("travel_rating")} />
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold">Student Diaries ({reviews.length})</h2>
        <Button size="sm" variant="outline" className="rounded-full gap-1.5 text-xs" onClick={() => navigate("/submit")}>
          <PenLine className="h-3.5 w-3.5" /> Write Diary
        </Button>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-card/50 border border-border/40 rounded-xl">
          <p className="text-sm">No diaries yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map(r => (
            <div key={r.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium">{generateAnonHandle(r.user_id)}</span>
                <span className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{r.review_text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
