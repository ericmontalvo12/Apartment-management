import type { BuildingStats } from "@/types";
import { Progress } from "@/components/ui/progress";

interface BuildingProgressBarProps {
  stats: BuildingStats;
}

export function BuildingProgressBar({ stats }: BuildingProgressBarProps) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Overall Progress</h3>
        <span className="text-sm font-semibold">{stats.completionPercent}%</span>
      </div>
      <Progress value={stats.completionPercent} className="h-2" />
      <p className="text-xs text-muted-foreground mt-2">
        {stats.completed} of {stats.total} units completed
      </p>
    </div>
  );
}
