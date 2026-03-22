import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BuildingCard } from "@/components/buildings/building-card";
import { FilterBar } from "@/components/ui/filter-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { MOCK_BUILDINGS } from "@/data/mock";

// TODO: Replace with server action / DB query filtered by workspace
async function getBuildings() {
  return MOCK_BUILDINGS;
}

export const metadata: Metadata = { title: "Buildings" };

export default async function BuildingsPage() {
  const buildings = await getBuildings();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Buildings</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {buildings.length} building{buildings.length !== 1 ? "s" : ""} in your portfolio
          </p>
        </div>
        {/* PERMISSION: Only ADMIN and PROJECT_MANAGER can add buildings */}
        <Button asChild>
          <Link href="/buildings/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Building
          </Link>
        </Button>
      </div>

      <FilterBar
        filters={[
          { key: "status", label: "Status", options: ["All", "In Progress", "Blocked", "Completed"] },
          { key: "city", label: "City", options: ["All", "Austin", "Houston", "Dallas"] },
        ]}
      />

      {buildings.length === 0 ? (
        <EmptyState
          title="No buildings yet"
          description="Add your first building to start tracking renovation progress."
          action={{ label: "Add Building", href: "/buildings/new" }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {buildings.map((building) => (
            <BuildingCard key={building.id} building={building} />
          ))}
        </div>
      )}
    </div>
  );
}
