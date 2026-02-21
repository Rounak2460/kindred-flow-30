import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface GossipPost {
  id: string;
  body: string;
  upvote_count: number;
  downvote_count: number;
  comment_count: number;
  moderation_status: string;
  created_at: string;
}

export interface GossipComment {
  id: string;
  gossip_id: string;
  parent_id: string | null;
  body: string;
  upvote_count: number;
  downvote_count: number;
  moderation_status: string;
  created_at: string;
  replies?: GossipComment[];
}

export function useGossipPosts() {
  return useQuery({
    queryKey: ["gossip-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gossip_posts")
        .select("id, body, upvote_count, downvote_count, comment_count, moderation_status, created_at")
        .eq("moderation_status", "approved")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as GossipPost[];
    },
  });
}

export function useGossipComments(gossipId: string | undefined) {
  return useQuery({
    queryKey: ["gossip-comments", gossipId],
    enabled: !!gossipId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gossip_comments")
        .select("id, gossip_id, parent_id, body, upvote_count, downvote_count, moderation_status, created_at")
        .eq("gossip_id", gossipId!)
        .eq("moderation_status", "approved")
        .order("created_at", { ascending: true });
      if (error) throw error;

      // Build tree
      const comments = (data || []) as GossipComment[];
      const map = new Map<string, GossipComment>();
      const roots: GossipComment[] = [];
      comments.forEach((c) => { c.replies = []; map.set(c.id, c); });
      comments.forEach((c) => {
        if (c.parent_id && map.has(c.parent_id)) {
          map.get(c.parent_id)!.replies!.push(c);
        } else {
          roots.push(c);
        }
      });
      return roots;
    },
  });
}

export function useCreateGossipPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("gossip_posts")
        .insert({ body, user_id: user.id })
        .select("id")
        .single();
      if (error) throw error;

      // Trigger moderation
      await supabase.functions.invoke("moderate-gossip", {
        body: { content_type: "gossip_post", content_id: data.id, body },
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gossip-posts"] });
    },
  });
}

export function useCreateGossipComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ gossipId, parentId, body }: { gossipId: string; parentId?: string; body: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("gossip_comments")
        .insert({ gossip_id: gossipId, parent_id: parentId || null, body, user_id: user.id })
        .select("id")
        .single();
      if (error) throw error;

      await supabase.functions.invoke("moderate-gossip", {
        body: { content_type: "gossip_comment", content_id: data.id, body },
      });

      return data;
    },
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ["gossip-comments", vars.gossipId] });
      queryClient.invalidateQueries({ queryKey: ["gossip-posts"] });
    },
  });
}
