import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDailyUpdates } from "@/lib/queries";
import { DailyUpdateFeed } from "@/components/updates/daily-update-feed";

export const metadata: Metadata = { title: "Daily Updates" };

export default async function UpdatesPage() {
  const session = await getServerSession(authOptions);
  const workspaceId = (session!.user as any).workspaceId as string;
  const updates = await getDailyUpdates(workspaceId);

  const feedUpdates = updates.map((u) => ({
    id: u.id,
    date: u.date,
    notes: u.notes,
    author: u.author,
    stageName: u.unitStage?.template?.name ?? null,
    unitNumber: (u.unit as any).unitNumber,
    buildingName: (u.unit as any).building?.name ?? null,
    attachments: u.attachments,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Daily Updates</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Activity log across all buildings and units
        </p>
      </div>

      <DailyUpdateFeed updates={feedUpdates as any} showUnit />
    </div>
  );
}
