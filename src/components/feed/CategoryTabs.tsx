import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/lib/mock-data";

interface CategoryTabsProps {
  selected: string;
  onSelect: (category: string) => void;
}

export default function CategoryTabs({ selected, onSelect }: CategoryTabsProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.key}
          onClick={() => onSelect(cat.key)}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
            selected === cat.key
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-secondary/70 text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
        >
          <span className="text-sm">{cat.icon}</span>
          {cat.label}
        </button>
      ))}
    </div>
  );
}
