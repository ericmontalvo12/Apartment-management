import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getBuildings } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { BuildingCard } from "@/components/buildings/building-card";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Buildings" };
export const dynamic = "force-dynamic";

export default async function BuildingsPage() {
  const workspace = await prisma.workspace.findFirst();
  if (!workspace) notFound();
  const workspaceId = workspace.id;
  const buildings = await getBuildings(workspaceId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Buildings</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {buildings.length} building{buildings.length !== 1 ? "s" : ""} in your portfolio
          </p>
        </div>
        <Button asChild>
          <Link href="/buildings/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Building
          </Link>
        </Button>
      </div>

      {buildings.length === 0 ? (
        <EmptyState
          title="No buildings yet"
          description="Add your first building to start tracking renovation progress."
          action={{ label: "Add Building", href: "/buildings/new" }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {buildings.map((building) => (
            <BuildingCard key={building.id} building={building as any} />
          ))}
        </div>
      )}
    </div>
  );
}
