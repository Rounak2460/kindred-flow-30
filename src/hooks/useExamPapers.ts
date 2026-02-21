import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type ExamType = Database["public"]["Enums"]["exam_type"];

export function useExamPapers(examType?: string) {
  return useQuery({
    queryKey: ["exam-papers", examType],
    queryFn: async () => {
      let q = supabase.from("exam_papers").select("*, courses(name, code)").order("created_at", { ascending: false });
      if (examType && examType !== "all") q = q.eq("exam_type", examType as ExamType);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}
