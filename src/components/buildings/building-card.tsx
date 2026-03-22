import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import type { BuildingWithStats } from "@/types";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface BuildingCardProps {
  building: BuildingWithStats;
}

export function BuildingCard({ building: b }: BuildingCardProps) {
  const { stats } = b;

  return (
    <Link
      href={`/buildings/${b.id}`}
      className="group flex flex-col rounded-lg border bg-card p-5 hover:shadow-md hover:border-primary/20 transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
            {b.name}
          </h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            <MapPin className="h-3 w-3" />
            {b.city}, {b.state}
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors mt-0.5" />
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>{stats.completionPercent}% complete</span>
          <span>{stats.completed} / {stats.total} units</span>
        </div>
        <Progress value={stats.completionPercent} className="h-1.5" />
      </div>

      {/* Status pills */}
      <div className="flex flex-wrap gap-1.5 mt-auto">
        {stats.inProgress > 0 && (
          <Pill label={`${stats.inProgress} in progress`} color="bg-amber-100 text-amber-700" />
        )}
        {stats.blocked > 0 && (
          <Pill label={`${stats.blocked} blocked`} color="bg-red-100 text-red-700" />
        )}
        {stats.notStarted > 0 && (
          <Pill label={`${stats.notStarted} not started`} color="bg-gray-100 text-gray-600" />
        )}
        {stats.completed > 0 && (
          <Pill label={`${stats.completed} done`} color="bg-green-100 text-green-700" />
        )}
      </div>
    </Link>
  );
}

function Pill({ label, color }: { label: string; color: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium", color)}>
      {label}
    </span>
  );
}
