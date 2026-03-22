import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UnitTable } from "@/components/units/unit-table";
import { BuildingProgressBar } from "@/components/buildings/building-progress-bar";
import { FilterBar } from "@/components/ui/filter-bar";
import { MOCK_BUILDINGS } from "@/data/mock";

// TODO: Replace with real DB query
async function getBuilding(id: string) {
  const building = MOCK_BUILDINGS.find((b) => b.id === id);
  if (!building) return null;

  // In production: query prisma.building.findUnique({ where: { id }, include: { units: { include: { stages: ... } } } })
  return building;
}

interface Props {
  params: { buildingId: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const building = await getBuilding(params.buildingId);
  return { title: building?.name ?? "Building" };
}

export default async function BuildingDetailPage({ params }: Props) {
  const building = await getBuilding(params.buildingId);

  // Demo fallback: show first building if ID not found in mock data
  const b = building ?? MOCK_BUILDINGS[0];
  if (!building && !b) notFound();

  const stats = b.stats;

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <Link
        href="/buildings"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        All Buildings
      </Link>

      {/* Building header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{b.name}</h1>
          <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
            <MapPin className="h-3.5 w-3.5" />
            {b.address}, {b.city}, {b.state} {b.zip}
          </div>
        </div>
        {/* PERMISSION: Only PROJECT_MANAGER and ADMIN can add units */}
        <Button asChild>
          <Link href={`/buildings/${b.id}/units/new`}>
            <Plus className="h-4 w-4 mr-2" />
            Add Unit
          </Link>
        </Button>
      </div>

      {/* Stats row */}
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

      {/* Overall progress */}
      <BuildingProgressBar stats={stats} />

      {/* Filters */}
      <FilterBar
        filters={[
          {
            key: "status",
            label: "Status",
            options: ["All", "Not Started", "In Progress", "Blocked", "Completed", "On Hold"],
          },
          {
            key: "trade",
            label: "Current Trade",
            options: ["All", "Demolition", "Plumbing", "Electrical", "Drywall", "Painting", "Cabinets"],
          },
        ]}
      />

      {/* Units table */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Units — {b._count.units} total
        </h2>
        <UnitTable buildingId={b.id} units={b.units} />
      </div>

      {b.notes && (
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-xs font-medium text-muted-foreground mb-1">Building Notes</p>
          <p className="text-sm">{b.notes}</p>
        </div>
      )}
    </div>
  );
}
