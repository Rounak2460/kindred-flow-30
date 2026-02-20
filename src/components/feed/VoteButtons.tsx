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
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const textSize = size === "sm" ? "text-[10px]" : "text-xs";

  return (
    <div className="flex flex-col items-center gap-0">
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onUpvote(); }}
        className={cn(
          "p-0.5 rounded transition-colors",
          userVote === 1
            ? "text-primary"
            : "text-muted-foreground/60 hover:text-primary"
        )}
      >
        <ChevronUp className={iconSize} />
      </button>
      <span className={cn("font-semibold tabular-nums leading-none", textSize, score > 0 ? "text-foreground" : "text-muted-foreground")}>
        {score}
      </span>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDownvote(); }}
        className={cn(
          "p-0.5 rounded transition-colors",
          userVote === -1
            ? "text-destructive"
            : "text-muted-foreground/60 hover:text-destructive"
        )}
      >
        <ChevronDown className={iconSize} />
      </button>
    </div>
  );
}
