import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useVote(targetId: string, targetType: "post" | "comment", initialScore: number) {
  const { user } = useAuth();
  const [userVote, setUserVote] = useState<1 | -1 | null>(null);
  const [score, setScore] = useState(initialScore);
  const [loaded, setLoaded] = useState(false);

  const loadVote = useCallback(async () => {
    if (!user || loaded) return;
    const { data } = await supabase
      .from("votes")
      .select("vote_type")
      .eq("target_id", targetId)
      .eq("target_type", targetType)
      .eq("user_id", user.id)
      .maybeSingle();
    if (data) setUserVote(data.vote_type as 1 | -1);
    setLoaded(true);
  }, [user, targetId, targetType, loaded]);

  const vote = useCallback(async (voteType: 1 | -1): Promise<boolean> => {
    if (!user) return false;

    if (userVote === voteType) {
      // Remove vote
      await supabase
        .from("votes")
        .delete()
        .eq("target_id", targetId)
        .eq("target_type", targetType)
        .eq("user_id", user.id);
      setScore(s => s - voteType);
      setUserVote(null);
    } else {
      if (userVote) {
        // Change vote
        await supabase
          .from("votes")
          .update({ vote_type: voteType })
          .eq("target_id", targetId)
          .eq("target_type", targetType)
          .eq("user_id", user.id);
        setScore(s => s - userVote + voteType);
      } else {
        // New vote
        await supabase.from("votes").insert({
          target_id: targetId,
          target_type: targetType,
          user_id: user.id,
          vote_type: voteType,
        });
        setScore(s => s + voteType);
      }
      setUserVote(voteType);
    }
    return true;
  }, [user, userVote, targetId, targetType]);

  return { score, userVote, vote, loadVote };
}
