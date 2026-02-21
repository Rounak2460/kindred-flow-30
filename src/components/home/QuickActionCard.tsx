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
      className="group relative text-left rounded-2xl border border-border bg-card p-4 transition-all hover:shadow-soft hover:border-primary/30 min-w-[140px]"
    >
      <div className="text-2xl mb-2">{emoji}</div>
      <h3 className="font-semibold text-sm text-foreground mb-0.5">{title}</h3>
      <p className="text-[11px] text-muted-foreground">
        {count > 0 ? `${count} ${countLabel}` : `No ${countLabel} yet`}
      </p>
      <button
        onClick={(e) => { e.stopPropagation(); navigate(addTo); }}
        className="absolute top-3 right-3 h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-primary-foreground hover:scale-110"
        aria-label={`Add ${title}`}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </button>
  );
}
