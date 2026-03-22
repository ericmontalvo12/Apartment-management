import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createBuilding } from "@/actions/buildings";
import { BuildingForm } from "@/components/forms/building-form";

export const metadata: Metadata = { title: "New Building" };

export default function NewBuildingPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <Link href="/buildings" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4 mr-1" />
        All Buildings
      </Link>

      <div>
        <h1 className="text-2xl font-semibold">Add Building</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Add a new building to your portfolio.
        </p>
      </div>

      <div className="bg-card border rounded-lg p-6">
        <BuildingForm action={createBuilding as any} />
      </div>
    </div>
  );
}
