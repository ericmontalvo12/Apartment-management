import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createSubcontractor } from "@/actions/subcontractors";
import { SubcontractorForm } from "@/components/forms/subcontractor-form";

export const metadata: Metadata = { title: "New Subcontractor" };

async function createSubAction(formData: any) {
  "use server";
  const fd = new FormData();
  Object.entries(formData).forEach(([k, v]) => fd.append(k, String(v ?? "")));
  return createSubcontractor(fd);
}

export default function NewSubcontractorPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <Link href="/subcontractors" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Subcontractors
      </Link>

      <div>
        <h1 className="text-2xl font-semibold">Add Subcontractor</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Add a new subcontractor to assign to renovation stages.
        </p>
      </div>

      <div className="bg-card border rounded-lg p-6">
        <SubcontractorForm action={createSubAction} />
      </div>
    </div>
  );
}
