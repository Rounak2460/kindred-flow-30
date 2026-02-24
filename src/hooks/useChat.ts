import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  other_user: { user_id: string; name: string; avatar_url: string | null };
  last_message?: { body: string; created_at: string; sender_id: string };
  unread: boolean;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

export function useConversations() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["conversations", user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return [];
      // Get all conversation IDs for this user
      const { data: myParticipations, error: pErr } = await supabase
        .from("conversation_participants")
        .select("conversation_id, last_read_at")
        .eq("user_id", user.id);
      if (pErr) throw pErr;
      if (!myParticipations?.length) return [];

      const convIds = myParticipations.map((p) => p.conversation_id);
      const lastReadMap = new Map(myParticipations.map((p) => [p.conversation_id, p.last_read_at]));

      // Get conversations
      const { data: convs, error: cErr } = await supabase
        .from("conversations")
        .select("id, created_at, updated_at")
        .in("id", convIds)
        .order("updated_at", { ascending: false });
      if (cErr) throw cErr;

      // Get other participants
      const { data: allParticipants } = await supabase
        .from("conversation_participants")
        .select("conversation_id, user_id")
        .in("conversation_id", convIds)
        .neq("user_id", user.id);

      // Get profiles for other users
      const otherUserIds = [...new Set((allParticipants || []).map((p) => p.user_id))];
      const { data: profiles } = otherUserIds.length
        ? await supabase.from("profiles").select("user_id, name, avatar_url").in("user_id", otherUserIds)
        : { data: [] };
      const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));

      // Get last message per conversation
      const result: Conversation[] = [];
      for (const conv of convs || []) {
        const otherP = (allParticipants || []).find((p) => p.conversation_id === conv.id);
        const otherProfile = otherP ? profileMap.get(otherP.user_id) : null;

        const { data: lastMsg } = await supabase
          .from("messages")
          .select("body, created_at, sender_id")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const lastRead = lastReadMap.get(conv.id) || conv.created_at;
        const unread = lastMsg ? new Date(lastMsg.created_at) > new Date(lastRead) : false;

        result.push({
          id: conv.id,
          created_at: conv.created_at,
          updated_at: conv.updated_at,
          other_user: {
            user_id: otherP?.user_id || "",
            name: otherProfile?.name || "Unknown",
            avatar_url: otherProfile?.avatar_url || null,
          },
          last_message: lastMsg || undefined,
          unread,
        });
      }
      return result;
    },
  });
}

export function useMessages(conversationId: string | undefined) {
  const queryClient = useQueryClient();

  // Realtime subscription
  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId, queryClient]);

  return useQuery({
    queryKey: ["messages", conversationId],
    enabled: !!conversationId,
    refetchInterval: false,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("id, conversation_id, sender_id, body, created_at")
        .eq("conversation_id", conversationId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data || []) as Message[];
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ conversationId, body }: { conversationId: string; body: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: user.id,
        body,
      });
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["messages", vars.conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useStartConversation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useCallback(async (otherUserId: string): Promise<string> => {
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .rpc("start_conversation", { other_user_id: otherUserId });

    if (error) throw error;

    queryClient.invalidateQueries({ queryKey: ["conversations"] });
    return data as string;
  }, [user, queryClient]);
}

export function useUnreadCount() {
  const { data: conversations = [] } = useConversations();
  return conversations.filter((c) => c.unread).length;
}

export function useMarkRead(conversationId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useCallback(async () => {
    if (!user || !conversationId) return;
    await supabase
      .from("conversation_participants")
      .update({ last_read_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .eq("user_id", user.id);
    queryClient.invalidateQueries({ queryKey: ["conversations"] });
  }, [user, conversationId, queryClient]);
}
