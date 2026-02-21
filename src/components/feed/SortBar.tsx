import { cn } from "@/lib/utils";
import { ChevronDown, Flame, Clock, TrendingUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const current = options.find((o) => o.key === selected) || options[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border border-border">
          <current.icon className="h-3.5 w-3.5" />
          {current.label}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[120px]">
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt.key}
            onClick={() => onSelect(opt.key)}
            className={cn("text-xs gap-2", selected === opt.key && "text-primary font-semibold")}
          >
            <opt.icon className="h-3.5 w-3.5" />
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
