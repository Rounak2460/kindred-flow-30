import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, GraduationCap, Globe, Briefcase, FileText, MapPin, Copy, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const contributions = [
  { title: "Course Review", desc: "Rate & review a course you took", credits: 20, icon: GraduationCap, color: "bg-blue-500/10 text-blue-500", href: "/submit?category=academics" },
  { title: "Exchange Diary", desc: "Share your exchange semester experience", credits: 25, icon: Globe, color: "bg-orange-500/10 text-orange-500", href: "/submit?category=exchange" },
  { title: "Internship Report", desc: "Review your internship — culture, learning, PPO", credits: 25, icon: Briefcase, color: "bg-cyan-500/10 text-cyan-500", href: "/submit?category=internships" },
  { title: "Exam Paper", desc: "Upload past exam papers to help juniors", credits: 30, icon: FileText, color: "bg-violet-500/10 text-violet-500", href: "/submit?category=papers" },
  { title: "Campus Tip", desc: "Tips about food, study spots, transport", credits: 5, icon: MapPin, color: "bg-emerald-500/10 text-emerald-500", href: "/submit?category=campus" },
];

const legacyForms = [
  { title: "Course Review", fields: ["Course Code", "Course Name", "Professor", "Term", "Overall Rating (1-5)", "Review (min 100 words)", "Tips"] },
  { title: "Internship Report", fields: ["Company Name", "Domain", "Stipend", "Work Culture (1-5)", "Learning (1-5)", "Mentorship (1-5)", "PPO (1-5)", "Review (min 150 words)"] },
  { title: "Exchange Diary", fields: ["College Name", "Country", "Academics (1-5)", "Living & Costs (1-5)", "Social Life (1-5)", "Travel (1-5)", "Review (min 200 words)"] },
];

export default function Forms() {
  const navigate = useNavigate();
  const [copiedAll, setCopiedAll] = useState(false);
  const [legacyOpen, setLegacyOpen] = useState(false);

  const copyAllForms = () => {
    const allText = legacyForms.map(form => `${form.title}\n${form.fields.map((f, i) => `${i + 1}. ${f}`).join("\n")}`).join("\n\n---\n\n");
    navigator.clipboard.writeText(`Digi Mitra — Data Collection Templates\n\n${allText}`).then(() => {
      toast.success("All templates copied!");
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to feed
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground mb-1">Contribute</h1>
        <p className="text-sm text-muted-foreground">Share your knowledge, earn credits, help your batchmates</p>
      </div>

      <div className="grid gap-3 mb-8">
        {contributions.map((item) => (
          <button
            key={item.title}
            onClick={() => navigate(item.href)}
            className="flex items-center gap-3.5 px-4 py-4 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors text-left"
          >
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
              <item.icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">+{item.credits} credits</span>
              </div>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </button>
        ))}
      </div>

      <Collapsible open={legacyOpen} onOpenChange={setLegacyOpen}>
        <CollapsibleTrigger className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground w-full py-2 transition-colors">
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${legacyOpen ? "rotate-180" : ""}`} />
          Google Forms templates (for batch WhatsApp circulation)
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 space-y-3">
          <Button onClick={copyAllForms} variant="outline" size="sm" className="gap-1.5 text-xs rounded-full">
            {copiedAll ? <><Check className="h-3 w-3 text-primary" /> Copied</> : <><Copy className="h-3 w-3" /> Copy All Templates</>}
          </Button>
          {legacyForms.map((form) => (
            <div key={form.title} className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs font-semibold mb-2">{form.title}</p>
              <ol className="space-y-1">
                {form.fields.map((f, i) => <li key={i} className="text-[11px] text-muted-foreground">{i + 1}. {f}</li>)}
              </ol>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
