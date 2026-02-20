import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FLAIRS } from "@/lib/mock-data";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const categories = [
  { key: "academics", label: "Academics" },
  { key: "exchange", label: "Exchange" },
  { key: "internships", label: "Internships" },
  { key: "campus", label: "Campus Life" },
  { key: "papers", label: "Exam Papers" },
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
    <div className="container mx-auto px-4 py-4 max-w-2xl">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-3 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>

      <div className="border border-border rounded-md bg-card p-5">
        <h1 className="text-base font-semibold mb-4">Create a post</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Community</Label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => { setCategory(cat.key); setFlair(""); }}
                  className={cn(
                    "px-3 py-1.5 rounded text-xs font-medium transition-colors border",
                    category === cat.key
                      ? "border-primary text-primary bg-accent"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Flair */}
          {availableFlairs.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Flair</Label>
              <div className="flex flex-wrap gap-1">
                {availableFlairs.map((f) => (
                  <button key={f} type="button" onClick={() => setFlair(flair === f ? "" : f)}>
                    <Badge variant={flair === f ? "default" : "outline"} className="cursor-pointer text-[10px]">
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
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Course Code</Label>
                <Input placeholder="FIN301" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} className="h-8 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Course Name</Label>
                <Input placeholder="Corporate Finance" value={courseName} onChange={(e) => setCourseName(e.target.value)} className="h-8 text-sm" />
              </div>
            </div>
          )}
          {category === "internships" && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Company Name</Label>
              <Input placeholder="McKinsey & Company" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="h-8 text-sm" />
            </div>
          )}
          {category === "exchange" && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">College Name</Label>
              <Input placeholder="HEC Paris" value={collegeName} onChange={(e) => setCollegeName(e.target.value)} className="h-8 text-sm" />
            </div>
          )}

          {/* Title */}
          <div className="space-y-1">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Title</Label>
            <Input
              placeholder="An interesting, descriptive title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-sm"
              required
            />
          </div>

          {/* Body */}
          <div className="space-y-1">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Text</Label>
            <Textarea
              placeholder="Share your experience, review, or question…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="min-h-[160px] text-sm"
              required
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" size="sm" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "Posting…" : "Post"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
