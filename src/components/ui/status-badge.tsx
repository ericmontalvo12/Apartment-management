import { cn } from "@/lib/utils";
import { getStageStatusConfig, getUnitStatusConfig } from "@/lib/renovation-utils";
import type { StageStatus, UnitStatus } from "@prisma/client";

interface StageStatusBadgeProps {
  status: StageStatus;
  type: "stage";
  className?: string;
}

interface UnitStatusBadgeProps {
  status: UnitStatus;
  type: "unit";
  className?: string;
}

type StatusBadgeProps = StageStatusBadgeProps | UnitStatusBadgeProps;

/**
 * Unified status badge for both unit-level and stage-level statuses.
 * Shows a colored dot + label.
 */
export function StatusBadge({ status, type, className }: StatusBadgeProps) {
  const config =
    type === "stage"
      ? getStageStatusConfig(status as StageStatus)
      : getUnitStatusConfig(status as UnitStatus);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.color,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dotColor)} />
      {config.label}
    </span>
  );
}
