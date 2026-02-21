import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type CourseCategory = Database["public"]["Enums"]["course_category"];
type CourseDomain = Database["public"]["Enums"]["course_domain"];

export function useCourses(category?: string, domain?: string, search?: string) {
  return useQuery({
    queryKey: ["courses", category, domain, search],
    queryFn: async () => {
      let q = supabase.from("courses").select("*").order("avg_rating", { ascending: false });
      if (category && category !== "all") q = q.eq("category", category as CourseCategory);
      if (domain && domain !== "all") q = q.eq("domain", domain as CourseDomain);
      if (search?.trim()) q = q.or(`name.ilike.%${search}%,code.ilike.%${search}%`);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

export function useCourse(id: string | undefined) {
  return useQuery({
    queryKey: ["course", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("courses").select("*").eq("id", id!).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}
