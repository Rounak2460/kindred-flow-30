import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md";
  showValue?: boolean;
}

export default function StarRating({ rating, max = 5, size = "sm", showValue = true }: StarRatingProps) {
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4.5 w-4.5";
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {Array.from({ length: max }, (_, i) => {
          const filled = i < Math.floor(rating);
          const half = !filled && i < rating;
          return (
            <Star
              key={i}
              className={cn(
                iconSize,
                filled ? "fill-yellow-400 text-yellow-400" : half ? "fill-yellow-400/50 text-yellow-400" : "text-muted-foreground/30"
              )}
            />
          );
        })}
      </div>
      {showValue && <span className="text-xs font-medium text-muted-foreground ml-0.5">{rating.toFixed(1)}</span>}
    </div>
  );
}
