import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import StarRating from "@/components/shared/StarRating";
import RatingBar from "@/components/shared/RatingBar";
import { useExchangeCollege } from "@/hooks/useExchangeColleges";
import { useExchangeReviews } from "@/hooks/useExchangeReviews";
import { SAMPLE_EXCHANGE } from "@/lib/sample-data";
import { SAMPLE_EXCHANGE_REVIEWS } from "@/lib/sample-detail-data";
import { generateAnonHandle } from "@/lib/anonymity";
import { formatDistanceToNow } from "date-fns";

const MINI_BAR_COLORS = [
  { label: "Academics", key: "academics_rating" as const, color: "bg-blue-500" },
  { label: "Living", key: "living_costs_rating" as const, color: "bg-amber-500" },
  { label: "Social", key: "social_life_rating" as const, color: "bg-pink-500" },
  { label: "Travel", key: "travel_rating" as const, color: "bg-emerald-500" },
];

export default function ExchangeDetail() {
  const { collegeId } = useParams();
  const navigate = useNavigate();

  const isSample = collegeId?.startsWith("sample-");
  const { data: dbCollege, isLoading } = useExchangeCollege(isSample ? undefined : collegeId);
  const { data: dbReviews = [] } = useExchangeReviews(isSample ? undefined : collegeId);

  const college = isSample ? SAMPLE_EXCHANGE.find(c => c.id === collegeId) : dbCollege;
  const reviews = isSample ? (SAMPLE_EXCHANGE_REVIEWS[collegeId!] || []) : dbReviews;

  const avg = (key: "academics_rating" | "living_costs_rating" | "social_life_rating" | "travel_rating") =>
    reviews.length ? reviews.reduce((s, r) => s + r[key], 0) / reviews.length : 0;

  if (!isSample && isLoading) return <div className="max-w-2xl mx-auto px-4 py-8"><Skeleton className="h-48 rounded-xl" /></div>;
  if (!college) return <div className="max-w-2xl mx-auto px-4 py-20 text-center text-sm text-muted-foreground">College not found</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      <button onClick={() => navigate("/exchange")} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-3.5 w-3.5" /> Exchange Programs
      </button>
      <div className="rounded-xl border border-border bg-card p-5 mb-4">
        <h1 className="text-lg font-semibold mb-1">{college.name}</h1>
        <p className="text-xs text-muted-foreground mb-3">{college.country} · {(college as any).region?.replace("_", " ")}</p>
        <StarRating rating={Number(college.avg_rating)} size="md" />
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
        <Button size="sm" variant="outline" className="rounded-lg gap-1.5 text-xs" onClick={() => navigate(`/submit?category=exchange&collegeId=${collegeId}`)}>
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
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium">{generateAnonHandle(r.user_id)}</span>
                <span className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</span>
              </div>
              {/* Mini bar ratings */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                {MINI_BAR_COLORS.map(({ label, key, color }) => (
                  <div key={key} className="text-center">
                    <div className="h-1.5 rounded-full bg-muted mb-1 overflow-hidden">
                      <div className={`h-full rounded-full ${color}`} style={{ width: `${(r[key] / 5) * 100}%` }} />
                    </div>
                    <p className="text-[10px] text-muted-foreground">{label}</p>
                    <p className="text-xs font-semibold">{r[key]}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{r.review_text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
