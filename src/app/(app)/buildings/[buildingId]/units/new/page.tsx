import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getBuilding } from "@/lib/queries";
import { createUnit } from "@/actions/units";
import { UnitForm } from "@/components/forms/unit-form";

export const metadata: Metadata = { title: "New Unit" };

interface Props { params: { buildingId: string } }

async function createUnitAction(_buildingId: string, formData: any) {
  "use server";
  const fd = new FormData();
  fd.append("buildingId", _buildingId);
  Object.entries(formData).forEach(([k, v]) => {
    if (v !== undefined && v !== "") fd.append(k, String(v));
  });
  return createUnit(fd);
}

export default async function NewUnitPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  const workspaceId = (session!.user as any).workspaceId as string;
  const building = await getBuilding(params.buildingId, workspaceId);
  if (!building) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <Link
        href={`/buildings/${building.id}`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        {building.name}
      </Link>

      <div>
        <h1 className="text-2xl font-semibold">Add Unit</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Add a new unit to {building.name}. Renovation stages will be automatically created.
        </p>
      </div>

      <div className="bg-card border rounded-lg p-6">
        <UnitForm buildingId={building.id} action={createUnitAction} />
      </div>
    </div>
  );
}
