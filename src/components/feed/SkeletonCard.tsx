export default function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-xl p-4 mb-3 animate-pulse">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-3 w-16 rounded-full bg-muted" />
        <div className="h-3 w-24 rounded-full bg-muted" />
      </div>
      <div className="h-5 w-3/4 rounded-md bg-muted mb-3" />
      <div className="space-y-2 mb-4">
        <div className="h-3 w-full rounded-md bg-muted" />
        <div className="h-3 w-5/6 rounded-md bg-muted" />
      </div>
      <div className="flex items-center gap-3">
        <div className="h-7 w-20 rounded-full bg-muted" />
        <div className="h-7 w-16 rounded-full bg-muted" />
        <div className="h-7 w-14 rounded-full bg-muted" />
      </div>
    </div>
  );
}
