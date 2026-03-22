import type { Metadata } from "next";
import { Building2, Hammer, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { TradeWorkSummaryCard } from "@/components/dashboard/trade-work-summary-card";
import { RecentUpdates } from "@/components/updates/recent-updates";
import { DashboardChart } from "@/components/dashboard/dashboard-chart";
import { MOCK_DASHBOARD_STATS } from "@/data/mock";

// TODO: Replace with real DB query
async function getDashboardStats() {
  // const session = await getServerSession(authOptions);
  // const stats = await prisma.building.findMany({ where: { workspaceId: session.user.workspaceId } ... });
  return MOCK_DASHBOARD_STATS;
}

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Renovation progress across all buildings
        </p>
      </div>

      {/* KPI stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          title="Buildings"
          value={stats.totalBuildings}
          icon={Building2}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Total Units"
          value={stats.totalUnits}
          icon={Hammer}
          iconColor="text-slate-600"
          iconBg="bg-slate-50"
        />
        <StatCard
          title="In Progress"
          value={stats.unitsInProgress}
          icon={Clock}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
          trend={{ value: 3, label: "vs last week", positive: true }}
        />
        <StatCard
          title="Blocked"
          value={stats.unitsBlocked}
          icon={AlertTriangle}
          iconColor="text-red-600"
          iconBg="bg-red-50"
          highlight={stats.unitsBlocked > 0}
        />
        <StatCard
          title="Completed"
          value={stats.unitsCompleted}
          icon={CheckCircle2}
          iconColor="text-green-600"
          iconBg="bg-green-50"
          trend={{ value: 4, label: "this month", positive: true }}
        />
      </div>

      {/* Charts + trade summary */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DashboardChart stats={stats} />
        </div>
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Open Work by Trade
          </h2>
          {stats.openStagesByTrade.map((trade) => (
            <TradeWorkSummaryCard key={trade.trade} summary={trade} />
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Recent Updates
        </h2>
        <RecentUpdates updates={stats.recentUpdates} />
      </div>
    </div>
  );
}
