import { Progress } from "@/components/ui/progress";

interface RatingBarProps {
  label: string;
  value: number;
  max?: number;
}

export default function RatingBar({ label, value, max = 5 }: RatingBarProps) {
  const pct = (value / max) * 100;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-24 shrink-0">{label}</span>
      <Progress value={pct} className="h-2 flex-1" />
      <span className="text-xs font-semibold tabular-nums w-8 text-right">{value.toFixed(1)}</span>
    </div>
  );
}
