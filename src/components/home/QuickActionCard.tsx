import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

interface QuickActionCardProps {
  emoji: string;
  title: string;
  count: number;
  countLabel: string;
  to: string;
  addTo: string;
}

export default function QuickActionCard({ emoji, title, count, countLabel, to, addTo }: QuickActionCardProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(to)}
      className="group relative text-left rounded-xl border border-border bg-card p-3.5 transition-all hover:shadow-soft hover:border-primary/30 min-w-[120px] flex-shrink-0"
    >
      <h3 className="font-medium text-sm text-foreground mb-0.5">{title}</h3>
      <p className="text-[11px] text-muted-foreground">
        {count > 0 ? `${count} ${countLabel}` : `No ${countLabel} yet`}
      </p>
      <button
        onClick={(e) => { e.stopPropagation(); navigate(addTo); }}
        className="absolute top-2.5 right-2.5 h-6 w-6 rounded-md bg-primary/10 text-primary flex items-center justify-center transition-all hover:bg-primary hover:text-primary-foreground"
        aria-label={`Add ${title}`}
      >
        <Plus className="h-3 w-3" />
      </button>
    </button>
  );
}
