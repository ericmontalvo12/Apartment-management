import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Building2, Hammer, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { getDashboardStats } from "@/lib/queries";
import { StatCard } from "@/components/dashboard/stat-card";
import { TradeWorkSummaryCard } from "@/components/dashboard/trade-work-summary-card";
import { RecentUpdates } from "@/components/updates/recent-updates";
import { DashboardChart } from "@/components/dashboard/dashboard-chart";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  const workspaceId = (session.user as any).workspaceId as string;
  const stats = await getDashboardStats(workspaceId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Renovation progress across all buildings
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard title="Buildings" value={stats.totalBuildings} icon={Building2} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatCard title="Total Units" value={stats.totalUnits} icon={Hammer} iconColor="text-slate-600" iconBg="bg-slate-50" />
        <StatCard title="In Progress" value={stats.unitsInProgress} icon={Clock} iconColor="text-amber-600" iconBg="bg-amber-50" />
        <StatCard title="Blocked" value={stats.unitsBlocked} icon={AlertTriangle} iconColor="text-red-600" iconBg="bg-red-50" highlight={stats.unitsBlocked > 0} />
        <StatCard title="Completed" value={stats.unitsCompleted} icon={CheckCircle2} iconColor="text-green-600" iconBg="bg-green-50" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DashboardChart stats={stats} />
        </div>
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Open Work by Trade
          </h2>
          {stats.openStagesByTrade.length === 0 ? (
            <p className="text-sm text-muted-foreground">No open work items.</p>
          ) : (
            stats.openStagesByTrade.map((trade) => (
              <TradeWorkSummaryCard key={trade.trade} summary={trade} />
            ))
          )}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Recent Updates
        </h2>
        <RecentUpdates updates={stats.recentUpdates} />
      </div>
    </div>
  );
}
