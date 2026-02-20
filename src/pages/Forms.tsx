import { Link } from "react-router-dom";
import { ArrowLeft, Copy, Check, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

const forms = [
  {
    title: "Course Review",
    category: "d/academics",
    credits: 20,
    description: "Share your experience with a course — ratings, tips, professor insights",
    fields: [
      "Full Name", "Batch (e.g. PGP 2025)", "Course Code (e.g. FIN301)", "Course Name",
      "Professor Name", "Term (e.g. Term 3)", "Category (Core / Elective)",
      "Domain (Finance, Marketing, Strategy, Operations, Economics, Analytics, HR, General)",
      "Overall Rating (1-5)", "Difficulty Rating (1-5)", "Relevance Rating (1-5)", "Workload Rating (1-5)",
      "Detailed Review (min 100 words)", "Tips for future students",
      "Tags (comma-separated, e.g. 'heavy workload, great professor')",
    ],
  },
  {
    title: "Internship Report",
    category: "d/internships",
    credits: 25,
    description: "Share your internship experience — work culture, learning, stipend, PPO",
    fields: [
      "Full Name", "Batch", "Company Name",
      "Domain (Consulting, Finance, PM, Strategy & Ops, Marketing, Tech, GM)",
      "Role / Title", "Location", "Duration", "Stipend (monthly, in ₹)",
      "Work Culture Rating (1-5)", "Learning Curve Rating (1-5)",
      "Mentorship Rating (1-5)", "PPO Conversion Rating (1-5)",
      "Detailed Review (min 150 words)", "Interview Preparation Tips",
      "Would you recommend? (Yes / No / Depends)",
    ],
  },
  {
    title: "Exchange Diary",
    category: "d/exchange",
    credits: 25,
    description: "Share your exchange semester experience — academics, living, travel",
    fields: [
      "Full Name", "Batch", "Exchange University Name", "Country",
      "Region (Europe, Asia, North America, Oceania, South America)",
      "Academics Rating (1-5)", "Living & Costs Rating (1-5)",
      "Social Life Rating (1-5)", "Travel Opportunities Rating (1-5)",
      "Monthly Budget", "Detailed Review (min 200 words)",
      "Top 3 courses you took", "Application tips", "One-line highlight",
    ],
  },
  {
    title: "Exam Paper",
    category: "d/papers",
    credits: 30,
    description: "Share past exam papers with solutions or analysis",
    fields: [
      "Full Name", "Batch", "Course Code", "Course Name",
      "Exam Type (End Term / Mid Term / Quiz / Case Analysis)",
      "Year", "Paper Description", "Study Tips", "Upload PDF",
    ],
  },
  {
    title: "Campus Tip",
    category: "d/campus",
    credits: 5,
    description: "Share tips about campus life — food, study spots, transport",
    fields: [
      "Full Name", "Batch",
      "Category (Food & Cafes, Study Spots, Weekend Getaways, Gyms & Sports, Transport, Shopping)",
      "Place / Thing Name", "Rating (1-5)", "Your Tip / Review (min 50 words)",
    ],
  },
];

export default function Forms() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyFields = (fields: string[], title: string, index: number) => {
    const text = `${title}\n\nPlease fill in the following:\n\n${fields.map((f, i) => `${i + 1}. ${f}`).join("\n\n")}`;
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Copied to clipboard!");
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  const copyAllForms = () => {
    const allText = forms.map(form => {
      return `${form.title}\n${form.description}\n\n${form.fields.map((f, i) => `${i + 1}. ${f}`).join("\n")}`;
    }).join("\n\n---\n\n");

    const header = `Digital Mitra — Data Collection Forms\nIIM Bangalore\n\n`;
    navigator.clipboard.writeText(header + allText).then(() => {
      toast.success("All forms copied!");
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to feed
      </Link>

      <div className="bg-card border border-border rounded-lg p-5 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-foreground">Data Collection Forms</h1>
            <p className="text-xs text-muted-foreground">Copy templates → create Google Forms → circulate in batch groups</p>
          </div>
        </div>
        <Button onClick={copyAllForms} variant="outline" size="sm" className="gap-1.5 text-xs rounded-full">
          <Copy className="h-3 w-3" /> Copy All Templates
        </Button>
      </div>

      <div className="space-y-3">
        {forms.map((form, index) => (
          <div key={form.title} className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-bold text-sm text-foreground">{form.title}</h2>
                    <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      +{form.credits} credits
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{form.description}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">Posts to {form.category}</p>
                </div>
              </div>
            </div>
            <div className="bg-secondary/50 px-4 py-3">
              <ol className="space-y-1.5">
                {form.fields.map((field, i) => (
                  <li key={i} className="text-xs text-foreground/70 flex gap-2">
                    <span className="text-muted-foreground font-mono w-5 flex-shrink-0 text-right">{i + 1}.</span>
                    {field}
                  </li>
                ))}
              </ol>
            </div>
            <div className="px-4 py-3 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs rounded-full"
                onClick={() => copyFields(form.fields, form.title, index)}
              >
                {copiedIndex === index ? (
                  <><Check className="h-3 w-3 text-online" /> Copied</>
                ) : (
                  <><Copy className="h-3 w-3" /> Copy Template</>
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="mt-4 bg-card border border-border rounded-lg p-4">
        <h3 className="font-bold text-sm text-foreground mb-3">How to use these templates</h3>
        <ol className="space-y-2 text-xs text-muted-foreground">
          <li className="flex gap-2"><span className="text-foreground font-bold">1.</span> Copy a template above</li>
          <li className="flex gap-2"><span className="text-foreground font-bold">2.</span> Create a Google Form with those fields</li>
          <li className="flex gap-2"><span className="text-foreground font-bold">3.</span> Share the link in batch WhatsApp groups</li>
          <li className="flex gap-2"><span className="text-foreground font-bold">4.</span> Use responses to create threads on Digital Mitra</li>
        </ol>
      </div>
    </div>
  );
}
