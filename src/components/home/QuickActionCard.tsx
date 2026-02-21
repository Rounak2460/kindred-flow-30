import { useNavigate } from "react-router-dom";
import { Plus, LucideIcon } from "lucide-react";

interface QuickActionCardProps {
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  count: number;
  countLabel: string;
  to: string;
  addTo: string;
}

export default function QuickActionCard({ icon: Icon, iconColor, iconBg, title, subtitle, count, countLabel, to, addTo }: QuickActionCardProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(to)}
      className="group relative text-left rounded-xl border border-border bg-card p-5 transition-all hover:shadow-soft hover:border-primary/30"
    >
      <div className={`h-10 w-10 rounded-xl ${iconBg} flex items-center justify-center mb-3 transition-transform group-hover:scale-110`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <h3 className="font-semibold text-sm text-foreground mb-0.5">{title}</h3>
      <p className="text-[11px] text-muted-foreground leading-relaxed">{subtitle}</p>
      {count > 0 && (
        <span className="inline-block mt-2 text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
          {count} {countLabel}
        </span>
      )}
      <button
        onClick={(e) => { e.stopPropagation(); navigate(addTo); }}
        className="absolute top-3 right-3 h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center transition-all hover:bg-primary hover:text-primary-foreground"
        aria-label={`Add ${title}`}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </button>
  );
}
