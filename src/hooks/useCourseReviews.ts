import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useCourseReviews(courseId: string | undefined) {
  return useQuery({
    queryKey: ["course-reviews", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_reviews")
        .select("*")
        .eq("course_id", courseId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!courseId,
  });
}
