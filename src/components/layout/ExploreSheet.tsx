import { useNavigate } from "react-router-dom";
import { BookOpen, Globe, Briefcase, FileText, MapPin } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useStats } from "@/hooks/useStats";

const sections = [
  { icon: BookOpen, label: "Academics", desc: "Course reviews & ratings", to: "/academics", countKey: "courseReviews" as const },
  { icon: Globe, label: "Exchange", desc: "College diaries", to: "/exchange", countKey: "exchangeDiaries" as const },
  { icon: Briefcase, label: "Internships", desc: "Company intel", to: "/internships", countKey: "internshipReports" as const },
  { icon: FileText, label: "Exam Papers", desc: "Past papers", to: "/exam-papers", countKey: "examPapers" as const },
  { icon: MapPin, label: "Campus Life", desc: "Survival guide", to: "/campus", countKey: null },
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
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <s.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{s.label}</p>
                  <p className="text-[11px] text-muted-foreground">{s.desc}</p>
                </div>
                <span className="text-[11px] text-muted-foreground tabular-nums">
                  {count !== null ? count : 0}
                </span>
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
