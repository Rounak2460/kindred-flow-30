import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Region = Database["public"]["Enums"]["exchange_region"];

export function useExchangeColleges(region?: string) {
  return useQuery({
    queryKey: ["exchange-colleges", region],
    queryFn: async () => {
      let q = supabase.from("exchange_colleges").select("*").order("avg_rating", { ascending: false });
      if (region && region !== "all") q = q.eq("region", region as Region);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

export function useExchangeCollege(id: string | undefined) {
  return useQuery({
    queryKey: ["exchange-college", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("exchange_colleges").select("*").eq("id", id!).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}
