import type { Metadata } from "next";
import { FileBarChart2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Reports" };

const REPORT_TYPES = [
  { id: "work-summary", title: "Work Summary by Trade", description: "All open and completed work grouped by trade type.", icon: "🔨" },
  { id: "subcontractor-performance", title: "Subcontractor Performance", description: "Stage completion rates and time-to-complete per sub.", icon: "👷" },
  { id: "building-progress", title: "Building Progress Report", description: "Completion percentage and blockers per building.", icon: "🏢" },
  { id: "daily-activity", title: "Daily Activity Log", description: "All updates logged within a date range.", icon: "📋" },
  { id: "blocked-items", title: "Blocked Items Report", description: "All stages currently marked as BLOCKED with notes.", icon: "🚫" },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Reports</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Generate and export renovation progress reports
        </p>
      </div>

      {/* Report templates */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REPORT_TYPES.map((report) => (
          <div key={report.id} className="bg-card rounded-lg border p-5 flex flex-col gap-3">
            <div className="text-2xl">{report.icon}</div>
            <div>
              <h3 className="font-medium">{report.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
            </div>
            <div className="flex gap-2 mt-auto pt-2">
              <Button variant="outline" size="sm" className="flex-1">
                Preview
              </Button>
              <Button size="sm" variant="secondary">
                <Download className="h-3.5 w-3.5 mr-1" />
                Export
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder for AI summary */}
      <div className="bg-gradient-to-r from-violet-50 to-blue-50 border border-violet-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-2">
          <FileBarChart2 className="h-5 w-5 text-violet-600" />
          <h3 className="font-medium text-violet-900">AI Work Summary</h3>
          <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">Coming Soon</span>
        </div>
        <p className="text-sm text-violet-700">
          Automatically generate natural language work summaries for project owners, lenders, or inspectors.
          Pulls from daily updates and stage status changes to produce a clear progress narrative.
        </p>
      </div>
    </div>
  );
}
