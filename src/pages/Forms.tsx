import { Link } from "react-router-dom";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

const forms = [
  {
    title: "Course Review",
    category: "academics",
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
    category: "internships",
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
    category: "exchange",
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
    category: "papers",
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
    category: "campus",
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
      toast.success("Copied!");
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
    <div className="container mx-auto px-4 py-4 max-w-2xl">
      <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-3 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </Link>

      <div className="mb-6">
        <h1 className="text-base font-semibold mb-1">Data Collection Forms</h1>
        <p className="text-xs text-muted-foreground mb-3">
          Copy these templates, create Google Forms, and circulate among batchmates to seed initial data.
        </p>
        <Button onClick={copyAllForms} variant="outline" size="sm" className="gap-1.5 text-xs">
          <Copy className="h-3 w-3" /> Copy All
        </Button>
      </div>

      <div className="space-y-3">
        {forms.map((form, index) => (
          <div key={form.title} className="border border-border rounded-md bg-card p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h2 className="text-sm font-semibold">{form.title}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{form.description}</p>
              </div>
              <span className="text-[10px] font-medium text-primary bg-accent px-1.5 py-0.5 rounded flex-shrink-0">
                +{form.credits} cr
              </span>
            </div>
            <div className="bg-muted/40 rounded p-3 mb-3">
              <ol className="space-y-1">
                {form.fields.map((field, i) => (
                  <li key={i} className="text-xs text-foreground/70 flex gap-1.5">
                    <span className="text-muted-foreground font-mono w-4 flex-shrink-0">{i + 1}.</span>
                    {field}
                  </li>
                ))}
              </ol>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs h-7"
              onClick={() => copyFields(form.fields, form.title, index)}
            >
              {copiedIndex === index ? (
                <><Check className="h-3 w-3" /> Copied</>
              ) : (
                <><Copy className="h-3 w-3" /> Copy Template</>
              )}
            </Button>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="mt-6 border border-border rounded-md p-4 bg-muted/30">
        <h3 className="text-sm font-semibold mb-2">How to use</h3>
        <ol className="space-y-1 text-xs text-muted-foreground">
          <li>1. Copy a template above</li>
          <li>2. Create a Google Form with those fields</li>
          <li>3. Share the link in batch WhatsApp groups</li>
          <li>4. Use responses to create threads on Digital Mitra</li>
        </ol>
      </div>
    </div>
  );
}
