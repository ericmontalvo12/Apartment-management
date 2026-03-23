import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getBuilding } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { UnitTable } from "@/components/units/unit-table";
import { BuildingProgressBar } from "@/components/buildings/building-progress-bar";

export const dynamic = "force-dynamic";

interface Props { params: { buildingId: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: "Building" };
}

export default async function BuildingDetailPage({ params }: Props) {
  const workspace = await prisma.workspace.findFirst();
  if (!workspace) notFound();
  const workspaceId = workspace.id;
  const building = await getBuilding(params.buildingId, workspaceId);
  if (!building) notFound();

  const stats = building.stats;

  return (
    <div className="space-y-6">
      <Link href="/buildings" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4 mr-1" />
        All Buildings
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{building.name}</h1>
          <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
            <MapPin className="h-3.5 w-3.5" />
            {building.address}, {building.city}, {building.state} {building.zip}
          </div>
        </div>
        <Button asChild>
          <Link href={`/buildings/${building.id}/units/new`}>
            <Plus className="h-4 w-4 mr-2" />
            Add Unit
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: "Total Units", value: stats.total, color: "text-foreground" },
          { label: "Not Started", value: stats.notStarted, color: "text-muted-foreground" },
          { label: "In Progress", value: stats.inProgress, color: "text-amber-600" },
          { label: "Blocked", value: stats.blocked, color: "text-red-600" },
          { label: "Completed", value: stats.completed, color: "text-green-600" },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-semibold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <BuildingProgressBar stats={stats} />

      <div>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Units — {building._count.units} total
        </h2>
        <UnitTable buildingId={building.id} units={building.units as any} />
      </div>

      {building.notes && (
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-xs font-medium text-muted-foreground mb-1">Building Notes</p>
          <p className="text-sm">{building.notes}</p>
        </div>
      )}
    </div>
  );
}
