import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useExchangeReviews(collegeId: string | undefined) {
  return useQuery({
    queryKey: ["exchange-reviews", collegeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exchange_reviews")
        .select("*")
        .eq("college_id", collegeId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!collegeId,
  });
}
