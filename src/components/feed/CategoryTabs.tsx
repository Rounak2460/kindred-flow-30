import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/lib/mock-data";

const EMOJI_MAP: Record<string, string> = {
  all: "🔥",
  academics: "📚",
  exchange: "✈️",
  internships: "💼",
  campus: "🏫",
  papers: "📝",
};

interface CategoryTabsProps {
  selected: string;
  onSelect: (category: string) => void;
}

export default function CategoryTabs({ selected, onSelect }: CategoryTabsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1 -mx-1 px-1">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.key}
          onClick={() => onSelect(cat.key)}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 border",
            selected === cat.key
              ? "border-primary bg-primary text-primary-foreground shadow-sm"
              : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 hover:bg-muted"
          )}
        >
          <span className="text-sm">{EMOJI_MAP[cat.key] || "📌"}</span>
          {cat.label}
        </button>
      ))}
    </div>
  );
}
