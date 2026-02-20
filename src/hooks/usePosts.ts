import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Post {
  id: string;
  user_id: string;
  category: string;
  title: string;
  body: string;
  flair: string | null;
  upvote_count: number;
  downvote_count: number;
  comment_count: number;
  pinned: boolean;
  course_code: string | null;
  course_name: string | null;
  company_name: string | null;
  college_name: string | null;
  created_at: string;
  moderation_status: string;
  file_url: string | null;
}

type SortOption = "hot" | "new" | "top";

function sortPosts(posts: Post[], sort: SortOption): Post[] {
  const sorted = [...posts];
  if (sort === "new") {
    sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } else if (sort === "top") {
    sorted.sort((a, b) => (b.upvote_count - b.downvote_count) - (a.upvote_count - a.downvote_count));
  } else {
    sorted.sort((a, b) => {
      const scoreA = (a.upvote_count - a.downvote_count) + a.comment_count * 2;
      const scoreB = (b.upvote_count - b.downvote_count) + b.comment_count * 2;
      const ageA = (Date.now() - new Date(a.created_at).getTime()) / 3600000;
      const ageB = (Date.now() - new Date(b.created_at).getTime()) / 3600000;
      return (scoreB / Math.pow(ageB + 2, 1.5)) - (scoreA / Math.pow(ageA + 2, 1.5));
    });
  }
  const pinned = sorted.filter(p => p.pinned);
  const unpinned = sorted.filter(p => !p.pinned);
  return [...pinned, ...unpinned];
}

export function usePosts(category?: string, sort: SortOption = "hot", search?: string) {
  return useQuery({
    queryKey: ["posts", category, sort, search],
    networkMode: "always" as const,
    retry: 2,
    queryFn: async () => {
      let query = supabase
        .from("posts")
        .select("*")
        .eq("moderation_status", "approved");

      if (category && category !== "all") {
        query = query.eq("category", category);
      }

      if (search?.trim()) {
        const q = search.trim();
        query = query.or(`title.ilike.%${q}%,body.ilike.%${q}%,flair.ilike.%${q}%,course_code.ilike.%${q}%,course_name.ilike.%${q}%,company_name.ilike.%${q}%,college_name.ilike.%${q}%`);
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return sortPosts((data || []) as Post[], sort);
    },
  });
}

export function usePost(id: string | undefined) {
  return useQuery({
    queryKey: ["post", id],
    networkMode: "always" as const,
    retry: 2,
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as Post | null;
    },
    enabled: !!id,
  });
}
