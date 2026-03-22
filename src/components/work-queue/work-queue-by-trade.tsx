import type { WorkQueueByTrade } from "@/types";
import { StatusBadge } from "@/components/ui/status-badge";
import { getTradeColor, formatTradeName } from "@/lib/renovation-utils";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

interface WorkQueueByTradeListProps {
  groups: WorkQueueByTrade[];
}

export function WorkQueueByTradeList({ groups }: WorkQueueByTradeListProps) {
  if (groups.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-border p-10 text-center">
        <p className="text-muted-foreground text-sm">No open work items.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.trade} className="rounded-lg border bg-card overflow-hidden">
          {/* Trade header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-muted/40 border-b">
            <span className={cn("text-xs font-semibold px-2 py-0.5 rounded", getTradeColor(group.trade))}>
              {group.displayName}
            </span>
            <span className="text-sm font-medium">{group.count} open item{group.count !== 1 ? "s" : ""}</span>
            {group.items.some((i) => i.status === "BLOCKED") && (
              <AlertTriangle className="h-3.5 w-3.5 text-red-500 ml-auto" />
            )}
          </div>

          {/* Items */}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Building</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Unit</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Stage</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Subcontractor</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Due</th>
              </tr>
            </thead>
            <tbody>
              {group.items.map((item) => (
                <tr
                  key={item.unitStageId}
                  className={cn(
                    "border-b last:border-0 hover:bg-muted/20 transition-colors",
                    item.status === "BLOCKED" && "bg-red-50/40"
                  )}
                >
                  <td className="px-4 py-2.5 text-muted-foreground">{item.buildingName}</td>
                  <td className="px-4 py-2.5 font-medium">Unit {item.unitNumber}</td>
                  <td className="px-4 py-2.5">{item.stageName}</td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={item.status} type="stage" />
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground text-xs">
                    {item.subcontractor ? (
                      <span>
                        {item.subcontractor.name}
                        {item.subcontractor.company && (
                          <span className="opacity-60"> · {item.subcontractor.company}</span>
                        )}
                      </span>
                    ) : (
                      <span className="italic text-muted-foreground/40">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">
                    {item.dueDate ? formatDate(item.dueDate) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
