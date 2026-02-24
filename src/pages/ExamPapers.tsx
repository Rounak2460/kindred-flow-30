import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Upload, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import FilterPills from "@/components/shared/FilterPills";
import { useExamPapers } from "@/hooks/useExamPapers";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { SAMPLE_PAPERS } from "@/lib/sample-data";

const TYPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "end_term", label: "End Term" },
  { value: "mid_term", label: "Mid Term" },
  { value: "quiz", label: "Quiz" },
  { value: "case_analysis", label: "Case Analysis" },
];

const TYPE_COLORS: Record<string, string> = {
  end_term: "bg-red-500/10 text-red-500 border-red-500/20",
  mid_term: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  quiz: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  case_analysis: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
};

export default function ExamPapers() {
  const navigate = useNavigate();
  const [examType, setExamType] = useState("all");
  const { data: papers = [], isLoading } = useExamPapers(examType);

  const showSamples = !isLoading && papers.length === 0;
  const displayPapers = showSamples ? SAMPLE_PAPERS : papers;

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
            <FileText className="h-5 w-5 text-violet-500" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Exam Papers</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Past papers shared by students</p>
          </div>
        </div>
        <Button size="sm" className="rounded-lg gap-1.5 text-xs" onClick={() => navigate("/submit?category=papers")}>
          <Upload className="h-3.5 w-3.5" /> Upload
        </Button>
      </div>
      <div className="mb-5">
        <FilterPills options={TYPE_OPTIONS} selected={examType} onSelect={setExamType} />
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : displayPapers.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium">No papers found</p>
          <p className="text-xs text-muted-foreground mt-1">Upload your past papers to help fellow students</p>
          <Button size="sm" className="mt-4 rounded-lg" onClick={() => navigate("/submit?category=papers")}>Upload Paper</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {displayPapers.map(p => {
            const isReal = !showSamples;
            const Wrapper = isReal ? "a" : "div";
            const wrapperProps = isReal ? { href: p.file_url, target: "_blank", rel: "noopener noreferrer" } : {};

            return (
              <Wrapper
                key={p.id}
                {...wrapperProps as any}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 hover:border-primary/40 transition-colors"
              >
                <FileText className="h-5 w-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium truncate">{p.title}</p>
                    {showSamples && <span className="text-[9px] text-muted-foreground/50 bg-muted px-1.5 py-0.5 rounded shrink-0">(sample)</span>}
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {(p.courses as any)?.code || "—"} · {(p.courses as any)?.name || "—"} · {p.year}
                  </p>
                </div>
                <Badge variant="secondary" className={`text-[10px] shrink-0 border ${TYPE_COLORS[p.exam_type] || ""}`}>
                  {p.exam_type.replace("_", " ")}
                </Badge>
                <div className="flex items-center gap-1 text-muted-foreground shrink-0">
                  <ThumbsUp className="h-3 w-3" />
                  <span className="text-[10px]">{p.vote_count}</span>
                </div>
              </Wrapper>
            );
          })}
        </div>
      )}
    </div>
  );
}
