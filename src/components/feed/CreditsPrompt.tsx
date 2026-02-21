import { useNavigate } from "react-router-dom";
import { Lock, PenSquare, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface CreditsPromptProps {
  freeViewsRemaining: number;
}

export default function CreditsPrompt({ freeViewsRemaining }: CreditsPromptProps) {
  const navigate = useNavigate();
  const { profile } = useAuth();

  return (
    <div className="bg-card border border-border rounded-xl p-6 text-center shadow-soft">
      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
        <Lock className="h-6 w-6 text-primary" />
      </div>
      <h3 className="font-semibold text-foreground mb-1">Content Locked</h3>
      <p className="text-sm text-muted-foreground mb-4">
        You've used all 5 free views. Contribute to unlock unlimited access!
      </p>
      <div className="space-y-2 mb-4 text-left max-w-xs mx-auto">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <PenSquare className="h-3.5 w-3.5 text-primary" />
          <span>Post a thread → <span className="text-foreground font-semibold">+10 credits</span></span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <PenSquare className="h-3.5 w-3.5 text-primary" />
          <span>Comment on a thread → <span className="text-foreground font-semibold">+2 credits</span></span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Award className="h-3.5 w-3.5 text-primary" />
          <span>First 50 posters get <span className="text-foreground font-semibold">Founding Contributor</span> badge</span>
        </div>
      </div>
      {profile && <p className="text-[11px] text-muted-foreground mb-3">Your credits: <span className="font-semibold text-foreground">{profile.credits}</span></p>}
      <Button onClick={() => navigate("/submit")} className="rounded-lg font-semibold text-xs">Create a Post to Unlock</Button>
    </div>
  );
}
