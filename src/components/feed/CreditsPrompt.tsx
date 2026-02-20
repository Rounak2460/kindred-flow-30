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
    <div className="bg-card border border-primary/30 rounded-lg p-6 text-center">
      <Lock className="h-8 w-8 text-primary mx-auto mb-3" />
      <h3 className="font-bold text-foreground mb-1">Content Locked</h3>
      <p className="text-sm text-muted-foreground mb-4">
        You've used all 5 free views. Contribute to unlock unlimited access!
      </p>
      
      <div className="space-y-2 mb-4 text-left max-w-xs mx-auto">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <PenSquare className="h-3.5 w-3.5 text-primary" />
          <span>Post a thread → <span className="text-foreground font-bold">+10 credits</span> (early bonus!)</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <PenSquare className="h-3.5 w-3.5 text-primary" />
          <span>Comment on a thread → <span className="text-foreground font-bold">+2 credits</span></span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Award className="h-3.5 w-3.5 text-primary" />
          <span>First 50 posters get <span className="text-foreground font-bold">Founding Contributor</span> badge</span>
        </div>
      </div>
      
      {profile && (
        <p className="text-[11px] text-muted-foreground mb-3">
          Your credits: <span className="font-bold text-foreground">{profile.credits}</span>
        </p>
      )}
      
      <Button onClick={() => navigate("/submit")} className="rounded-full font-bold text-xs">
        Create a Post to Unlock
      </Button>
    </div>
  );
}
