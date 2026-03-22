import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  highlight?: boolean;
  trend?: {
    value: number;
    label: string;
    positive: boolean;
  };
}

export function StatCard({ title, value, icon: Icon, iconColor, iconBg, highlight, trend }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-4 flex flex-col gap-3",
        highlight && value > 0 && "border-red-200 bg-red-50/50"
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{title}</p>
        <div className={cn("h-7 w-7 rounded-md flex items-center justify-center", iconBg)}>
          <Icon className={cn("h-4 w-4", iconColor)} />
        </div>
      </div>

      <div>
        <p className="text-2xl font-semibold">{value}</p>
        {trend && (
          <p className="flex items-center gap-1 text-xs mt-1 text-muted-foreground">
            {trend.positive ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
            <span className={trend.positive ? "text-green-600" : "text-red-600"}>+{trend.value}</span>
            {trend.label}
          </p>
        )}
      </div>
    </div>
  );
}
