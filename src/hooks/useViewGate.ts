import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const FREE_VIEW_LIMIT = 5;

export function useViewGate() {
  const { user, profile, refreshProfile } = useAuth();

  const canView = useCallback((): { allowed: boolean; reason?: string } => {
    if (!user || !profile) return { allowed: true }; // non-logged-in users can browse freely (auth gate catches actions)
    
    // Founding contributors get unlimited views
    if (profile.founding_contributor) return { allowed: true };
    
    // Users with credits can always view
    if (profile.credits > 0) return { allowed: true };
    
    // Free views remaining
    if (profile.free_views_used < FREE_VIEW_LIMIT) return { allowed: true };
    
    return { 
      allowed: false, 
      reason: "You've used all 5 free views. Post or comment to earn credits and unlock more content!" 
    };
  }, [user, profile]);

  const recordView = useCallback(async (contentId: string, contentType: "course_review" | "exam_paper" | "exchange_review" | "internship_review" | "campus_tip") => {
    if (!user) return;
    
    // Check if already viewed
    const { data: existing } = await supabase
      .from("content_views")
      .select("id")
      .eq("user_id", user.id)
      .eq("content_id", contentId)
      .eq("content_type", contentType)
      .maybeSingle();
    
    if (existing) return; // Already viewed, don't count again
    
    // Record view
    await supabase.from("content_views").insert({
      user_id: user.id,
      content_id: contentId,
      content_type: contentType,
    });
    
    // Increment free_views_used if no credits
    if (profile && !profile.founding_contributor && profile.credits <= 0) {
      await supabase
        .from("profiles")
        .update({ free_views_used: (profile.free_views_used || 0) + 1 })
        .eq("user_id", user.id);
      await refreshProfile();
    }
  }, [user, profile, refreshProfile]);

  return { canView, recordView, freeViewsRemaining: profile ? Math.max(0, FREE_VIEW_LIMIT - (profile.free_views_used || 0)) : FREE_VIEW_LIMIT };
}
