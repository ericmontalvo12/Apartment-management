import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BedDouble, Bath, Maximize2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getUnit, getSubcontractors } from "@/lib/queries";
import { StatusBadge } from "@/components/ui/status-badge";
import { StageTable } from "@/components/units/stage-table";
import { UnitProgressBar } from "@/components/units/unit-progress-bar";
import { DailyUpdateFeed } from "@/components/updates/daily-update-feed";
import { PhotoUploadPlaceholder } from "@/components/units/photo-upload-placeholder";
import { computeUnitCompletionPercent } from "@/lib/renovation-utils";

export const metadata: Metadata = { title: "Unit Detail" };

export default async function UnitDetailPage({ params }: { params: { unitId: string } }) {
  const workspace = await prisma.workspace.findFirst();
  const workspaceId = workspace!.id;

  const [unit, allSubs] = await Promise.all([
    getUnit(params.unitId),
    getSubcontractors(workspaceId),
  ]);

  if (!unit) notFound();

  const completionPercent = computeUnitCompletionPercent(unit.stages as any);

  const feedUpdates = unit.dailyUpdates.map((u) => ({
    id: u.id,
    date: u.date,
    notes: u.notes,
    author: u.author,
    stageName: (u as any).unitStage?.template?.name ?? null,
    attachments: u.attachments,
  }));

  const stagesForForm = unit.stages.map((s) => ({
    id: s.id,
    template: { name: s.template.name },
  }));

  return (
    <div className="space-y-6">
      <Link
        href={`/buildings/${unit.buildingId}`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        {unit.building.name}
      </Link>

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
                {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(unit.targetDate)}
              </span>
            )}
          </div>
        </div>
      </div>

      <UnitProgressBar percent={completionPercent} stageCount={unit.stages.length} />

      <div>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Renovation Stages
        </h2>
        <StageTable stages={unit.stages as any} unitId={unit.id} availableSubs={allSubs as any} />
      </div>

      {unit.notes && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-xs font-medium text-amber-700 mb-1">Unit Notes</p>
          <p className="text-sm text-amber-900">{unit.notes}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Daily Updates
          </h2>
          <DailyUpdateFeed updates={feedUpdates as any} unitId={unit.id} stages={stagesForForm} />
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
