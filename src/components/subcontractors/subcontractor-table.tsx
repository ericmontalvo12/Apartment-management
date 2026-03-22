import type { TradeType } from "@prisma/client";
import { formatTradeName, getTradeColor } from "@/lib/renovation-utils";
import { cn } from "@/lib/utils";
import { Phone, Mail } from "lucide-react";

interface SubRow {
  id: string;
  name: string;
  company: string | null;
  trade: TradeType;
  phone: string | null;
  email: string | null;
  isActive: boolean;
  openJobs: number;
}

interface SubcontractorTableProps {
  subcontractors: SubRow[];
}

export function SubcontractorTable({ subcontractors }: SubcontractorTableProps) {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Name</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Company</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Trade</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Contact</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Open Jobs</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
          </tr>
        </thead>
        <tbody>
          {subcontractors.map((sub) => (
            <tr key={sub.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
              <td className="px-4 py-3 font-medium">{sub.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{sub.company ?? "—"}</td>
              <td className="px-4 py-3">
                <span className={cn("text-xs px-2 py-0.5 rounded font-medium", getTradeColor(sub.trade))}>
                  {formatTradeName(sub.trade)}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col gap-0.5">
                  {sub.phone && (
                    <a href={`tel:${sub.phone}`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                      <Phone className="h-3 w-3" /> {sub.phone}
                    </a>
                  )}
                  {sub.email && (
                    <a href={`mailto:${sub.email}`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                      <Mail className="h-3 w-3" /> {sub.email}
                    </a>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                {sub.openJobs > 0 ? (
                  <span className="text-sm font-medium text-amber-600">{sub.openJobs}</span>
                ) : (
                  <span className="text-muted-foreground/50">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                    sub.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  )}
                >
                  {sub.isActive ? "Active" : "Inactive"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
