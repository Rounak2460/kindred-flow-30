import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import StarRating from "@/components/shared/StarRating";
import RatingBar from "@/components/shared/RatingBar";
import { useCourse } from "@/hooks/useCourses";
import { useCourseReviews } from "@/hooks/useCourseReviews";
import { generateAnonHandle } from "@/lib/anonymity";
import { formatDistanceToNow } from "date-fns";

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { data: course, isLoading: loadingCourse } = useCourse(courseId);
  const { data: reviews = [], isLoading: loadingReviews } = useCourseReviews(courseId);

  const avgDifficulty = reviews.length ? reviews.reduce((s, r) => s + r.difficulty_rating, 0) / reviews.length : 0;
  const avgRelevance = reviews.length ? reviews.reduce((s, r) => s + r.relevance_rating, 0) / reviews.length : 0;
  const avgWorkload = reviews.length ? reviews.reduce((s, r) => s + r.workload_rating, 0) / reviews.length : 0;
  const avgOverall = reviews.length ? reviews.reduce((s, r) => s + r.overall_rating, 0) / reviews.length : 0;

  if (loadingCourse) return <div className="max-w-3xl mx-auto px-4 py-8"><Skeleton className="h-48 rounded-xl" /></div>;
  if (!course) return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-sm text-muted-foreground">Course not found</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-4">
      <button onClick={() => navigate("/academics")} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-3.5 w-3.5" /> Academics
      </button>

      <div className="rounded-xl border border-border bg-card p-5 mb-4">
        <div className="flex items-start justify-between mb-2">
          <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">{course.code}</span>
          <span className="text-xs text-muted-foreground capitalize">{course.category}</span>
        </div>
        <h1 className="text-lg font-bold mb-1">{course.name}</h1>
        <p className="text-xs text-muted-foreground mb-3">{course.professor} · {course.term} · {course.domain}</p>
        <StarRating rating={Number(course.avg_rating)} size="md" />
      </div>

      {reviews.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5 mb-4 space-y-3">
          <h2 className="text-sm font-semibold">Rating Breakdown</h2>
          <RatingBar label="Overall" value={avgOverall} />
          <RatingBar label="Difficulty" value={avgDifficulty} />
          <RatingBar label="Relevance" value={avgRelevance} />
          <RatingBar label="Workload" value={avgWorkload} />
        </div>
      )}

      {reviews.some(r => r.tips) && (
        <div className="rounded-xl border border-border bg-card p-5 mb-4">
          <h2 className="text-sm font-semibold mb-2">Quick Tips</h2>
          <ul className="space-y-1.5">
            {reviews.filter(r => r.tips).slice(0, 5).map(r => (
              <li key={r.id} className="text-xs text-muted-foreground">• {r.tips}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold">Reviews ({reviews.length})</h2>
        <Button size="sm" variant="outline" className="rounded-full gap-1.5 text-xs" onClick={() => navigate("/submit")}>
          <PenLine className="h-3.5 w-3.5" /> Write Review
        </Button>
      </div>

      {loadingReviews ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 bg-card/50 border border-border/40 rounded-xl">
          <p className="text-sm">No reviews yet</p>
          <p className="text-xs text-muted-foreground mt-1">Be the first to review this course</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map(r => (
            <div key={r.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium">{generateAnonHandle(r.user_id)}</span>
                <span className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</span>
              </div>
              <StarRating rating={r.overall_rating} />
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{r.review_text}</p>
              {r.tags.length > 0 && (
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {r.tags.map(t => <span key={t} className="text-[10px] bg-accent/50 text-accent-foreground px-1.5 py-0.5 rounded">{t}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
