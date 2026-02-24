import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useExchangeReviews(collegeId: string | undefined, sort: string = "newest") {
  return useQuery({
    queryKey: ["exchange-reviews", collegeId, sort],
    queryFn: async () => {
      let q = supabase
        .from("exchange_reviews")
        .select("*")
        .eq("college_id", collegeId!);
      if (sort === "top") q = q.order("academics_rating", { ascending: false });
      else q = q.order("created_at", { ascending: false });
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    enabled: !!collegeId,
  });
}
