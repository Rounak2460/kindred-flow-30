import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import StarRating from "@/components/shared/StarRating";
import RatingBar from "@/components/shared/RatingBar";
import { useInternshipCompany } from "@/hooks/useInternshipCompanies";
import { useInternshipReviews } from "@/hooks/useInternshipReviews";
import { generateAnonHandle } from "@/lib/anonymity";
import { formatDistanceToNow } from "date-fns";

export default function InternshipDetail() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const { data: company, isLoading } = useInternshipCompany(companyId);
  const { data: reviews = [] } = useInternshipReviews(companyId);

  const avg = (key: "work_culture_rating" | "learning_rating" | "mentorship_rating" | "ppo_rating") =>
    reviews.length ? reviews.reduce((s, r) => s + r[key], 0) / reviews.length : 0;

  if (isLoading) return <div className="max-w-3xl mx-auto px-4 py-8"><Skeleton className="h-48 rounded-xl" /></div>;
  if (!company) return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-sm text-muted-foreground">Company not found</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-4">
      <button onClick={() => navigate("/internships")} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-3.5 w-3.5" /> Internships
      </button>
      <div className="rounded-xl border border-border bg-card p-5 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
            {company.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-lg font-bold">{company.name}</h1>
            <p className="text-xs text-muted-foreground capitalize">{company.domain.replace("_", " ")} · Avg stipend: {company.avg_stipend || "—"}</p>
          </div>
        </div>
        <StarRating rating={Number(company.avg_rating)} size="md" />
        {company.description && <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{company.description}</p>}
      </div>

      {reviews.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5 mb-4 space-y-3">
          <h2 className="text-sm font-semibold">Rating Breakdown</h2>
          <RatingBar label="Work Culture" value={avg("work_culture_rating")} />
          <RatingBar label="Learning" value={avg("learning_rating")} />
          <RatingBar label="Mentorship" value={avg("mentorship_rating")} />
          <RatingBar label="PPO Conversion" value={avg("ppo_rating")} />
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold">Intern Reviews ({reviews.length})</h2>
        <Button size="sm" variant="outline" className="rounded-full gap-1.5 text-xs" onClick={() => navigate("/submit")}>
          <PenLine className="h-3.5 w-3.5" /> Write Review
        </Button>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-card/50 border border-border/40 rounded-xl"><p className="text-sm">No reviews yet</p></div>
      ) : (
        <div className="space-y-3">
          {reviews.map(r => (
            <div key={r.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium">{generateAnonHandle(r.user_id)}</span>
                <span className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">Stipend: {r.stipend || "—"}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{r.review_text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
