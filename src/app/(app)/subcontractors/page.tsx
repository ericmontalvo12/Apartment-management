import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSubcontractors } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { SubcontractorTable } from "@/components/subcontractors/subcontractor-table";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Subcontractors" };

export default async function SubcontractorsPage() {
  const workspace = await prisma.workspace.findFirst();
  const workspaceId = workspace!.id;
  const subcontractors = await getSubcontractors(workspaceId);
  const activeCount = subcontractors.filter((s) => s.isActive).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Subcontractors</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {activeCount} active subcontractor{activeCount !== 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild>
          <Link href="/subcontractors/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Subcontractor
          </Link>
        </Button>
      </div>

      {subcontractors.length === 0 ? (
        <EmptyState
          title="No subcontractors yet"
          description="Add subcontractors to assign them to renovation stages."
          action={{ label: "Add Subcontractor", href: "/subcontractors/new" }}
        />
      ) : (
        <SubcontractorTable subcontractors={subcontractors as any} />
      )}
    </div>
  );
}
