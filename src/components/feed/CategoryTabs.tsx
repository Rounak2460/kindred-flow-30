import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/lib/mock-data";

interface CategoryTabsProps {
  selected: string;
  onSelect: (category: string) => void;
}

export default function CategoryTabs({ selected, onSelect }: CategoryTabsProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1 -mx-1 px-1">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.key}
          onClick={() => onSelect(cat.key)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 border",
            selected === cat.key
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 hover:bg-muted"
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
