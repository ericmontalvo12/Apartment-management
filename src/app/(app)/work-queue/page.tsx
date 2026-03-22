import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { Layers } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { getWorkQueueItems } from "@/lib/queries";
import { WorkQueueByTradeList } from "@/components/work-queue/work-queue-by-trade";
import { WorkQueueBySubList } from "@/components/work-queue/work-queue-by-sub";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { groupWorkQueueByTrade, groupWorkQueueBySubcontractor } from "@/lib/renovation-utils";

export const metadata: Metadata = { title: "Work Queue" };

export default async function WorkQueuePage() {
  const session = await getServerSession(authOptions);
  const workspaceId = (session!.user as any).workspaceId as string;
  const items = await getWorkQueueItems(workspaceId);
  const byTrade = groupWorkQueueByTrade(items);
  const bySub = groupWorkQueueBySubcontractor(items);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Work Queue</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {items.length} open work item{items.length !== 1 ? "s" : ""} across all buildings
        </p>
      </div>

      <Tabs defaultValue="by-trade">
        <TabsList>
          <TabsTrigger value="by-trade">
            <Layers className="h-4 w-4 mr-2" />
            By Trade
          </TabsTrigger>
          <TabsTrigger value="by-sub">By Subcontractor</TabsTrigger>
        </TabsList>

        <TabsContent value="by-trade" className="mt-4">
          <WorkQueueByTradeList groups={byTrade} />
        </TabsContent>

        <TabsContent value="by-sub" className="mt-4">
          <WorkQueueBySubList groups={bySub} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
