import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useCourseReviews(courseId: string | undefined, sort: string = "newest") {
  return useQuery({
    queryKey: ["course-reviews", courseId, sort],
    queryFn: async () => {
      let q = supabase
        .from("course_reviews")
        .select("*")
        .eq("course_id", courseId!);
      if (sort === "top") q = q.order("overall_rating", { ascending: false });
      else q = q.order("created_at", { ascending: false });
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    enabled: !!courseId,
  });
}
