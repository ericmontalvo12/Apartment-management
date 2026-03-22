import type { StageStatus, TradeType } from "@prisma/client";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatTradeName, getTradeColor } from "@/lib/renovation-utils";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface StageRow {
  id: string;
  status: StageStatus;
  trade: TradeType;
  template: { name: string; sortOrder: number };
  subcontractor: { name: string } | null;
  dueDate: Date | null;
  notes: string | null;
}

interface StageTableProps {
  stages: StageRow[];
  unitId: string;
}

/** Ordered list of renovation stages for a single unit. */
export function StageTable({ stages, unitId }: StageTableProps) {
  const sorted = [...stages].sort((a, b) => a.template.sortOrder - b.template.sortOrder);

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground w-6">#</th>
            <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Stage</th>
            <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Trade</th>
            <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Status</th>
            <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Subcontractor</th>
            <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Due</th>
            <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Notes</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((stage, idx) => (
            <tr
              key={stage.id}
              className={cn(
                "border-b last:border-0 transition-colors",
                stage.status === "BLOCKED" && "bg-red-50/50",
                stage.status === "IN_PROGRESS" && "bg-amber-50/30",
                stage.status === "DONE" && "opacity-60"
              )}
            >
              <td className="px-4 py-3 text-muted-foreground/50 text-xs">{idx + 1}</td>
              <td className="px-4 py-3 font-medium">{stage.template.name}</td>
              <td className="px-4 py-3">
                <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium", getTradeColor(stage.trade))}>
                  {formatTradeName(stage.trade)}
                </span>
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={stage.status} type="stage" />
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {stage.subcontractor?.name ?? (
                  <span className="text-muted-foreground/40 italic text-xs">Unassigned</span>
                )}
              </td>
              <td className="px-4 py-3 text-muted-foreground text-xs">
                {stage.dueDate ? formatDate(stage.dueDate) : "—"}
              </td>
              <td className="px-4 py-3 text-muted-foreground text-xs max-w-xs truncate">
                {stage.notes ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
