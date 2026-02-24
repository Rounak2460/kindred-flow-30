import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
}

export default function StarRatingInput({ value, onChange, label }: StarRatingInputProps) {
  const [hover, setHover] = useState(0);

  return (
    <div>
      {label && <p className="text-xs font-medium text-muted-foreground mb-1.5">{label}</p>}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star
              className={cn(
                "h-6 w-6 transition-colors",
                (hover || value) >= star
                  ? "fill-primary text-primary"
                  : "text-border"
              )}
            />
          </button>
        ))}
        {(hover || value) > 0 && (
          <span className="text-xs text-muted-foreground ml-1.5">{hover || value}/5</span>
        )}
      </div>
    </div>
  );
}
