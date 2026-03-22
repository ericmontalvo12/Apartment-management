"use client";

import { useState } from "react";
import { Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRelativeDate } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";

interface UpdateItem {
  id: string;
  date: Date;
  notes: string;
  author: { name: string | null; image: string | null };
  stageName?: string;
  unitNumber?: string;
  buildingName?: string;
  attachments: { id: string; url: string }[];
}

interface DailyUpdateFeedProps {
  updates: UpdateItem[];
  unitId?: string;
  showUnit?: boolean;
}

export function DailyUpdateFeed({ updates, unitId, showUnit = false }: DailyUpdateFeedProps) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? updates : updates.slice(0, 5);

  return (
    <div className="space-y-3">
      {/* Add update button */}
      {unitId && (
        <Button variant="outline" size="sm" className="w-full">
          <Plus className="h-3.5 w-3.5 mr-2" />
          Log Update
          {/* TODO: Open DailyUpdateForm dialog/sheet */}
        </Button>
      )}

      {updates.length === 0 ? (
        <EmptyState
          title="No updates yet"
          description="Log the first daily update for this unit."
        />
      ) : (
        <div className="space-y-3">
          {visible.map((update) => (
            <div key={update.id} className="flex gap-3">
              {/* Avatar */}
              <div className="shrink-0 h-7 w-7 rounded-full bg-muted border flex items-center justify-center mt-0.5">
                {update.author.image ? (
                  <img src={update.author.image} alt="" className="h-7 w-7 rounded-full object-cover" />
                ) : (
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 rounded-lg border bg-card p-3 text-sm">
                <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{update.author.name ?? "Unknown"}</span>
                    {update.stageName && (
                      <>
                        <span>·</span>
                        <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{update.stageName}</span>
                      </>
                    )}
                    {showUnit && update.unitNumber && (
                      <>
                        <span>·</span>
                        <span>Unit {update.unitNumber}</span>
                        {update.buildingName && <span>— {update.buildingName}</span>}
                      </>
                    )}
                  </div>
                  <time className="text-xs text-muted-foreground">{formatRelativeDate(update.date)}</time>
                </div>

                <p className="text-foreground leading-relaxed">{update.notes}</p>

                {update.attachments.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {update.attachments.map((att) => (
                      <div key={att.id} className="h-12 w-12 rounded bg-muted" />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {updates.length > 5 && !expanded && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground"
              onClick={() => setExpanded(true)}
            >
              Show {updates.length - 5} more updates
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
