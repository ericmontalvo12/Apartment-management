import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface UnitProgressBarProps {
  percent: number;
  stageCount: number;
}

export function UnitProgressBar({ percent, stageCount }: UnitProgressBarProps) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Renovation Progress</h3>
        <span
          className={cn(
            "text-sm font-semibold",
            percent === 100 ? "text-green-600" : percent > 50 ? "text-amber-600" : "text-foreground"
          )}
        >
          {percent}%
        </span>
      </div>
      <Progress
        value={percent}
        className={cn(
          "h-2",
          percent === 100 && "[&>div]:bg-green-500",
          percent > 0 && percent < 100 && "[&>div]:bg-amber-500"
        )}
      />
      <p className="text-xs text-muted-foreground mt-2">
        {Math.round((percent / 100) * stageCount)} of {stageCount} stages complete
      </p>
    </div>
  );
}
