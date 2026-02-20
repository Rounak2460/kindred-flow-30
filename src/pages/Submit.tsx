import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FLAIRS } from "@/lib/mock-data";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const categories = [
  { key: "academics", label: "📚 Academics", description: "Course reviews, study tips, professor insights" },
  { key: "exchange", label: "🌍 Exchange", description: "Exchange diaries, application advice, living abroad" },
  { key: "internships", label: "💼 Internships", description: "Company reviews, interview prep, stipend info" },
  { key: "campus", label: "🎓 Campus Life", description: "Food, study spots, getaways, pro tips" },
  { key: "papers", label: "📄 Exam Papers", description: "Past papers, solutions, study material" },
];

export default function Submit() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [flair, setFlair] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [loading, setLoading] = useState(false);

  const availableFlairs = category ? FLAIRS[category] || [] : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!category || !title || !body) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to create a post");
        navigate("/auth");
        return;
      }

      const { error } = await supabase.from("posts").insert({
        user_id: session.user.id,
        category,
        title,
        body,
        flair: flair || null,
        course_code: courseCode || null,
        course_name: courseName || null,
        company_name: companyName || null,
        college_name: collegeName || null,
      });

      if (error) throw error;
      toast.success("Thread created! 🎉");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <Card className="shadow-elevated border-border/50">
        <CardHeader>
          <CardTitle className="font-display text-xl">Create a Thread</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Category Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Category *</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => { setCategory(cat.key); setFlair(""); }}
                    className={cn(
                      "text-left p-3 rounded-xl border transition-all text-sm",
                      category === cat.key
                        ? "border-primary bg-accent shadow-sm"
                        : "border-border/50 hover:border-border hover:bg-muted/50"
                    )}
                  >
                    <span className="font-medium">{cat.label}</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{cat.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Flair */}
            {availableFlairs.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Flair</Label>
                <div className="flex flex-wrap gap-1.5">
                  {availableFlairs.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFlair(flair === f ? "" : f)}
                    >
                      <Badge
                        variant={flair === f ? "default" : "secondary"}
                        className="cursor-pointer text-xs"
                      >
                        {f}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Context fields */}
            {(category === "academics" || category === "papers") && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Course Code</Label>
                  <Input placeholder="e.g. FIN301" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} className="rounded-lg" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Course Name</Label>
                  <Input placeholder="e.g. Corporate Finance" value={courseName} onChange={(e) => setCourseName(e.target.value)} className="rounded-lg" />
                </div>
              </div>
            )}
            {category === "internships" && (
              <div className="space-y-1.5">
                <Label className="text-xs">Company Name</Label>
                <Input placeholder="e.g. McKinsey & Company" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="rounded-lg" />
              </div>
            )}
            {category === "exchange" && (
              <div className="space-y-1.5">
                <Label className="text-xs">College Name</Label>
                <Input placeholder="e.g. HEC Paris" value={collegeName} onChange={(e) => setCollegeName(e.target.value)} className="rounded-lg" />
              </div>
            )}

            {/* Title */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Title *</Label>
              <Input
                placeholder="An interesting, descriptive title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-lg text-base"
                required
              />
            </div>

            {/* Body */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Body *</Label>
              <Textarea
                placeholder="Share your detailed experience, review, or question. Use **bold** for emphasis and bullet points with - for lists."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="rounded-lg min-h-[200px] text-sm"
                required
              />
              <p className="text-[11px] text-muted-foreground">
                Tip: Be detailed and specific — the best threads share concrete experiences and actionable advice.
              </p>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
              <Button type="submit" className="rounded-full px-6" disabled={loading}>
                {loading ? "Posting..." : "Create Thread"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
