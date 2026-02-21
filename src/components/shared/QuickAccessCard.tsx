import { useNavigate } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface QuickAccessCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  to: string;
  gradient?: string;
}

export default function QuickAccessCard({ icon: Icon, title, subtitle, to, gradient = "from-primary/10 to-accent/10" }: QuickAccessCardProps) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className={`group text-left rounded-xl border border-border bg-gradient-to-br ${gradient} p-5 transition-all hover:border-primary/50 hover:shadow-glow`}
    >
      <Icon className="h-6 w-6 text-primary mb-3 group-hover:scale-110 transition-transform" />
      <h3 className="font-semibold text-sm mb-0.5">{title}</h3>
      <p className="text-[11px] text-muted-foreground leading-relaxed">{subtitle}</p>
    </button>
  );
}
