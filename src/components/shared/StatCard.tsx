import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  count: number;
  gradient?: string;
}

export default function StatCard({ icon: Icon, label, count, gradient = "from-primary/20 to-primary/5" }: StatCardProps) {
  return (
    <div className={`rounded-xl border border-border bg-gradient-to-br ${gradient} p-4 flex flex-col gap-1`}>
      <Icon className="h-5 w-5 text-primary mb-1" />
      <span className="text-2xl font-bold tabular-nums">{count}</span>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  );
}
