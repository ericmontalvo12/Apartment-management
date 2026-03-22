import type { WorkQueueBySubcontractor } from "@/types";
import { StatusBadge } from "@/components/ui/status-badge";
import { getTradeColor, formatTradeName } from "@/lib/renovation-utils";
import { cn } from "@/lib/utils";

interface WorkQueueBySubListProps {
  groups: WorkQueueBySubcontractor[];
}

export function WorkQueueBySubList({ groups }: WorkQueueBySubListProps) {
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
        <div key={group.subcontractorId} className="rounded-lg border bg-card overflow-hidden">
          {/* Subcontractor header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-muted/40 border-b">
            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
              {group.subcontractorName.charAt(0)}
            </div>
            <div>
              <span className="text-sm font-medium">{group.subcontractorName}</span>
              <span className={cn("ml-2 text-xs font-medium px-1.5 py-0.5 rounded", getTradeColor(group.trade))}>
                {formatTradeName(group.trade)}
              </span>
            </div>
            <span className="ml-auto text-sm text-muted-foreground">
              {group.count} item{group.count !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Items */}
          <ul className="divide-y">
            {group.items.map((item) => (
              <li
                key={item.unitStageId}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 hover:bg-muted/20 transition-colors",
                  item.status === "BLOCKED" && "bg-red-50/40"
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {item.buildingName} → Unit {item.unitNumber} → {item.stageName}
                  </p>
                  {item.notes && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{item.notes}</p>
                  )}
                </div>
                <StatusBadge status={item.status} type="stage" />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
