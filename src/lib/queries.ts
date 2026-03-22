import { prisma } from "@/lib/prisma";
import type { DashboardStats, WorkQueueItem } from "@/types";
import { groupWorkQueueByTrade, groupWorkQueueBySubcontractor } from "@/lib/renovation-utils";

// ─── Dashboard ────────────────────────────────────────────────────────────────

export async function getDashboardStats(workspaceId: string): Promise<DashboardStats> {
  const [buildings, unitCounts, openStages, recentUpdates] = await Promise.all([
    prisma.building.count({ where: { workspaceId, isActive: true } }),

    prisma.unit.groupBy({
      by: ["status"],
      where: { building: { workspaceId } },
      _count: { status: true },
    }),

    prisma.unitStage.findMany({
      where: {
        status: { in: ["READY", "IN_PROGRESS", "BLOCKED"] },
        unit: { building: { workspaceId } },
      },
      select: { trade: true, status: true },
    }),

    prisma.dailyUpdate.findMany({
      where: { unit: { building: { workspaceId } } },
      orderBy: { date: "desc" },
      take: 5,
      include: {
        author: { select: { id: true, name: true, image: true } },
        attachments: true,
        unitStage: { include: { template: true } },
        unit: { select: { id: true, unitNumber: true } },
      },
    }),
  ]);

  const countByStatus = Object.fromEntries(
    unitCounts.map((r) => [r.status, r._count.status])
  );

  // Aggregate open stages by trade
  const tradeMap = new Map<string, { openCount: number; inProgressCount: number; blockedCount: number }>();
  for (const stage of openStages) {
    const existing = tradeMap.get(stage.trade) ?? { openCount: 0, inProgressCount: 0, blockedCount: 0 };
    existing.openCount++;
    if (stage.status === "IN_PROGRESS") existing.inProgressCount++;
    if (stage.status === "BLOCKED") existing.blockedCount++;
    tradeMap.set(stage.trade, existing);
  }

  const { formatTradeName } = await import("@/lib/renovation-utils");

  const openStagesByTrade = Array.from(tradeMap.entries()).map(([trade, counts]) => ({
    trade: trade as any,
    displayName: formatTradeName(trade as any),
    ...counts,
  }));

  return {
    totalBuildings: buildings,
    totalUnits: unitCounts.reduce((sum, r) => sum + r._count.status, 0),
    unitsNotStarted: countByStatus["NOT_STARTED"] ?? 0,
    unitsInProgress: countByStatus["IN_PROGRESS"] ?? 0,
    unitsBlocked: countByStatus["BLOCKED"] ?? 0,
    unitsCompleted: countByStatus["COMPLETED"] ?? 0,
    openStagesByTrade,
    recentUpdates: recentUpdates as any,
  };
}

// ─── Buildings ────────────────────────────────────────────────────────────────

export async function getBuildings(workspaceId: string) {
  const buildings = await prisma.building.findMany({
    where: { workspaceId, isActive: true },
    include: {
      units: {
        include: {
          stages: {
            include: { template: true, subcontractor: true },
          },
        },
      },
      _count: { select: { units: true } },
    },
    orderBy: { name: "asc" },
  });

  return buildings.map((b) => {
    const stats = computeBuildingStats(b.units);
    return { ...b, stats };
  });
}

export async function getBuilding(id: string, workspaceId: string) {
  const building = await prisma.building.findFirst({
    where: { id, workspaceId },
    include: {
      units: {
        include: {
          stages: {
            include: { template: true, subcontractor: true },
            orderBy: { template: { sortOrder: "asc" } },
          },
        },
        orderBy: { unitNumber: "asc" },
      },
      _count: { select: { units: true } },
    },
  });

  if (!building) return null;

  const stats = computeBuildingStats(building.units);
  return { ...building, stats };
}

function computeBuildingStats(units: { status: string }[]) {
  const counts = { total: units.length, notStarted: 0, inProgress: 0, blocked: 0, completed: 0, onHold: 0 };
  for (const u of units) {
    if (u.status === "NOT_STARTED") counts.notStarted++;
    else if (u.status === "IN_PROGRESS") counts.inProgress++;
    else if (u.status === "BLOCKED") counts.blocked++;
    else if (u.status === "COMPLETED") counts.completed++;
    else if (u.status === "ON_HOLD") counts.onHold++;
  }
  const completionPercent = counts.total > 0
    ? Math.round((counts.completed / counts.total) * 100)
    : 0;
  return { ...counts, completionPercent };
}

// ─── Units ────────────────────────────────────────────────────────────────────

export async function getUnit(id: string) {
  return prisma.unit.findUnique({
    where: { id },
    include: {
      building: true,
      stages: {
        include: {
          template: true,
          subcontractor: true,
        },
        orderBy: { template: { sortOrder: "asc" } },
      },
      dailyUpdates: {
        orderBy: { date: "desc" },
        include: {
          author: { select: { id: true, name: true, image: true } },
          attachments: true,
          unitStage: { include: { template: true } },
        },
        take: 20,
      },
    },
  });
}

// ─── Work Queue ───────────────────────────────────────────────────────────────

export async function getWorkQueueItems(workspaceId: string): Promise<WorkQueueItem[]> {
  const stages = await prisma.unitStage.findMany({
    where: {
      status: { in: ["READY", "IN_PROGRESS", "BLOCKED"] },
      unit: { building: { workspaceId } },
    },
    include: {
      template: true,
      subcontractor: { select: { id: true, name: true, company: true } },
      unit: {
        select: { id: true, unitNumber: true },
        include: { building: { select: { id: true, name: true } } },
      },
    },
    orderBy: [{ status: "asc" }, { template: { sortOrder: "asc" } }],
  });

  return stages.map((s) => ({
    unitStageId: s.id,
    unitId: s.unit.id,
    unitNumber: s.unit.unitNumber,
    buildingId: (s.unit as any).building.id,
    buildingName: (s.unit as any).building.name,
    stageName: s.template.name,
    trade: s.trade,
    status: s.status,
    subcontractor: s.subcontractor,
    dueDate: s.dueDate,
    notes: s.notes,
  }));
}

// ─── Updates ─────────────────────────────────────────────────────────────────

export async function getDailyUpdates(workspaceId: string) {
  return prisma.dailyUpdate.findMany({
    where: { unit: { building: { workspaceId } } },
    orderBy: { date: "desc" },
    take: 50,
    include: {
      author: { select: { id: true, name: true, image: true } },
      attachments: true,
      unitStage: { include: { template: true } },
      unit: {
        select: { id: true, unitNumber: true },
        include: { building: { select: { id: true, name: true } } },
      },
    },
  });
}

// ─── Subcontractors ───────────────────────────────────────────────────────────

export async function getSubcontractors(workspaceId: string) {
  const subs = await prisma.subcontractor.findMany({
    where: { workspaceId },
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          unitStages: { where: { status: { in: ["READY", "IN_PROGRESS", "BLOCKED"] } } },
        },
      },
    },
  });

  return subs.map((s) => ({
    ...s,
    openJobs: s._count.unitStages,
  }));
}

// ─── Stage Templates ──────────────────────────────────────────────────────────

export async function getStageTemplates(workspaceId: string) {
  return prisma.stageTemplate.findMany({
    where: { workspaceId },
    orderBy: { sortOrder: "asc" },
  });
}
