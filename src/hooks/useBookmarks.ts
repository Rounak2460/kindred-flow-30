import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useBookmarks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: bookmarks = [], isLoading } = useQuery({
    queryKey: ["bookmarks", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("bookmarks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const toggle = useMutation({
    mutationFn: async ({ contentId, contentType }: { contentId: string; contentType: string }) => {
      if (!user) throw new Error("Not authenticated");
      const existing = bookmarks.find((b) => b.content_id === contentId && b.content_type === contentType);
      if (existing) {
        await supabase.from("bookmarks").delete().eq("id", existing.id);
        return { action: "removed" };
      } else {
        await supabase.from("bookmarks").insert({ user_id: user.id, content_id: contentId, content_type: contentType });
        return { action: "added" };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      toast.success(result.action === "added" ? "Saved!" : "Removed from saved");
    },
  });

  const isBookmarked = (contentId: string, contentType: string) =>
    bookmarks.some((b) => b.content_id === contentId && b.content_type === contentType);

  return { bookmarks, isLoading, toggle: toggle.mutate, isBookmarked };
}
