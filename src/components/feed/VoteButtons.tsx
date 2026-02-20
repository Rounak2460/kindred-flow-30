import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoteButtonsProps {
  score: number;
  userVote?: 1 | -1 | null;
  onUpvote: () => void;
  onDownvote: () => void;
  size?: "sm" | "md";
}

export default function VoteButtons({ score, userVote, onUpvote, onDownvote, size = "md" }: VoteButtonsProps) {
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className="flex flex-col items-center gap-0.5">
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onUpvote(); }}
        className={cn(
          "p-1 rounded-md transition-colors",
          userVote === 1
            ? "text-primary bg-accent"
            : "text-muted-foreground hover:text-primary hover:bg-accent"
        )}
      >
        <ChevronUp className={iconSize} />
      </button>
      <span className={cn("font-semibold tabular-nums", textSize, score > 0 ? "text-foreground" : "text-muted-foreground")}>
        {score}
      </span>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDownvote(); }}
        className={cn(
          "p-1 rounded-md transition-colors",
          userVote === -1
            ? "text-accent-foreground bg-secondary"
            : "text-muted-foreground hover:text-accent-foreground hover:bg-secondary"
        )}
      >
        <ChevronDown className={iconSize} />
      </button>
    </div>
  );
}
