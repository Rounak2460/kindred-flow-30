import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useStats } from "@/hooks/useStats";

const sections = [
  { emoji: "📚", label: "Academics", desc: "Course reviews & ratings", to: "/academics", countKey: "courseReviews" as const },
  { emoji: "🌍", label: "Exchange", desc: "College diaries", to: "/exchange", countKey: "exchangeDiaries" as const },
  { emoji: "💼", label: "Internships", desc: "Company intel", to: "/internships", countKey: "internshipReports" as const },
  { emoji: "📝", label: "Exam Papers", desc: "Past papers", to: "/exam-papers", countKey: "examPapers" as const },
  { emoji: "📍", label: "Campus Life", desc: "Survival guide", to: "/campus", countKey: null },
];

interface ExploreSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ExploreSheet({ open, onOpenChange }: ExploreSheetProps) {
  const navigate = useNavigate();
  const { data: stats } = useStats();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl pb-8">
        <SheetHeader className="pb-2">
          <SheetTitle className="text-base">Explore</SheetTitle>
        </SheetHeader>
        <div className="grid grid-cols-1 gap-1">
          {sections.map((s) => {
            const count = s.countKey && stats ? stats[s.countKey] : null;
            return (
              <button
                key={s.to}
                onClick={() => { onOpenChange(false); navigate(s.to); }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-colors text-left"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-xl">
                  {s.emoji}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{s.label}</p>
                  <p className="text-[11px] text-muted-foreground">{s.desc}</p>
                </div>
                {count !== null && count > 0 && (
                  <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{count}</span>
                )}
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
