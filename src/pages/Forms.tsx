import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Copy, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

const forms = [
  {
    title: "📚 Course Review",
    category: "academics",
    credits: 20,
    description: "Share your experience with a course — ratings, tips, professor insights",
    fields: [
      "Full Name",
      "Batch (e.g. PGP 2025)",
      "Course Code (e.g. FIN301)",
      "Course Name",
      "Professor Name",
      "Term (e.g. Term 3)",
      "Category (Core / Elective)",
      "Domain (Finance, Marketing, Strategy, Operations, Economics, Analytics, HR, General)",
      "Overall Rating (1-5)",
      "Difficulty Rating (1-5)",
      "Relevance Rating (1-5)",
      "Workload Rating (1-5)",
      "Detailed Review (min 100 words) — What was the teaching style? How was grading? What did you learn?",
      "Tips for future students",
      "Tags (comma-separated, e.g. 'heavy workload, great professor, case-based')",
    ],
  },
  {
    title: "💼 Internship Report",
    category: "internships",
    credits: 25,
    description: "Share your internship experience — work culture, learning, stipend, PPO",
    fields: [
      "Full Name",
      "Batch (e.g. PGP 2024)",
      "Company Name",
      "Domain (Consulting, Finance, PM, Strategy & Ops, Marketing, Tech, GM)",
      "Role / Title",
      "Location",
      "Duration",
      "Stipend (monthly, in ₹)",
      "Work Culture Rating (1-5)",
      "Learning Curve Rating (1-5)",
      "Mentorship Rating (1-5)",
      "PPO Conversion Rating (1-5)",
      "Detailed Review (min 150 words) — What did you work on? How was the culture? What did you learn?",
      "Interview Preparation Tips",
      "Would you recommend this company? (Yes / No / It depends)",
    ],
  },
  {
    title: "🌍 Exchange Diary",
    category: "exchange",
    credits: 25,
    description: "Share your exchange semester experience — academics, living, travel",
    fields: [
      "Full Name",
      "Batch (e.g. PGP 2024)",
      "Exchange University Name",
      "Country",
      "Region (Europe, Asia, North America, Oceania, South America)",
      "Term / Semester",
      "Academics Rating (1-5)",
      "Living & Costs Rating (1-5)",
      "Social Life Rating (1-5)",
      "Travel Opportunities Rating (1-5)",
      "Monthly Budget (in local currency + ₹ equivalent)",
      "Detailed Review (min 200 words) — Academics, living, social life, travel, overall experience",
      "Top 3 courses you took",
      "Application tips for future students",
      "Highlight (one-line summary, e.g. 'Best semester of my MBA')",
    ],
  },
  {
    title: "📄 Exam Paper",
    category: "papers",
    credits: 30,
    description: "Share past exam papers with solutions or analysis",
    fields: [
      "Full Name",
      "Batch (e.g. PGP 2025)",
      "Course Code",
      "Course Name",
      "Exam Type (End Term / Mid Term / Quiz / Case Analysis)",
      "Year",
      "Paper Description (topics covered, difficulty level, format)",
      "Study Tips for this exam",
      "Upload PDF (attach the paper file)",
    ],
  },
  {
    title: "🎓 Campus Tip",
    category: "campus",
    credits: 5,
    description: "Share tips about campus life — food, study spots, transport, activities",
    fields: [
      "Full Name",
      "Batch",
      "Category (Food & Cafes, Study Spots, Weekend Getaways, Gyms & Sports, Transport, Shopping)",
      "Place / Thing Name",
      "Rating (1-5)",
      "Your Tip / Review (min 50 words)",
      "Pro Tip (one-liner that would help someone)",
    ],
  },
];

export default function Forms() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyFields = (fields: string[], title: string) => {
    const text = `${title}\n\nPlease fill in the following:\n\n${fields.map((f, i) => `${i + 1}. ${f}`).join("\n\n")}`;
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Form template copied to clipboard!");
      setCopiedIndex(forms.findIndex(f => f.title === title));
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  const copyAllForms = () => {
    const allText = forms.map(form => {
      return `${"=".repeat(50)}\n${form.title}\n${form.description}\n${"=".repeat(50)}\n\n${form.fields.map((f, i) => `${i + 1}. ${f}`).join("\n\n")}`;
    }).join("\n\n\n");

    const header = `DIGITAL MITRA — Data Collection Forms\nIIM Bangalore Knowledge Platform\n\nHi! We're building Digital Mitra, a knowledge-sharing platform for IIMB students. Please fill out whichever forms are relevant to your experience. Your contributions will help juniors make better decisions!\n\n`;

    navigator.clipboard.writeText(header + allText).then(() => {
      toast.success("All forms copied to clipboard!");
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to feed
      </Link>

      <div className="mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight mb-2">
          Data Collection Forms
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-xl">
          Copy these form templates and create Google Forms to circulate among your batchmates. Use the responses to populate Digital Mitra with initial content.
        </p>
        <Button onClick={copyAllForms} variant="outline" className="mt-4 rounded-full gap-2">
          <Copy className="h-3.5 w-3.5" />
          Copy All Forms
        </Button>
      </div>

      <div className="space-y-4">
        {forms.map((form, index) => (
          <Card key={form.title} className="border-border/50 shadow-soft">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-display">{form.title}</CardTitle>
                  <CardDescription className="mt-1">{form.description}</CardDescription>
                </div>
                <Badge className="text-xs">+{form.credits} credits</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/40 rounded-lg p-4 mb-3">
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Fields</p>
                <ol className="space-y-1.5">
                  {form.fields.map((field, i) => (
                    <li key={i} className="text-sm text-foreground/80 flex gap-2">
                      <span className="text-muted-foreground font-mono text-xs mt-0.5 w-5 flex-shrink-0">{i + 1}.</span>
                      {field}
                    </li>
                  ))}
                </ol>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="rounded-full gap-1.5"
                onClick={() => copyFields(form.fields, form.title)}
              >
                {copiedIndex === index ? (
                  <><Check className="h-3.5 w-3.5" /> Copied!</>
                ) : (
                  <><Copy className="h-3.5 w-3.5" /> Copy Template</>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Instructions */}
      <Card className="mt-8 border-primary/20 bg-accent/30 shadow-soft">
        <CardContent className="p-6">
          <h3 className="font-display text-lg font-semibold mb-3">How to use these forms</h3>
          <ol className="space-y-2 text-sm text-foreground/80">
            <li className="flex gap-2"><span className="font-semibold text-primary">1.</span> Click "Copy Template" on any form above</li>
            <li className="flex gap-2"><span className="font-semibold text-primary">2.</span> Create a new Google Form and paste the fields as questions</li>
            <li className="flex gap-2"><span className="font-semibold text-primary">3.</span> Share the Google Form link with your batch WhatsApp groups</li>
            <li className="flex gap-2"><span className="font-semibold text-primary">4.</span> Once you have responses, you can use the data to create threads on Digital Mitra</li>
          </ol>
          <p className="text-xs text-muted-foreground mt-4">
            Pro tip: Start with Course Reviews and Internship Reports — these are what students search for most.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
