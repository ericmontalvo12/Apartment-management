import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BedDouble, Bath, Maximize2 } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { StageTable } from "@/components/units/stage-table";
import { UnitProgressBar } from "@/components/units/unit-progress-bar";
import { DailyUpdateFeed } from "@/components/updates/daily-update-feed";
import { PhotoUploadPlaceholder } from "@/components/units/photo-upload-placeholder";
import { computeUnitCompletionPercent } from "@/lib/renovation-utils";

// Mock unit data — replace with prisma.unit.findUnique(...)
const MOCK_UNIT = {
  id: "unit_demo_1",
  buildingId: "bld_1",
  unitNumber: "101",
  floor: 1,
  bedrooms: 2,
  bathrooms: 1,
  sqft: 850,
  status: "IN_PROGRESS" as const,
  targetDate: new Date("2024-04-15"),
  notes: "Main bath needs tile rework — inspector flagged grout lines.",
  building: { id: "bld_1", name: "Oakwood Terrace" },
  stages: [
    { id: "s1", status: "DONE" as const, trade: "DEMOLITION" as const, template: { name: "Demolition", sortOrder: 1 }, subcontractor: null, dueDate: null, notes: "Complete" },
    { id: "s2", status: "DONE" as const, trade: "PLUMBING" as const, template: { name: "Rough Plumbing", sortOrder: 2 }, subcontractor: { name: "Torres Plumbing Co." }, dueDate: null, notes: null },
    { id: "s3", status: "DONE" as const, trade: "ROUGH_ELECTRICAL" as const, template: { name: "Rough Electrical", sortOrder: 3 }, subcontractor: { name: "Vega Electric" }, dueDate: null, notes: null },
    { id: "s4", status: "DONE" as const, trade: "DRYWALL" as const, template: { name: "Drywall", sortOrder: 4 }, subcontractor: null, dueDate: null, notes: null },
    { id: "s5", status: "IN_PROGRESS" as const, trade: "PAINTING" as const, template: { name: "Painting", sortOrder: 5 }, subcontractor: { name: "Reyes Painting" }, dueDate: new Date("2024-03-25"), notes: "Two coats on living room, bedrooms remain" },
    { id: "s6", status: "BLOCKED" as const, trade: "TILE" as const, template: { name: "Tile", sortOrder: 6 }, subcontractor: null, dueDate: null, notes: "Inspector flagged grout — needs redo in main bath" },
    { id: "s7", status: "NOT_STARTED" as const, trade: "CABINETS" as const, template: { name: "Cabinets", sortOrder: 7 }, subcontractor: null, dueDate: null, notes: null },
    { id: "s8", status: "NOT_STARTED" as const, trade: "BASEBOARDS_TRIM" as const, template: { name: "Baseboards & Trim", sortOrder: 8 }, subcontractor: null, dueDate: null, notes: null },
    { id: "s9", status: "NOT_STARTED" as const, trade: "FINAL_PUNCH" as const, template: { name: "Final Punch", sortOrder: 9 }, subcontractor: null, dueDate: null, notes: null },
  ],
  dailyUpdates: [
    {
      id: "du1",
      date: new Date("2024-03-14"),
      notes: "Painting crew finished living room — two coats applied. Bedrooms to begin tomorrow.",
      author: { name: "Jordan Lee", image: null },
      stageName: "Painting",
      attachments: [],
    },
    {
      id: "du2",
      date: new Date("2024-03-13"),
      notes: "Inspector flagged main bath grout — subpar application. Tile crew needs to redo section near tub.",
      author: { name: "Jordan Lee", image: null },
      stageName: "Tile",
      attachments: [],
    },
    {
      id: "du3",
      date: new Date("2024-03-11"),
      notes: "Drywall complete in all rooms. Texture applied. Passed quality check.",
      author: { name: "Sam Rivera", image: null },
      stageName: "Drywall",
      attachments: [],
    },
  ],
};

export const metadata: Metadata = { title: "Unit Detail" };

export default async function UnitDetailPage({
  params,
}: {
  params: { unitId: string };
}) {
  // TODO: const unit = await prisma.unit.findUnique({ where: { id: params.unitId }, include: { stages: ..., building: true, dailyUpdates: ... } });
  const unit = MOCK_UNIT;
  const completionPercent = computeUnitCompletionPercent(unit.stages);

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <Link
        href={`/buildings/${unit.buildingId}`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        {unit.building.name}
      </Link>

      {/* Unit header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">Unit {unit.unitNumber}</h1>
            <StatusBadge status={unit.status} type="unit" />
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
            {unit.bedrooms && (
              <span className="flex items-center gap-1">
                <BedDouble className="h-3.5 w-3.5" />
                {unit.bedrooms} bd
              </span>
            )}
            {unit.bathrooms && (
              <span className="flex items-center gap-1">
                <Bath className="h-3.5 w-3.5" />
                {unit.bathrooms} ba
              </span>
            )}
            {unit.sqft && (
              <span className="flex items-center gap-1">
                <Maximize2 className="h-3.5 w-3.5" />
                {unit.sqft.toLocaleString()} sqft
              </span>
            )}
            {unit.targetDate && (
              <span className="text-muted-foreground">
                Target:{" "}
                {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
                  unit.targetDate
                )}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Progress */}
      <UnitProgressBar percent={completionPercent} stageCount={unit.stages.length} />

      {/* Stages */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Renovation Stages
        </h2>
        <StageTable stages={unit.stages} unitId={unit.id} />
      </div>

      {/* Unit notes */}
      {unit.notes && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-xs font-medium text-amber-700 mb-1">Unit Notes</p>
          <p className="text-sm text-amber-900">{unit.notes}</p>
        </div>
      )}

      {/* Daily updates + Photo upload */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Daily Updates
          </h2>
          <DailyUpdateFeed updates={unit.dailyUpdates} unitId={unit.id} />
        </div>
        <div>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Photos
          </h2>
          <PhotoUploadPlaceholder unitId={unit.id} />
        </div>
      </div>
    </div>
  );
}
