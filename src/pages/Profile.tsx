import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { generateAnonHandle } from "@/lib/anonymity";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Award, Star, Eye } from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [loading, user, navigate]);

  if (loading || !user || !profile) {
    return (
      <div className="flex justify-center py-16">
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
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="bg-primary h-20" />
        <div className="px-6 pb-6 -mt-10">
          <Avatar className="h-20 w-20 border-4 border-card">
            <AvatarFallback className="text-xl font-bold bg-secondary text-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="mt-3">
            <h1 className="text-lg font-bold text-foreground">{profile.name || "Anonymous"}</h1>
            <p className="text-sm text-muted-foreground">{anonHandle}</p>
            {profile.founding_contributor && (
              <Badge variant="secondary" className="mt-2 gap-1">
                <Award className="h-3 w-3" /> Founding Contributor
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 py-4 border-t border-border">
            <div className="text-center">
              <p className="text-lg font-bold text-foreground flex items-center justify-center gap-1">
                <Star className="h-4 w-4 text-primary" /> {profile.credits}
              </p>
              <p className="text-[11px] text-muted-foreground">Credits</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{profile.batch || "—"}</p>
              <p className="text-[11px] text-muted-foreground">Batch</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground flex items-center justify-center gap-1">
                <Eye className="h-4 w-4 text-muted-foreground" /> {Math.max(0, 5 - profile.free_views_used)}
              </p>
              <p className="text-[11px] text-muted-foreground">Free Views</p>
            </div>
          </div>

          {profile.section && (
            <div className="py-3 border-t border-border">
              <p className="text-xs text-muted-foreground">Section: <span className="text-foreground font-medium">{profile.section}</span></p>
            </div>
          )}

          <Button variant="outline" className="w-full mt-4 gap-2" onClick={handleLogout}>
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
