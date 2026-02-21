import { cn } from "@/lib/utils";

interface FilterPillsProps {
  options: { value: string; label: string }[];
  selected: string;
  onSelect: (v: string) => void;
}

export default function FilterPills({ options, selected, onSelect }: FilterPillsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onSelect(o.value)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border",
            selected === o.value
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-muted-foreground border-border hover:border-primary/40"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
