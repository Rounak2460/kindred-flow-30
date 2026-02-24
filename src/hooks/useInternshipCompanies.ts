import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Domain = Database["public"]["Enums"]["internship_domain"];

export function useInternshipCompanies(domain?: string, sort: string = "rating") {
  return useQuery({
    queryKey: ["internship-companies", domain, sort],
    queryFn: async () => {
      let q = supabase.from("internship_companies").select("*");
      if (sort === "reviews") q = q.order("review_count", { ascending: false });
      else if (sort === "newest") q = q.order("created_at", { ascending: false });
      else q = q.order("avg_rating", { ascending: false });
      if (domain && domain !== "all") q = q.eq("domain", domain as Domain);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

export function useInternshipCompany(id: string | undefined) {
  return useQuery({
    queryKey: ["internship-company", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("internship_companies").select("*").eq("id", id!).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}
