import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { generateAnonHandle } from "@/lib/anonymity";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Award, Star, Eye, Settings } from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [loading, user, navigate]);

  if (loading || !user || !profile) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const anonHandle = generateAnonHandle(user.id);
  const initials = profile.name
    ? profile.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl text-foreground">Profile</h1>
        <button
          onClick={handleLogout}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>

      {/* Profile card */}
      <div className="bg-card/60 border border-border/40 rounded-2xl overflow-hidden">
        {/* Gradient header */}
        <div className="h-20 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
        <div className="px-5 pb-6 -mt-10">
          <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
            <AvatarFallback className="text-xl font-bold bg-secondary text-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="mt-3">
            <h2 className="text-lg font-semibold text-foreground">{profile.name || "Anonymous"}</h2>
            <p className="text-sm text-muted-foreground">{anonHandle}</p>
            {profile.founding_contributor && (
              <Badge variant="secondary" className="mt-2 gap-1 bg-primary/10 text-primary border-primary/20">
                <Award className="h-3 w-3" /> Founding Contributor
              </Badge>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-secondary/40 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Star className="h-4 w-4 text-primary" />
                <p className="text-lg font-bold text-foreground tabular-nums">{profile.credits}</p>
              </div>
              <p className="text-[11px] text-muted-foreground">Credits</p>
            </div>
            <div className="bg-secondary/40 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-foreground mb-0.5">{profile.batch || "—"}</p>
              <p className="text-[11px] text-muted-foreground">Batch</p>
            </div>
            <div className="bg-secondary/40 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <p className="text-lg font-bold text-foreground tabular-nums">{Math.max(0, 5 - profile.free_views_used)}</p>
              </div>
              <p className="text-[11px] text-muted-foreground">Free Views</p>
            </div>
          </div>

          {profile.section && (
            <div className="mt-4 py-3 border-t border-border/30">
              <p className="text-xs text-muted-foreground">Section: <span className="text-foreground font-medium">{profile.section}</span></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
