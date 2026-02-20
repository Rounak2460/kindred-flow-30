import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Comment {
  id: string;
  post_id: string;
  parent_id: string | null;
  user_id: string;
  body: string;
  upvote_count: number;
  downvote_count: number;
  created_at: string;
  moderation_status: string;
  replies: Comment[];
}

function buildTree(flat: Omit<Comment, "replies">[]): Comment[] {
  const map = new Map<string, Comment>();
  const roots: Comment[] = [];

  for (const c of flat) {
    map.set(c.id, { ...c, replies: [] });
  }

  for (const c of flat) {
    const node = map.get(c.id)!;
    if (c.parent_id && map.has(c.parent_id)) {
      map.get(c.parent_id)!.replies.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export function useComments(postId: string | undefined) {
  return useQuery({
    queryKey: ["comments", postId],
    networkMode: "always" as const,
    retry: 2,
    queryFn: async () => {
      if (!postId) return [];
      const { data, error } = await supabase
        .from("comments")
        .select("id, post_id, parent_id, user_id, body, upvote_count, downvote_count, created_at, moderation_status")
        .eq("post_id", postId)
        .eq("moderation_status", "approved")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return buildTree(data || []);
    },
    enabled: !!postId,
  });
}
