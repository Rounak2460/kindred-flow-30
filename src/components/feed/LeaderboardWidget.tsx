import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Award, Flame } from "lucide-react";
import { generateAnonHandle } from "@/lib/anonymity";

interface LeaderboardEntry {
  user_id: string;
  credits: number;
  founding_contributor: boolean;
}

export default function LeaderboardWidget() {
  const { data: leaders = [] } = useQuery({
    queryKey: ["leaderboard"],
    networkMode: "always" as const,
    retry: 2,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, credits, founding_contributor")
        .order("credits", { ascending: false })
        .limit(10);
      if (error) throw error;
      return (data || []) as LeaderboardEntry[];
    },
    staleTime: 60000,
  });

  const activeLeaders = leaders.filter(l => l.credits > 0);
  if (activeLeaders.length === 0) return null;

  return (
    <div className="bg-card/60 border border-border/40 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3">
        <Trophy className="h-4 w-4 text-primary" />
        <h3 className="font-sans font-semibold text-xs text-foreground uppercase tracking-wider">Top Contributors</h3>
      </div>
      <div className="px-2 pb-2">
        {activeLeaders.slice(0, 5).map((leader, i) => (
          <div key={leader.user_id} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-accent/40 transition-colors">
            <span className="text-xs font-bold text-muted-foreground w-5 text-center">
              {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-foreground truncate">
                  {generateAnonHandle(leader.user_id)}
                </span>
                {leader.founding_contributor && (
                  <Award className="h-3 w-3 text-primary flex-shrink-0" />
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Flame className="h-3 w-3 text-primary" />
              <span className="text-xs font-bold text-foreground tabular-nums">{leader.credits}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
