import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useInternshipReviews(companyId: string | undefined, sort: string = "newest") {
  return useQuery({
    queryKey: ["internship-reviews", companyId, sort],
    queryFn: async () => {
      let q = supabase
        .from("internship_reviews")
        .select("*")
        .eq("company_id", companyId!);
      if (sort === "top") q = q.order("work_culture_rating", { ascending: false });
      else q = q.order("created_at", { ascending: false });
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    enabled: !!companyId,
  });
}
