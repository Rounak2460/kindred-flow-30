import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/lib/mock-data";

interface CategoryTabsProps {
  selected: string;
  onSelect: (category: string) => void;
}

export default function CategoryTabs({ selected, onSelect }: CategoryTabsProps) {
  return (
    <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide border-b border-border">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.key}
          onClick={() => onSelect(cat.key)}
          className={cn(
            "px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px",
            selected === cat.key
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
