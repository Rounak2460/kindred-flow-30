import { useState } from "react";
import { ArrowBigUp, ArrowBigDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import AuthGuardDialog from "@/components/AuthGuardDialog";

interface VoteButtonsProps {
  score: number;
  userVote?: 1 | -1 | null;
  onUpvote: () => void;
  onDownvote: () => void;
  size?: "sm" | "md";
  horizontal?: boolean;
}

export default function VoteButtons({
  score,
  userVote,
  onUpvote,
  onDownvote,
  size = "md",
  horizontal = false,
}: VoteButtonsProps) {
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [bouncing, setBouncing] = useState<"up" | "down" | null>(null);

  const handleUpvote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { setShowAuth(true); return; }
    setBouncing("up");
    setTimeout(() => setBouncing(null), 250);
    onUpvote();
  };

  const handleDownvote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { setShowAuth(true); return; }
    setBouncing("down");
    setTimeout(() => setBouncing(null), 250);
    onDownvote();
  };

  const iconSize = size === "sm" ? "h-5 w-5" : "h-6 w-6";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <>
      <div
        className={cn(
          "flex items-center gap-0.5 rounded-full bg-muted/60",
          horizontal ? "flex-row px-1" : "flex-col py-1"
        )}
      >
        <button
          onClick={handleUpvote}
          className={cn(
            "p-1 rounded-full transition-colors hover:bg-muted",
            userVote === 1 ? "text-primary" : "text-muted-foreground hover:text-primary",
            bouncing === "up" && "animate-vote-bounce"
          )}
          aria-label="Upvote"
        >
          <ArrowBigUp className={cn(iconSize, userVote === 1 && "fill-current")} />
        </button>
        <span className={cn("font-bold min-w-[2ch] text-center tabular-nums", textSize, {
          "text-primary": userVote === 1,
          "text-blue-600": userVote === -1,
          "text-foreground": !userVote,
        })}>
          {score}
        </span>
        <button
          onClick={handleDownvote}
          className={cn(
            "p-1 rounded-full transition-colors hover:bg-muted",
            userVote === -1 ? "text-blue-600" : "text-muted-foreground hover:text-blue-600",
            bouncing === "down" && "animate-vote-bounce"
          )}
          aria-label="Downvote"
        >
          <ArrowBigDown className={cn(iconSize, userVote === -1 && "fill-current")} />
        </button>
      </div>
      <AuthGuardDialog open={showAuth} onOpenChange={setShowAuth} action="vote on posts" />
    </>
  );
}
