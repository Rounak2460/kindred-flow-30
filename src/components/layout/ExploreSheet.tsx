import { useNavigate } from "react-router-dom";
import { BookOpen, Globe, Briefcase, FileText, MapPin } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const sections = [
  { icon: BookOpen, label: "Academics", desc: "Course reviews & ratings", to: "/academics" },
  { icon: Globe, label: "Exchange", desc: "College diaries", to: "/exchange" },
  { icon: Briefcase, label: "Internships", desc: "Company intel", to: "/internships" },
  { icon: FileText, label: "Exam Papers", desc: "Past papers", to: "/exam-papers" },
  { icon: MapPin, label: "Campus Life", desc: "Survival guide", to: "/campus" },
];

interface ExploreSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ExploreSheet({ open, onOpenChange }: ExploreSheetProps) {
  const navigate = useNavigate();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl pb-8">
        <SheetHeader className="pb-2">
          <SheetTitle className="text-base">Explore</SheetTitle>
        </SheetHeader>
        <div className="grid grid-cols-1 gap-2">
          {sections.map((s) => (
            <button
              key={s.to}
              onClick={() => { onOpenChange(false); navigate(s.to); }}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-colors text-left"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{s.label}</p>
                <p className="text-[11px] text-muted-foreground">{s.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
