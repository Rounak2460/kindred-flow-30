import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FLAIRS } from "@/lib/mock-data";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const categories = [
  { key: "academics", label: "d/academics", desc: "Course reviews, tips, questions" },
  { key: "exchange", label: "d/exchange", desc: "Exchange semester experiences" },
  { key: "internships", label: "d/internships", desc: "Internship reviews & prep" },
  { key: "campus", label: "d/campus", desc: "Campus life & tips" },
  { key: "papers", label: "d/papers", desc: "Exam papers & materials" },
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
      toast.success("Thread created!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>

      <h1 className="font-bold text-lg text-foreground mb-4">Create a post</h1>

      {/* Community selector */}
      <div className="bg-card border border-border rounded-lg p-4 mb-3">
        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 block">Choose a community</Label>
        <div className="grid gap-2">
          {categories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => { setCategory(cat.key); setFlair(""); }}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors border",
                category === cat.key
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-muted-foreground/30 hover:bg-accent"
              )}
            >
              <div>
                <p className={cn("text-sm font-bold", category === cat.key ? "text-primary" : "text-foreground")}>{cat.label}</p>
                <p className="text-xs text-muted-foreground">{cat.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {/* Flair */}
          {availableFlairs.length > 0 && (
            <div className="px-4 pt-4 pb-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Flair</Label>
              <div className="flex flex-wrap gap-1.5">
                {availableFlairs.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFlair(flair === f ? "" : f)}
                    className={cn(
                      "text-xs font-medium px-2.5 py-1 rounded-full transition-colors border",
                      flair === f
                        ? "border-primary text-primary bg-primary/10"
                        : "border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/50"
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Context fields */}
          {(category === "academics" || category === "papers") && (
            <div className="grid grid-cols-2 gap-3 px-4 py-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Course Code</Label>
                <Input placeholder="FIN301" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} className="bg-secondary border-none text-sm" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Course Name</Label>
                <Input placeholder="Corporate Finance" value={courseName} onChange={(e) => setCourseName(e.target.value)} className="bg-secondary border-none text-sm" />
              </div>
            </div>
          )}
          {category === "internships" && (
            <div className="px-4 py-3">
              <Label className="text-xs text-muted-foreground mb-1 block">Company Name</Label>
              <Input placeholder="McKinsey & Company" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="bg-secondary border-none text-sm" />
            </div>
          )}
          {category === "exchange" && (
            <div className="px-4 py-3">
              <Label className="text-xs text-muted-foreground mb-1 block">College Name</Label>
              <Input placeholder="HEC Paris" value={collegeName} onChange={(e) => setCollegeName(e.target.value)} className="bg-secondary border-none text-sm" />
            </div>
          )}

          {/* Title */}
          <div className="px-4 pt-3">
            <Input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-transparent border-none text-lg font-semibold placeholder:text-muted-foreground focus-visible:ring-0 px-0"
              required
            />
          </div>

          {/* Body */}
          <div className="px-4 pb-2">
            <Textarea
              placeholder="Text (optional)"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="bg-transparent border-none text-sm min-h-[200px] placeholder:text-muted-foreground resize-none focus-visible:ring-0 px-0"
            />
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <div className="flex items-center gap-1">
              <button type="button" className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors">
                <ImageIcon className="h-4 w-4" />
              </button>
              <button type="button" className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors">
                <LinkIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="sm" className="rounded-full" onClick={() => navigate(-1)}>Cancel</Button>
              <Button type="submit" size="sm" className="rounded-full font-bold" disabled={loading || !category || !title}>
                {loading ? "Posting…" : "Post"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
