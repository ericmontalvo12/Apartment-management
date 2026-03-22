import Link from "next/link";
import type { TradeWorkSummary } from "@/types";
import { getTradeColor } from "@/lib/renovation-utils";

interface TradeWorkSummaryCardProps {
  summary: TradeWorkSummary;
}

export function TradeWorkSummaryCard({ summary }: TradeWorkSummaryCardProps) {
  const total = summary.openCount;
  const inProgress = summary.inProgressCount;
  const blocked = summary.blockedCount;

  return (
    <Link
      href={`/work-queue?trade=${summary.trade}`}
      className="flex items-center gap-3 rounded-lg border bg-card p-3 hover:bg-accent/50 transition-colors group"
    >
      <span
        className={`shrink-0 px-2 py-0.5 rounded text-xs font-medium ${getTradeColor(summary.trade)}`}
      >
        {summary.displayName}
      </span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{total} open</span>
          {inProgress > 0 && <span className="text-amber-600">· {inProgress} active</span>}
          {blocked > 0 && <span className="text-red-600">· {blocked} blocked</span>}
        </div>
      </div>

      <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">→</span>
    </Link>
  );
}
