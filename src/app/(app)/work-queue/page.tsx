import type { Metadata } from "next";
import { Layers } from "lucide-react";
import { WorkQueueByTradeList } from "@/components/work-queue/work-queue-by-trade";
import { WorkQueueBySubList } from "@/components/work-queue/work-queue-by-sub";
import { FilterBar } from "@/components/ui/filter-bar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { groupWorkQueueByTrade, groupWorkQueueBySubcontractor } from "@/lib/renovation-utils";
import { MOCK_WORK_QUEUE_ITEMS } from "@/data/mock";

/**
 * Work Queue page — groups open renovation stages by trade or subcontractor.
 *
 * This is a core feature: project managers dispatch work based on this view.
 * Future enhancement: filter by building, date range, export to PDF.
 *
 * TODO: Replace MOCK_WORK_QUEUE_ITEMS with real query:
 *   prisma.unitStage.findMany({ where: { status: { in: ["READY","IN_PROGRESS","BLOCKED"] }, unit: { building: { workspaceId } } }, include: { unit: { include: { building: true } }, template: true, subcontractor: true } })
 */
async function getWorkQueueItems() {
  return MOCK_WORK_QUEUE_ITEMS;
}

export const metadata: Metadata = { title: "Work Queue" };

export default async function WorkQueuePage() {
  const items = await getWorkQueueItems();
  const byTrade = groupWorkQueueByTrade(items);
  const bySub = groupWorkQueueBySubcontractor(items);

  const totalOpen = items.filter(
    (i) => i.status === "READY" || i.status === "IN_PROGRESS" || i.status === "BLOCKED"
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Work Queue</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {totalOpen} open work item{totalOpen !== 1 ? "s" : ""} across all buildings
        </p>
      </div>

      <FilterBar
        filters={[
          {
            key: "building",
            label: "Building",
            options: ["All Buildings", "Oakwood Terrace", "Riverside Commons", "Maple Ridge"],
          },
          {
            key: "status",
            label: "Status",
            options: ["All", "Ready", "In Progress", "Blocked"],
          },
          {
            key: "trade",
            label: "Trade",
            options: ["All Trades", "Plumbing", "Electrical", "Painting", "Drywall", "Cabinets"],
          },
        ]}
      />

      <Tabs defaultValue="by-trade">
        <TabsList>
          <TabsTrigger value="by-trade">
            <Layers className="h-4 w-4 mr-2" />
            By Trade
          </TabsTrigger>
          <TabsTrigger value="by-sub">By Subcontractor</TabsTrigger>
          <TabsTrigger value="by-building">By Building</TabsTrigger>
        </TabsList>

        <TabsContent value="by-trade" className="mt-4">
          <WorkQueueByTradeList groups={byTrade} />
        </TabsContent>

        <TabsContent value="by-sub" className="mt-4">
          <WorkQueueBySubList groups={bySub} />
        </TabsContent>

        <TabsContent value="by-building" className="mt-4">
          <div className="bg-muted/40 rounded-lg border-2 border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground text-sm">
              Building-grouped view — coming soon.
              <br />
              Will show open tasks organized by building → unit → stage.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
