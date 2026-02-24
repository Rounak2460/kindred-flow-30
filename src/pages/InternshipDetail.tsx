import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, PenLine, IndianRupee, Building2, BookOpen, Users, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import StarRating from "@/components/shared/StarRating";
import RatingBar from "@/components/shared/RatingBar";
import { useInternshipCompany } from "@/hooks/useInternshipCompanies";
import { useInternshipReviews } from "@/hooks/useInternshipReviews";
import { SAMPLE_INTERNSHIPS } from "@/lib/sample-data";
import { SAMPLE_INTERNSHIP_REVIEWS } from "@/lib/sample-detail-data";
import { generateAnonHandle } from "@/lib/anonymity";
import { formatDistanceToNow } from "date-fns";

function ratingColor(v: number) {
  if (v >= 4) return "text-emerald-500";
  if (v >= 3) return "text-amber-500";
  return "text-red-500";
}

const RATING_META = [
  { key: "work_culture_rating" as const, label: "Culture", Icon: Building2 },
  { key: "learning_rating" as const, label: "Learning", Icon: BookOpen },
  { key: "mentorship_rating" as const, label: "Mentorship", Icon: Users },
  { key: "ppo_rating" as const, label: "PPO", Icon: Award },
];

export default function InternshipDetail() {
  const { companyId } = useParams();
  const navigate = useNavigate();

  const isSample = companyId?.startsWith("sample-");
  const { data: dbCompany, isLoading } = useInternshipCompany(isSample ? undefined : companyId);
  const { data: dbReviews = [] } = useInternshipReviews(isSample ? undefined : companyId);

  const company = isSample ? SAMPLE_INTERNSHIPS.find(c => c.id === companyId) : dbCompany;
  const reviews = isSample ? (SAMPLE_INTERNSHIP_REVIEWS[companyId!] || []) : dbReviews;

  const avg = (key: "work_culture_rating" | "learning_rating" | "mentorship_rating" | "ppo_rating") =>
    reviews.length ? reviews.reduce((s, r) => s + r[key], 0) / reviews.length : 0;

  if (!isSample && isLoading) return <div className="max-w-2xl mx-auto px-4 py-8"><Skeleton className="h-48 rounded-xl" /></div>;
  if (!company) return <div className="max-w-2xl mx-auto px-4 py-20 text-center text-sm text-muted-foreground">Company not found</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      <button onClick={() => navigate("/internships")} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-3.5 w-3.5" /> Internships
      </button>
      <div className="rounded-xl border border-border bg-card p-5 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
            {company.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-lg font-semibold">{company.name}</h1>
            <p className="text-xs text-muted-foreground capitalize">{(company as any).domain?.replace("_", " ")} · Avg stipend: {company.avg_stipend || "—"}</p>
          </div>
        </div>
        <StarRating rating={Number(company.avg_rating)} size="md" />
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
        <Button size="sm" variant="outline" className="rounded-lg gap-1.5 text-xs" onClick={() => navigate(`/submit?category=internships&companyId=${companyId}`)}>
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
              {/* Stipend badge */}
              {r.stipend && (
                <div className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-500 text-[11px] font-medium px-2 py-0.5 rounded-full mb-3">
                  <IndianRupee className="h-3 w-3" />
                  {r.stipend}
                </div>
              )}
              {/* 2x2 rating grid */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                {RATING_META.map(({ key, label, Icon }) => (
                  <div key={key} className="flex items-center gap-2 bg-muted/50 rounded-lg px-2.5 py-1.5">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground flex-1">{label}</span>
                    <span className={`text-xs font-bold ${ratingColor(r[key])}`}>{r[key]}</span>
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
