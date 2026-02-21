import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Domain = Database["public"]["Enums"]["internship_domain"];

export function useInternshipCompanies(domain?: string) {
  return useQuery({
    queryKey: ["internship-companies", domain],
    queryFn: async () => {
      let q = supabase.from("internship_companies").select("*").order("avg_rating", { ascending: false });
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
