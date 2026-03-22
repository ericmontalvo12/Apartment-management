import type { Metadata } from "next";
import { DailyUpdateFeed } from "@/components/updates/daily-update-feed";
import { FilterBar } from "@/components/ui/filter-bar";

// TODO: prisma.dailyUpdate.findMany({ orderBy: { date: "desc" }, include: { author, unit, unitStage, attachments } })
const MOCK_UPDATES = [
  { id: "u1", date: new Date("2024-03-14"), notes: "Painting crew finished living room in Unit 101 — two coats applied.", author: { name: "Jordan Lee", image: null }, stageName: "Painting", unitNumber: "101", buildingName: "Oakwood Terrace", attachments: [] },
  { id: "u2", date: new Date("2024-03-14"), notes: "Inspector flagged main bath grout in Unit 101. Tile crew to redo section near tub.", author: { name: "Jordan Lee", image: null }, stageName: "Tile", unitNumber: "101", buildingName: "Oakwood Terrace", attachments: [] },
  { id: "u3", date: new Date("2024-03-13"), notes: "Rough plumbing complete in Unit 204. Passed pressure test.", author: { name: "Sam Rivera", image: null }, stageName: "Rough Plumbing", unitNumber: "204", buildingName: "Riverside Commons", attachments: [] },
  { id: "u4", date: new Date("2024-03-12"), notes: "Demolition complete in Unit 302. Ready for rough framing.", author: { name: "Jordan Lee", image: null }, stageName: "Demolition", unitNumber: "302", buildingName: "Maple Ridge", attachments: [] },
];

export const metadata: Metadata = { title: "Daily Updates" };

export default function UpdatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Daily Updates</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Activity log across all buildings and units
        </p>
      </div>

      <FilterBar
        filters={[
          { key: "building", label: "Building", options: ["All", "Oakwood Terrace", "Riverside Commons", "Maple Ridge"] },
          { key: "trade", label: "Trade", options: ["All", "Plumbing", "Electrical", "Painting", "Tile"] },
          { key: "author", label: "Author", options: ["All", "Jordan Lee", "Sam Rivera"] },
        ]}
      />

      <DailyUpdateFeed updates={MOCK_UPDATES as any} showUnit />
    </div>
  );
}
