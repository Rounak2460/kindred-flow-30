import { useState } from "react";
import { ArrowBigUp, ArrowBigDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoteButtonsProps {
  score: number;
  userVote?: 1 | -1 | null;
  onUpvote: () => void;
  onDownvote: () => void;
  size?: "sm" | "md";
  horizontal?: boolean;
}

export default function VoteButtons({ score: initialScore, userVote: initialVote, onUpvote, onDownvote, size = "md", horizontal = false }: VoteButtonsProps) {
  const [localVote, setLocalVote] = useState<1 | -1 | null>(initialVote ?? null);
  const [localScore, setLocalScore] = useState(initialScore);

  const handleUpvote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (localVote === 1) {
      setLocalVote(null);
      setLocalScore(initialScore);
    } else {
      setLocalVote(1);
      setLocalScore(initialScore + 1 + (localVote === -1 ? 1 : 0));
    }
    onUpvote();
  };

  const handleDownvote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (localVote === -1) {
      setLocalVote(null);
      setLocalScore(initialScore);
    } else {
      setLocalVote(-1);
      setLocalScore(initialScore - 1 - (localVote === 1 ? 1 : 0));
    }
    onDownvote();
  };

  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const textSize = size === "sm" ? "text-xs" : "text-xs";

  return (
    <div className={cn(
      "flex items-center gap-0.5 rounded-full bg-secondary",
      horizontal ? "flex-row px-1 py-0.5" : "flex-col py-1 px-0.5"
    )}>
      <button
        onClick={handleUpvote}
        className={cn(
          "p-1 rounded-full transition-colors hover:bg-accent",
          localVote === 1 ? "text-upvote" : "text-muted-foreground hover:text-upvote"
        )}
        aria-label="Upvote"
      >
        <ArrowBigUp className={cn(iconSize, localVote === 1 && "fill-current")} />
      </button>
      <span className={cn(
        "font-bold tabular-nums leading-none min-w-[1.5rem] text-center",
        textSize,
        localVote === 1 ? "text-upvote" : localVote === -1 ? "text-downvote" : "text-foreground"
      )}>
        {localScore}
      </span>
      <button
        onClick={handleDownvote}
        className={cn(
          "p-1 rounded-full transition-colors hover:bg-accent",
          localVote === -1 ? "text-downvote" : "text-muted-foreground hover:text-downvote"
        )}
        aria-label="Downvote"
      >
        <ArrowBigDown className={cn(iconSize, localVote === -1 && "fill-current")} />
      </button>
    </div>
  );
}
