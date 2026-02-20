import { useState, useEffect } from "react";
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
  score: initialScore,
  userVote: initialVote,
  onUpvote,
  onDownvote,
  size = "md",
  horizontal = false,
}: VoteButtonsProps) {
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [localVote, setLocalVote] = useState<1 | -1 | null>(initialVote ?? null);
  const [localScore, setLocalScore] = useState(initialScore);

  useEffect(() => {
    setLocalVote(initialVote ?? null);
    setLocalScore(initialScore);
  }, [initialVote, initialScore]);

  const handleUpvote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { setShowAuth(true); return; }
    if (localVote === 1) {
      setLocalScore(localScore - 1);
      setLocalVote(null);
    } else {
      setLocalScore(localScore + (localVote === -1 ? 2 : 1));
      setLocalVote(1);
    }
    onUpvote();
  };

  const handleDownvote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { setShowAuth(true); return; }
    if (localVote === -1) {
      setLocalScore(localScore + 1);
      setLocalVote(null);
    } else {
      setLocalScore(localScore - (localVote === 1 ? 2 : 1));
      setLocalVote(-1);
    }
    onDownvote();
  };

  const iconSize = size === "sm" ? "h-5 w-5" : "h-6 w-6";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <>
      <div
        className={cn(
          "flex items-center gap-0.5 rounded-full bg-secondary",
          horizontal ? "flex-row px-1" : "flex-col py-1"
        )}
      >
        <button
          onClick={handleUpvote}
          className={cn(
            "p-1 rounded-full transition-colors hover:bg-accent",
            localVote === 1 ? "text-orange-500" : "text-muted-foreground hover:text-orange-500"
          )}
          aria-label="Upvote"
        >
          <ArrowBigUp className={cn(iconSize, localVote === 1 && "fill-current")} />
        </button>
        <span className={cn("font-bold min-w-[2ch] text-center", textSize, {
          "text-orange-500": localVote === 1,
          "text-blue-500": localVote === -1,
          "text-foreground": !localVote,
        })}>
          {localScore}
        </span>
        <button
          onClick={handleDownvote}
          className={cn(
            "p-1 rounded-full transition-colors hover:bg-accent",
            localVote === -1 ? "text-blue-500" : "text-muted-foreground hover:text-blue-500"
          )}
          aria-label="Downvote"
        >
          <ArrowBigDown className={cn(iconSize, localVote === -1 && "fill-current")} />
        </button>
      </div>
      <AuthGuardDialog open={showAuth} onOpenChange={setShowAuth} action="vote on posts" />
    </>
  );
}
