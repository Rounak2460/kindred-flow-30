import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Category = Database["public"]["Enums"]["campus_category"];

export function useCampusTips(category?: string) {
  return useQuery({
    queryKey: ["campus-tips", category],
    queryFn: async () => {
      let q = supabase.from("campus_tips").select("*").order("useful_count", { ascending: false });
      if (category && category !== "all") q = q.eq("category", category as Category);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}
