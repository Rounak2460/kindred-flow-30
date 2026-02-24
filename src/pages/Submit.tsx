import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, EyeOff, Upload } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StarRatingInput from "@/components/shared/StarRatingInput";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const TAG_OPTIONS = [
  { key: "general", label: "General" },
  { key: "academics", label: "Course" },
  { key: "internships", label: "Career" },
  { key: "campus", label: "Life" },
  { key: "exchange", label: "Exchange" },
  { key: "papers", label: "Papers" },
];

const CAMPUS_CATEGORIES = [
  { value: "food_cafes", label: "Food & Cafes" },
  { value: "study_spots", label: "Study Spots" },
  { value: "weekend_getaways", label: "Weekend Getaways" },
  { value: "gyms_sports", label: "Gyms & Sports" },
  { value: "transport", label: "Transport" },
  { value: "shopping", label: "Shopping" },
];

const EXAM_TYPES = [
  { value: "end_term", label: "End Term" },
  { value: "mid_term", label: "Mid Term" },
  { value: "quiz", label: "Quiz" },
  { value: "case_analysis", label: "Case Analysis" },
];

export default function Submit() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "general";

  const [category, setCategory] = useState(initialCategory);
  const [loading, setLoading] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Common fields
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  // Course review fields
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState(searchParams.get("courseId") || "");
  const [overallRating, setOverallRating] = useState(0);
  const [difficultyRating, setDifficultyRating] = useState(0);
  const [relevanceRating, setRelevanceRating] = useState(0);
  const [workloadRating, setWorkloadRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [tips, setTips] = useState("");
  const [tags, setTags] = useState("");

  // Exchange fields
  const [colleges, setColleges] = useState<any[]>([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState(searchParams.get("collegeId") || "");
  const [academicsRating, setAcademicsRating] = useState(0);
  const [livingRating, setLivingRating] = useState(0);
  const [socialRating, setSocialRating] = useState(0);
  const [travelRating, setTravelRating] = useState(0);

  // Internship fields
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState(searchParams.get("companyId") || "");
  const [cultureRating, setCultureRating] = useState(0);
  const [learningRating, setLearningRating] = useState(0);
  const [mentorshipRating, setMentorshipRating] = useState(0);
  const [ppoRating, setPpoRating] = useState(0);
  const [stipend, setStipend] = useState("");

  // Exam paper fields
  const [examType, setExamType] = useState("");
  const [examYear, setExamYear] = useState(new Date().getFullYear().toString());
  const [examTitle, setExamTitle] = useState("");
  const [examFile, setExamFile] = useState<File | null>(null);

  // Campus tip fields
  const [campusCategory, setCampusCategory] = useState("");
  const [placeName, setPlaceName] = useState("");
  const [campusRating, setCampusRating] = useState(0);
  const [tipText, setTipText] = useState("");

  // Load selector data
  useEffect(() => {
    if (category === "academics" || category === "papers") {
      supabase.from("courses").select("id, code, name").order("name").then(({ data }) => { if (data) setCourses(data); });
    }
    if (category === "exchange") {
      supabase.from("exchange_colleges").select("id, name, country").order("name").then(({ data }) => { if (data) setColleges(data); });
    }
    if (category === "internships") {
      supabase.from("internship_companies").select("id, name, domain").order("name").then(({ data }) => { if (data) setCompanies(data); });
    }
  }, [category]);

  const getSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast.error("Please sign in"); navigate("/auth"); return null; }
    return session;
  };

  const dualWritePost = async (userId: string, postTitle: string, postBody: string, extra: Record<string, any> = {}) => {
    await supabase.from("posts").insert({
      user_id: userId, category, title: postTitle, body: postBody,
      flair: extra.flair || null, course_code: extra.course_code || null,
      course_name: extra.course_name || null, company_name: extra.company_name || null,
      college_name: extra.college_name || null, moderation_status: "approved", is_anonymous: isAnonymous,
    });
  };

  const handleSubmitAcademics = async () => {
    if (!selectedCourseId || !overallRating || reviewText.length < 100) { toast.error("Select a course, rate it, and write at least 100 characters"); return; }
    setLoading(true);
    try {
      const session = await getSession(); if (!session) return;
      const course = courses.find(c => c.id === selectedCourseId);
      const tagArray = tags.split(",").map(t => t.trim()).filter(Boolean);
      await supabase.from("course_reviews").insert({ course_id: selectedCourseId, user_id: session.user.id, overall_rating: overallRating, difficulty_rating: difficultyRating || 3, relevance_rating: relevanceRating || 3, workload_rating: workloadRating || 3, review_text: reviewText, tips: tips || null, tags: tagArray, is_anonymous: isAnonymous });
      await dualWritePost(session.user.id, `Review: ${course?.name || "Course"} (${course?.code || ""})`, reviewText, { flair: "Course Review", course_code: course?.code, course_name: course?.name });
      toast.success("Review submitted!"); navigate("/");
    } catch (e: any) { toast.error(e.message || "Something went wrong"); }
    finally { setLoading(false); }
  };

  const handleSubmitExchange = async () => {
    if (!selectedCollegeId || !academicsRating || reviewText.length < 100) { toast.error("Select a college, rate it, and write at least 100 characters"); return; }
    setLoading(true);
    try {
      const session = await getSession(); if (!session) return;
      const college = colleges.find(c => c.id === selectedCollegeId);
      await supabase.from("exchange_reviews").insert({ college_id: selectedCollegeId, user_id: session.user.id, academics_rating: academicsRating, living_costs_rating: livingRating || 3, social_life_rating: socialRating || 3, travel_rating: travelRating || 3, review_text: reviewText, is_anonymous: isAnonymous });
      await dualWritePost(session.user.id, `Exchange Diary: ${college?.name || "College"}`, reviewText, { flair: "Exchange Diary", college_name: college?.name });
      toast.success("Diary submitted!"); navigate("/");
    } catch (e: any) { toast.error(e.message || "Something went wrong"); }
    finally { setLoading(false); }
  };

  const handleSubmitInternship = async () => {
    if (!selectedCompanyId || !cultureRating || reviewText.length < 100) { toast.error("Select a company, rate it, and write at least 100 characters"); return; }
    setLoading(true);
    try {
      const session = await getSession(); if (!session) return;
      const company = companies.find(c => c.id === selectedCompanyId);
      await supabase.from("internship_reviews").insert({ company_id: selectedCompanyId, user_id: session.user.id, work_culture_rating: cultureRating, learning_rating: learningRating || 3, mentorship_rating: mentorshipRating || 3, ppo_rating: ppoRating || 3, review_text: reviewText, stipend: stipend || "", is_anonymous: isAnonymous });
      await dualWritePost(session.user.id, `Internship Review: ${company?.name || "Company"}`, reviewText, { flair: "Internship Review", company_name: company?.name });
      toast.success("Review submitted!"); navigate("/");
    } catch (e: any) { toast.error(e.message || "Something went wrong"); }
    finally { setLoading(false); }
  };

  const handleSubmitPaper = async () => {
    if (!selectedCourseId || !examType || !examTitle || !examFile) { toast.error("Fill all fields and upload a PDF"); return; }
    setLoading(true);
    try {
      const session = await getSession(); if (!session) return;
      const course = courses.find(c => c.id === selectedCourseId);
      const filePath = `${session.user.id}/${Date.now()}_${examFile.name}`;
      const { error: uploadErr } = await supabase.storage.from("exam-papers").upload(filePath, examFile);
      if (uploadErr) throw uploadErr;
      const { data: urlData } = supabase.storage.from("exam-papers").getPublicUrl(filePath);
      await supabase.from("exam_papers").insert({ course_id: selectedCourseId, user_id: session.user.id, exam_type: examType as any, year: parseInt(examYear), title: examTitle, file_url: urlData.publicUrl });
      await dualWritePost(session.user.id, `Exam Paper: ${examTitle}`, `Shared ${examType.replace("_", " ")} paper for ${course?.name || "course"} (${examYear})`, { flair: "Exam Paper", course_code: course?.code, course_name: course?.name });
      toast.success("Paper uploaded!"); navigate("/");
    } catch (e: any) { toast.error(e.message || "Something went wrong"); }
    finally { setLoading(false); }
  };

  const handleSubmitCampus = async () => {
    if (!campusCategory || !placeName || !campusRating || tipText.length < 50) { toast.error("Fill all fields (tip min 50 chars)"); return; }
    setLoading(true);
    try {
      const session = await getSession(); if (!session) return;
      await supabase.from("campus_tips").insert({ user_id: session.user.id, category: campusCategory as any, name: placeName, rating: campusRating, tip_text: tipText, is_anonymous: isAnonymous });
      await dualWritePost(session.user.id, `Campus Tip: ${placeName}`, tipText, { flair: "Campus Tip" });
      toast.success("Tip submitted!"); navigate("/");
    } catch (e: any) { toast.error(e.message || "Something went wrong"); }
    finally { setLoading(false); }
  };

  const handleSubmitGeneral = async () => {
    if (!title) { toast.error("Add a title"); return; }
    setLoading(true);
    try {
      const session = await getSession(); if (!session) return;
      const { data: postData, error } = await supabase.from("posts").insert({ user_id: session.user.id, category: "general", title, body: body || "", moderation_status: "approved", is_anonymous: isAnonymous }).select("id").single();
      if (error) throw error;
      toast.success("Post submitted!");
      supabase.functions.invoke("moderate-content", { body: { content_type: "post", content_id: postData.id, title, body } });
      navigate("/");
    } catch (e: any) { toast.error(e.message || "Something went wrong"); }
    finally { setLoading(false); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    switch (category) {
      case "academics": handleSubmitAcademics(); break;
      case "exchange": handleSubmitExchange(); break;
      case "internships": handleSubmitInternship(); break;
      case "papers": handleSubmitPaper(); break;
      case "campus": handleSubmitCampus(); break;
      default: handleSubmitGeneral();
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-4">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-5 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Cancel
      </button>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title + body for general, or shown at top */}
          {category === "general" && (
            <>
              <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-transparent border-none text-lg font-semibold placeholder:text-muted-foreground/60 focus-visible:ring-0 px-0 h-auto py-2" required />
              <div className="h-px bg-border/30" />
              <Textarea placeholder="Share the details… (supports markdown)" value={body} onChange={(e) => setBody(e.target.value)} className="bg-transparent border-none text-sm min-h-[200px] placeholder:text-muted-foreground/50 resize-none focus-visible:ring-0 px-0 leading-relaxed" />
            </>
          )}

          {/* ACADEMICS FORM */}
          {category === "academics" && (
            <>
              <h1 className="text-lg font-semibold text-foreground">Course Review</h1>
              <div><Label className="text-xs text-muted-foreground mb-1.5 block">Course</Label><Select value={selectedCourseId} onValueChange={setSelectedCourseId}><SelectTrigger className="bg-card border-border rounded-lg"><SelectValue placeholder="Select a course" /></SelectTrigger><SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.id}>{c.code} — {c.name}</SelectItem>)}</SelectContent></Select></div>
              <div className="grid grid-cols-2 gap-4">
                <StarRatingInput value={overallRating} onChange={setOverallRating} label="Overall" />
                <StarRatingInput value={difficultyRating} onChange={setDifficultyRating} label="Difficulty" />
                <StarRatingInput value={relevanceRating} onChange={setRelevanceRating} label="Relevance" />
                <StarRatingInput value={workloadRating} onChange={setWorkloadRating} label="Workload" />
              </div>
              <div><Label className="text-xs text-muted-foreground mb-1.5 block">Review (min 100 chars)</Label><Textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Share your honest experience..." className="bg-card border-border min-h-[150px] rounded-lg" /><p className="text-[10px] text-muted-foreground text-right mt-1">{reviewText.length}/100 min</p></div>
              <div><Label className="text-xs text-muted-foreground mb-1.5 block">Tips (optional)</Label><Input value={tips} onChange={(e) => setTips(e.target.value)} placeholder="Tips for future students" className="bg-card border-border rounded-lg" /></div>
              <div><Label className="text-xs text-muted-foreground mb-1.5 block">Tags (comma-separated)</Label><Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="heavy workload, great prof" className="bg-card border-border rounded-lg" /></div>
            </>
          )}

          {/* EXCHANGE FORM */}
          {category === "exchange" && (
            <>
              <h1 className="text-lg font-semibold text-foreground">Exchange Diary</h1>
              <div><Label className="text-xs text-muted-foreground mb-1.5 block">College</Label><Select value={selectedCollegeId} onValueChange={setSelectedCollegeId}><SelectTrigger className="bg-card border-border rounded-lg"><SelectValue placeholder="Select a college" /></SelectTrigger><SelectContent>{colleges.map(c => <SelectItem key={c.id} value={c.id}>{c.name} ({c.country})</SelectItem>)}</SelectContent></Select></div>
              <div className="grid grid-cols-2 gap-4">
                <StarRatingInput value={academicsRating} onChange={setAcademicsRating} label="Academics" />
                <StarRatingInput value={livingRating} onChange={setLivingRating} label="Living & Costs" />
                <StarRatingInput value={socialRating} onChange={setSocialRating} label="Social Life" />
                <StarRatingInput value={travelRating} onChange={setTravelRating} label="Travel" />
              </div>
              <div><Label className="text-xs text-muted-foreground mb-1.5 block">Review (min 100 chars)</Label><Textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Share your exchange experience..." className="bg-card border-border min-h-[150px] rounded-lg" /><p className="text-[10px] text-muted-foreground text-right mt-1">{reviewText.length}/100 min</p></div>
            </>
          )}

          {/* INTERNSHIPS FORM */}
          {category === "internships" && (
            <>
              <h1 className="text-lg font-semibold text-foreground">Internship Report</h1>
              <div><Label className="text-xs text-muted-foreground mb-1.5 block">Company</Label><Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}><SelectTrigger className="bg-card border-border rounded-lg"><SelectValue placeholder="Select a company" /></SelectTrigger><SelectContent>{companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
              <div className="grid grid-cols-2 gap-4">
                <StarRatingInput value={cultureRating} onChange={setCultureRating} label="Work Culture" />
                <StarRatingInput value={learningRating} onChange={setLearningRating} label="Learning" />
                <StarRatingInput value={mentorshipRating} onChange={setMentorshipRating} label="Mentorship" />
                <StarRatingInput value={ppoRating} onChange={setPpoRating} label="PPO" />
              </div>
              <div><Label className="text-xs text-muted-foreground mb-1.5 block">Monthly Stipend (₹)</Label><Input value={stipend} onChange={(e) => setStipend(e.target.value)} placeholder="e.g. ₹80,000" className="bg-card border-border rounded-lg" /></div>
              <div><Label className="text-xs text-muted-foreground mb-1.5 block">Review (min 100 chars)</Label><Textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Share your internship experience..." className="bg-card border-border min-h-[150px] rounded-lg" /><p className="text-[10px] text-muted-foreground text-right mt-1">{reviewText.length}/100 min</p></div>
            </>
          )}

          {/* EXAM PAPERS FORM */}
          {category === "papers" && (
            <>
              <h1 className="text-lg font-semibold text-foreground">Upload Exam Paper</h1>
              <div><Label className="text-xs text-muted-foreground mb-1.5 block">Course</Label><Select value={selectedCourseId} onValueChange={setSelectedCourseId}><SelectTrigger className="bg-card border-border rounded-lg"><SelectValue placeholder="Select a course" /></SelectTrigger><SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.id}>{c.code} — {c.name}</SelectItem>)}</SelectContent></Select></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs text-muted-foreground mb-1.5 block">Exam Type</Label><Select value={examType} onValueChange={setExamType}><SelectTrigger className="bg-card border-border rounded-lg"><SelectValue placeholder="Type" /></SelectTrigger><SelectContent>{EXAM_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
                <div><Label className="text-xs text-muted-foreground mb-1.5 block">Year</Label><Input value={examYear} onChange={(e) => setExamYear(e.target.value)} placeholder="2024" className="bg-card border-border rounded-lg" /></div>
              </div>
              <div><Label className="text-xs text-muted-foreground mb-1.5 block">Title</Label><Input value={examTitle} onChange={(e) => setExamTitle(e.target.value)} placeholder="e.g. FIN301 End Term 2024" className="bg-card border-border rounded-lg" /></div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Upload PDF</Label>
                <label className="flex items-center gap-2 px-4 py-3 rounded-lg border border-dashed border-border bg-card cursor-pointer hover:border-primary/40 transition-colors">
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{examFile ? examFile.name : "Choose a PDF file"}</span>
                  <input type="file" accept=".pdf" className="hidden" onChange={(e) => setExamFile(e.target.files?.[0] || null)} />
                </label>
              </div>
            </>
          )}

          {/* CAMPUS TIPS FORM */}
          {category === "campus" && (
            <>
              <h1 className="text-lg font-semibold text-foreground">Campus Tip</h1>
              <div><Label className="text-xs text-muted-foreground mb-1.5 block">Category</Label><Select value={campusCategory} onValueChange={setCampusCategory}><SelectTrigger className="bg-card border-border rounded-lg"><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent>{CAMPUS_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent></Select></div>
              <div><Label className="text-xs text-muted-foreground mb-1.5 block">Place / Thing Name</Label><Input value={placeName} onChange={(e) => setPlaceName(e.target.value)} placeholder="e.g. Brahmos Cafe" className="bg-card border-border rounded-lg" /></div>
              <StarRatingInput value={campusRating} onChange={setCampusRating} label="Rating" />
              <div><Label className="text-xs text-muted-foreground mb-1.5 block">Your Tip (min 50 chars)</Label><Textarea value={tipText} onChange={(e) => setTipText(e.target.value)} placeholder="Share your tip..." className="bg-card border-border min-h-[120px] rounded-lg" /><p className="text-[10px] text-muted-foreground text-right mt-1">{tipText.length}/50 min</p></div>
            </>
          )}

          {/* Tag bar — shown at bottom for quick switching */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Type</Label>
            <div className="flex flex-wrap gap-1.5">
              {TAG_OPTIONS.map((t) => (
                <button key={t.key} type="button" onClick={() => setCategory(t.key)}
                  className={cn("text-xs font-medium px-3 py-1.5 rounded-lg transition-all border",
                    category === t.key ? "border-primary/40 text-primary bg-primary/10" : "border-border text-muted-foreground hover:text-foreground hover:border-border/80"
                  )}>{t.label}</button>
              ))}
            </div>
          </div>

          {/* Anonymous toggle */}
          <div className="flex items-center justify-between rounded-xl border border-border/50 bg-card px-4 py-3">
            <div className="flex items-center gap-2">
              <EyeOff className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs font-medium text-foreground">Post anonymously</p>
                <p className="text-[10px] text-muted-foreground">Your name won't be shown</p>
              </div>
            </div>
            <Switch checked={isAnonymous} onCheckedChange={setIsAnonymous} />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="button" variant="ghost" size="sm" className="rounded-lg" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" size="sm" className="rounded-lg font-semibold px-6" disabled={loading}>
              {loading ? "Submitting…" : "Submit"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
