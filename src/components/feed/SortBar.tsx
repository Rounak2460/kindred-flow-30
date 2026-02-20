import { cn } from "@/lib/utils";
import { Flame, Clock, TrendingUp } from "lucide-react";

type SortOption = "hot" | "new" | "top";

interface SortBarProps {
  selected: SortOption;
  onSelect: (option: SortOption) => void;
}

const options = [
  { key: "hot" as const, label: "Hot", icon: Flame },
  { key: "new" as const, label: "New", icon: Clock },
  { key: "top" as const, label: "Top", icon: TrendingUp },
];

export default function SortBar({ selected, onSelect }: SortBarProps) {
  return (
    <div className="flex items-center gap-1 bg-card border border-border/50 rounded-xl p-1 shadow-soft">
      {options.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onSelect(opt.key)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
            selected === opt.key
              ? "bg-secondary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <opt.icon className="h-3.5 w-3.5" />
          {opt.label}
        </button>
      ))}
    </div>
  );
}
