import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubcontractorTable } from "@/components/subcontractors/subcontractor-table";
import { FilterBar } from "@/components/ui/filter-bar";

// Mock data — replace with prisma.subcontractor.findMany({ where: { workspaceId } })
const MOCK_SUBS = [
  { id: "sub_1", name: "Mike Torres", company: "Torres Plumbing Co.", trade: "PLUMBING" as const, phone: "(512) 555-0121", email: "mike@torresplumbing.com", isActive: true, openJobs: 3 },
  { id: "sub_2", name: "Ana Reyes", company: "Reyes Painting", trade: "PAINTING" as const, phone: "(512) 555-0188", email: "ana@reyespainting.com", isActive: true, openJobs: 5 },
  { id: "sub_3", name: "Carlos Vega", company: "Vega Electric", trade: "ROUGH_ELECTRICAL" as const, phone: "(512) 555-0144", email: "carlos@vegaelectric.com", isActive: true, openJobs: 2 },
  { id: "sub_4", name: "Linda Chen", company: "Chen Flooring", trade: "FLOORING" as const, phone: "(512) 555-0199", email: "linda@chenflooring.com", isActive: true, openJobs: 1 },
  { id: "sub_5", name: "Dave Okafor", company: "Okafor Drywall", trade: "DRYWALL" as const, phone: "(512) 555-0177", email: "dave@okafordrywall.com", isActive: false, openJobs: 0 },
];

export const metadata: Metadata = { title: "Subcontractors" };

export default function SubcontractorsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Subcontractors</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {MOCK_SUBS.filter((s) => s.isActive).length} active subcontractors
          </p>
        </div>
        {/* PERMISSION: Only ADMIN can add/edit subcontractors */}
        <Button asChild>
          <Link href="/subcontractors/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Subcontractor
          </Link>
        </Button>
      </div>

      <FilterBar
        filters={[
          { key: "trade", label: "Trade", options: ["All Trades", "Plumbing", "Painting", "Electrical", "Flooring", "Drywall"] },
          { key: "status", label: "Status", options: ["All", "Active", "Inactive"] },
        ]}
      />

      <SubcontractorTable subcontractors={MOCK_SUBS as any} />
    </div>
  );
}
