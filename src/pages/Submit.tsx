import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FLAIRS } from "@/lib/mock-data";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const categories = [
  { key: "academics", label: "Academics", desc: "Course reviews, tips, questions" },
  { key: "exchange", label: "Exchange", desc: "Exchange semester experiences" },
  { key: "internships", label: "Internships", desc: "Internship reviews & prep" },
  { key: "campus", label: "Campus Life", desc: "Campus life & tips" },
  { key: "papers", label: "Exam Papers", desc: "Exam papers & materials" },
];

export default function Submit() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(searchParams.get("category") ? 2 : 1);
  const [category, setCategory] = useState(searchParams.get("category") || "");
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
    if (!category || !title) {
      toast.error("Please select a community and add a title");
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
      const { data: postData, error } = await supabase.from("posts").insert({
        user_id: session.user.id,
        category,
        title,
        body: body || "",
        flair: flair || null,
        course_code: courseCode || null,
        course_name: courseName || null,
        company_name: companyName || null,
        college_name: collegeName || null,
        moderation_status: "approved",
      }).select("id").single();
      if (error) throw error;
      toast.success("Post submitted!");
      supabase.functions.invoke("moderate-content", {
        body: { content_type: "post", content_id: postData.id, title, body },
      }).then(({ data, error: modErr }) => {
        if (modErr) console.error("Moderation error:", modErr);
        else if (data && !data.approved) {
          toast.error("Your post was flagged: " + data.reason);
        }
      });
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-4">
      <button
        onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-5 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> {step > 1 ? "Back" : "Cancel"}
      </button>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              s === step ? "w-6 bg-primary" : s < step ? "w-1.5 bg-primary/50" : "w-1.5 bg-border"
            )}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
            <h1 className="text-xl font-semibold text-foreground mb-1">Choose a community</h1>
            <p className="text-sm text-muted-foreground mb-5">Where does your post belong?</p>
            <div className="grid gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => { setCategory(cat.key); setFlair(""); setStep(2); }}
                  className={cn(
                    "flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-left transition-all border",
                    category === cat.key
                      ? "border-primary/40 bg-primary/5"
                      : "border-border hover:border-border/80 hover:bg-muted/30"
                  )}
                >
                  <div>
                    <p className={cn("text-sm font-medium", category === cat.key ? "text-primary" : "text-foreground")}>{cat.label}</p>
                    <p className="text-xs text-muted-foreground">{cat.desc}</p>
                  </div>
                  {category === cat.key && <Check className="h-4 w-4 text-primary ml-auto" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
            <h1 className="text-xl font-semibold text-foreground mb-5">Write your post</h1>
            <div className="space-y-4">
              <Input
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-transparent border-none text-lg font-semibold placeholder:text-muted-foreground/60 focus-visible:ring-0 px-0 h-auto py-2"
                required
              />
              <div className="h-px bg-border/30" />
              <Textarea
                placeholder="Share the details… (supports markdown)"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="bg-transparent border-none text-sm min-h-[200px] placeholder:text-muted-foreground/50 resize-none focus-visible:ring-0 px-0 leading-relaxed"
              />
              <div className="flex items-center justify-end pt-2">
                <Button type="button" size="sm" className="rounded-lg font-semibold" disabled={!title} onClick={() => setStep(3)}>
                  Continue
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
            <h1 className="text-xl font-semibold text-foreground mb-1">Add details</h1>
            <p className="text-sm text-muted-foreground mb-5">Optional — helps others find your post</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {availableFlairs.length > 0 && (
                <div>
                  <Label className="text-xs font-medium text-muted-foreground mb-2 block">Flair</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {availableFlairs.map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFlair(flair === f ? "" : f)}
                        className={cn(
                          "text-xs font-medium px-3 py-1.5 rounded-lg transition-all border",
                          flair === f
                            ? "border-primary/40 text-primary bg-primary/10"
                            : "border-border text-muted-foreground hover:text-foreground hover:border-border/80"
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {(category === "academics" || category === "papers") && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Course Code</Label>
                    <Input placeholder="FIN301" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} className="bg-muted/50 border-border text-sm rounded-lg" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Course Name</Label>
                    <Input placeholder="Corporate Finance" value={courseName} onChange={(e) => setCourseName(e.target.value)} className="bg-muted/50 border-border text-sm rounded-lg" />
                  </div>
                </div>
              )}
              {category === "internships" && (
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Company Name</Label>
                  <Input placeholder="McKinsey & Company" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="bg-muted/50 border-border text-sm rounded-lg" />
                </div>
              )}
              {category === "exchange" && (
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">College Name</Label>
                  <Input placeholder="HEC Paris" value={collegeName} onChange={(e) => setCollegeName(e.target.value)} className="bg-muted/50 border-border text-sm rounded-lg" />
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <Button type="button" variant="ghost" size="sm" className="rounded-lg" onClick={() => navigate(-1)}>Cancel</Button>
                <Button type="submit" size="sm" className="rounded-lg font-semibold px-6" disabled={loading || !category || !title}>
                  {loading ? "Posting…" : "Post"}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
