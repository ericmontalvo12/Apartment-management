import { DailyUpdateFeed } from "./daily-update-feed";
import type { DailyUpdateWithRelations } from "@/types";

interface RecentUpdatesProps {
  updates: DailyUpdateWithRelations[];
}

export function RecentUpdates({ updates }: RecentUpdatesProps) {
  if (updates.length === 0) {
    return (
      <div className="rounded-lg border bg-muted/20 border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">No recent updates.</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Updates will appear here as the team logs daily progress.</p>
      </div>
    );
  }

  return <DailyUpdateFeed updates={updates as any} showUnit />;
}
