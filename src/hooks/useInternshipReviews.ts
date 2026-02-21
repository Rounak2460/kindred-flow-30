import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useInternshipReviews(companyId: string | undefined) {
  return useQuery({
    queryKey: ["internship-reviews", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("internship_reviews")
        .select("*")
        .eq("company_id", companyId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!companyId,
  });
}
