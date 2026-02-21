import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [courses, exchange, internships, papers] = await Promise.all([
        supabase.from("course_reviews").select("id", { count: "exact", head: true }),
        supabase.from("exchange_reviews").select("id", { count: "exact", head: true }),
        supabase.from("internship_reviews").select("id", { count: "exact", head: true }),
        supabase.from("exam_papers").select("id", { count: "exact", head: true }),
      ]);
      return {
        courseReviews: courses.count ?? 0,
        exchangeDiaries: exchange.count ?? 0,
        internshipReports: internships.count ?? 0,
        examPapers: papers.count ?? 0,
      };
    },
    staleTime: 60000,
  });
}
