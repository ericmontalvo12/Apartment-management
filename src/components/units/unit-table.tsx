import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty-state";
import type { UnitWithStages } from "@/types";
import { computeUnitCompletionPercent, getCurrentStage } from "@/lib/renovation-utils";

interface UnitTableProps {
  buildingId: string;
  units: UnitWithStages[];
}

/** Tabular view of all units in a building — the primary building detail view. */
export function UnitTable({ buildingId, units }: UnitTableProps) {
  if (units.length === 0) {
    return (
      <EmptyState
        title="No units yet"
        description="Add units to this building to start tracking renovation stages."
        action={{ label: "Add Unit", href: `/buildings/${buildingId}/units/new` }}
      />
    );
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Unit</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Current Stage</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Progress</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Beds / Bath</th>
            <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground"></th>
          </tr>
        </thead>
        <tbody>
          {units.map((unit) => {
            const pct = computeUnitCompletionPercent(unit.stages);
            const currentStage = getCurrentStage(unit.stages);

            return (
              <tr key={unit.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium">Unit {unit.unitNumber}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={unit.status} type="unit" />
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {currentStage ? (
                    <span className="flex items-center gap-1.5">
                      {currentStage.name}
                      <StatusBadge status={currentStage.status} type="stage" />
                    </span>
                  ) : (
                    <span className="text-muted-foreground/50">—</span>
                  )}
                </td>
                <td className="px-4 py-3 w-36">
                  <div className="flex items-center gap-2">
                    <Progress value={pct} className="h-1.5 flex-1" />
                    <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {unit.bedrooms ?? "—"} bd / {unit.bathrooms ?? "—"} ba
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/units/${unit.id}`}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    View →
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
