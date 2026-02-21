import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Upload, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import FilterPills from "@/components/shared/FilterPills";
import { useExamPapers } from "@/hooks/useExamPapers";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const TYPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "end_term", label: "End Term" },
  { value: "mid_term", label: "Mid Term" },
  { value: "quiz", label: "Quiz" },
  { value: "case_analysis", label: "Case Analysis" },
];

const TYPE_COLORS: Record<string, string> = {
  end_term: "bg-red-500/10 text-red-400",
  mid_term: "bg-yellow-500/10 text-yellow-400",
  quiz: "bg-blue-500/10 text-blue-400",
  case_analysis: "bg-green-500/10 text-green-400",
};

export default function ExamPapers() {
  const navigate = useNavigate();
  const [examType, setExamType] = useState("all");
  const { data: papers = [], isLoading } = useExamPapers(examType);

  return (
    <div className="max-w-3xl mx-auto px-4 py-4">
      <button onClick={() => navigate("/")} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Exam Papers</h1>
          <p className="text-xs text-muted-foreground mt-1">Past papers shared by students</p>
        </div>
        <Button size="sm" className="rounded-full gap-1.5 text-xs" onClick={() => navigate("/submit")}>
          <Upload className="h-3.5 w-3.5" /> Upload
        </Button>
      </div>
      <div className="mb-5">
        <FilterPills options={TYPE_OPTIONS} selected={examType} onSelect={setExamType} />
      </div>
      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : papers.length === 0 ? (
        <div className="text-center py-20 bg-card/50 border border-border/40 rounded-xl"><p className="text-sm font-medium">No papers found</p></div>
      ) : (
        <div className="space-y-2">
          {papers.map(p => (
            <a
              key={p.id}
              href={p.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 hover:border-primary/50 transition-colors"
            >
              <FileText className="h-5 w-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{p.title}</p>
                <p className="text-[10px] text-muted-foreground">
                  {(p.courses as any)?.code || "—"} · {(p.courses as any)?.name || "—"} · {p.year}
                </p>
              </div>
              <Badge variant="secondary" className={`text-[10px] shrink-0 ${TYPE_COLORS[p.exam_type] || ""}`}>
                {p.exam_type.replace("_", " ")}
              </Badge>
              <div className="flex items-center gap-1 text-muted-foreground shrink-0">
                <ThumbsUp className="h-3 w-3" />
                <span className="text-[10px]">{p.vote_count}</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
