import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Award, MessageCircle, Star } from "lucide-react";
import { useStartConversation } from "@/hooks/useChat";
import { toast } from "sonner";

interface PublicProfile {
  user_id: string;
  name: string;
  batch: string;
  section: string;
  bio: string;
  credits: number;
  founding_contributor: boolean;
  avatar_url: string | null;
}

export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const startConversation = useStartConversation();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  // Redirect to own profile
  useEffect(() => {
    if (user && userId === user.id) navigate("/profile", { replace: true });
  }, [user, userId, navigate]);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    supabase
      .from("profiles")
      .select("user_id, name, batch, section, bio, credits, founding_contributor, avatar_url")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => {
        setProfile(data as PublicProfile | null);
        setLoading(false);
      });
  }, [userId]);

  const handleMessage = async () => {
    if (!user) { navigate("/auth"); return; }
    if (!userId) return;
    setStarting(true);
    try {
      const convId = await startConversation(userId);
      navigate(`/chat/${convId}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to start conversation");
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-sm text-muted-foreground">User not found</p>
        <button onClick={() => navigate(-1)} className="text-primary text-sm hover:underline mt-2">← Go back</button>
      </div>
    );
  }

  const initials = profile.name
    ? profile.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="h-16 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
        <div className="px-5 pb-6 -mt-8">
          <Avatar className="h-16 w-16 border-4 border-card shadow-lg">
            <AvatarFallback className="text-lg font-semibold bg-muted text-foreground">{initials}</AvatarFallback>
          </Avatar>
          <div className="mt-3">
            <h2 className="text-lg font-semibold text-foreground">{profile.name || "Anonymous"}</h2>
            {profile.bio && <p className="text-sm text-foreground/80 mt-1">{profile.bio}</p>}
            {profile.founding_contributor && (
              <Badge variant="secondary" className="mt-2 gap-1 bg-primary/10 text-primary border-primary/20">
                <Award className="h-3 w-3" /> Founding Contributor
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 mt-5">
            <div className="bg-muted/50 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Star className="h-4 w-4 text-primary" />
                <p className="text-lg font-semibold text-foreground tabular-nums">{profile.credits}</p>
              </div>
              <p className="text-[11px] text-muted-foreground">Credits</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-3 text-center">
              <p className="text-lg font-semibold text-foreground mb-0.5">{profile.batch || "—"}</p>
              <p className="text-[11px] text-muted-foreground">Batch</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-3 text-center">
              <p className="text-lg font-semibold text-foreground mb-0.5">{profile.section || "—"}</p>
              <p className="text-[11px] text-muted-foreground">Section</p>
            </div>
          </div>

          {user && user.id !== userId && (
            <Button className="w-full mt-5 gap-2 rounded-lg" onClick={handleMessage} disabled={starting}>
              <MessageCircle className="h-4 w-4" />
              {starting ? "Starting chat…" : "Send Message"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
