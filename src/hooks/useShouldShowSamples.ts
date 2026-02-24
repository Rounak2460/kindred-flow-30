import { useStats } from "./useStats";

const THRESHOLD = 25;

export function useShouldShowSamples() {
  const { data: stats, isLoading } = useStats();
  // While loading, return true to avoid flash of empty state
  if (isLoading || !stats) return true;
  return stats.totalPosts < THRESHOLD;
}
