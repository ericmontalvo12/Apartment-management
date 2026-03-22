/**
 * Core business logic utilities for renovation tracking.
 * These are pure functions — no DB calls, safe to use on client and server.
 */

import type { StageStatus, TradeType } from "@prisma/client";
import type {
  UnitWithStages,
  WorkQueueItem,
  WorkQueueByTrade,
  WorkQueueBySubcontractor,
} from "@/types";

// ─── Stage completion calculation ─────────────────────────────────────────────

const DONE_STATUSES: StageStatus[] = ["DONE", "SKIPPED"];
const ACTIVE_STATUSES: StageStatus[] = ["IN_PROGRESS", "BLOCKED"];

/**
 * Computes what percentage of a unit's stages are complete.
 * DONE and SKIPPED stages count as complete.
 */
export function computeUnitCompletionPercent(stages: { status: StageStatus }[]): number {
  if (stages.length === 0) return 0;
  const done = stages.filter((s) => DONE_STATUSES.includes(s.status)).length;
  return Math.round((done / stages.length) * 100);
}

/**
 * Returns the "current active stage" for a unit — the first IN_PROGRESS or
 * BLOCKED stage, or the first READY stage if none are active.
 */
export function getCurrentStage(
  stages: { status: StageStatus; template: { sortOrder: number; name: string } }[]
): { name: string; status: StageStatus } | null {
  const sorted = [...stages].sort((a, b) => a.template.sortOrder - b.template.sortOrder);

  const active = sorted.find((s) => ACTIVE_STATUSES.includes(s.status));
  if (active) return { name: active.template.name, status: active.status };

  const ready = sorted.find((s) => s.status === "READY");
  if (ready) return { name: ready.template.name, status: ready.status };

  return null;
}

// ─── Work Queue grouping ──────────────────────────────────────────────────────

/** Open statuses for work queue display */
const OPEN_STATUSES: StageStatus[] = ["READY", "IN_PROGRESS", "BLOCKED"];

/**
 * Groups a flat list of work queue items by trade.
 * Only includes stages with open statuses (READY, IN_PROGRESS, BLOCKED).
 */
export function groupWorkQueueByTrade(items: WorkQueueItem[]): WorkQueueByTrade[] {
  const open = items.filter((i) => OPEN_STATUSES.includes(i.status));

  const grouped = new Map<TradeType, WorkQueueItem[]>();
  for (const item of open) {
    const list = grouped.get(item.trade) ?? [];
    list.push(item);
    grouped.set(item.trade, list);
  }

  return Array.from(grouped.entries())
    .map(([trade, tradeItems]) => ({
      trade,
      displayName: formatTradeName(trade),
      count: tradeItems.length,
      items: tradeItems,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Groups work queue items by subcontractor.
 * Items without an assigned subcontractor are grouped under "Unassigned".
 */
export function groupWorkQueueBySubcontractor(
  items: WorkQueueItem[]
): WorkQueueBySubcontractor[] {
  const open = items.filter((i) => OPEN_STATUSES.includes(i.status));

  const grouped = new Map<string, WorkQueueBySubcontractor>();

  for (const item of open) {
    const key = item.subcontractor?.id ?? "unassigned";
    const existing = grouped.get(key);

    if (existing) {
      existing.items.push(item);
      existing.count++;
    } else {
      grouped.set(key, {
        subcontractorId: item.subcontractor?.id ?? "unassigned",
        subcontractorName: item.subcontractor?.name ?? "Unassigned",
        trade: item.trade,
        count: 1,
        items: [item],
      });
    }
  }

  return Array.from(grouped.values()).sort((a, b) => b.count - a.count);
}

// ─── Trade display helpers ────────────────────────────────────────────────────

const TRADE_DISPLAY_NAMES: Record<TradeType, string> = {
  DEMOLITION: "Demolition",
  PLUMBING: "Plumbing",
  ROUGH_ELECTRICAL: "Rough Electrical",
  HVAC: "HVAC",
  FRAMING: "Framing",
  INSULATION: "Insulation",
  DRYWALL: "Drywall",
  PAINTING: "Painting",
  FLOORING: "Flooring",
  TILE: "Tile",
  CABINETS: "Cabinets",
  COUNTERTOPS: "Countertops",
  APPLIANCES: "Appliances",
  BASEBOARDS_TRIM: "Baseboards & Trim",
  DOORS_HARDWARE: "Doors & Hardware",
  FINAL_PUNCH: "Final Punch",
  CLEANING: "Cleaning",
  INSPECTION: "Inspection",
};

export function formatTradeName(trade: TradeType): string {
  return TRADE_DISPLAY_NAMES[trade] ?? trade;
}

const TRADE_COLORS: Record<TradeType, string> = {
  DEMOLITION: "bg-red-100 text-red-800",
  PLUMBING: "bg-blue-100 text-blue-800",
  ROUGH_ELECTRICAL: "bg-yellow-100 text-yellow-800",
  HVAC: "bg-cyan-100 text-cyan-800",
  FRAMING: "bg-orange-100 text-orange-800",
  INSULATION: "bg-lime-100 text-lime-800",
  DRYWALL: "bg-gray-100 text-gray-800",
  PAINTING: "bg-purple-100 text-purple-800",
  FLOORING: "bg-amber-100 text-amber-800",
  TILE: "bg-teal-100 text-teal-800",
  CABINETS: "bg-brown-100 text-brown-800",
  COUNTERTOPS: "bg-stone-100 text-stone-800",
  APPLIANCES: "bg-slate-100 text-slate-800",
  BASEBOARDS_TRIM: "bg-indigo-100 text-indigo-800",
  DOORS_HARDWARE: "bg-zinc-100 text-zinc-800",
  FINAL_PUNCH: "bg-green-100 text-green-800",
  CLEANING: "bg-sky-100 text-sky-800",
  INSPECTION: "bg-violet-100 text-violet-800",
};

export function getTradeColor(trade: TradeType): string {
  return TRADE_COLORS[trade] ?? "bg-gray-100 text-gray-800";
}

// ─── Status helpers ───────────────────────────────────────────────────────────

export type StatusConfig = {
  label: string;
  color: string;
  dotColor: string;
};

const STAGE_STATUS_CONFIG: Record<StageStatus, StatusConfig> = {
  NOT_STARTED: {
    label: "Not Started",
    color: "bg-gray-100 text-gray-600",
    dotColor: "bg-gray-400",
  },
  READY: {
    label: "Ready",
    color: "bg-blue-100 text-blue-700",
    dotColor: "bg-blue-500",
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "bg-amber-100 text-amber-700",
    dotColor: "bg-amber-500",
  },
  BLOCKED: {
    label: "Blocked",
    color: "bg-red-100 text-red-700",
    dotColor: "bg-red-500",
  },
  DONE: {
    label: "Done",
    color: "bg-green-100 text-green-700",
    dotColor: "bg-green-500",
  },
  SKIPPED: {
    label: "Skipped",
    color: "bg-slate-100 text-slate-500",
    dotColor: "bg-slate-400",
  },
};

export function getStageStatusConfig(status: StageStatus): StatusConfig {
  return STAGE_STATUS_CONFIG[status];
}

import type { UnitStatus } from "@prisma/client";

const UNIT_STATUS_CONFIG: Record<UnitStatus, StatusConfig> = {
  NOT_STARTED: {
    label: "Not Started",
    color: "bg-gray-100 text-gray-600",
    dotColor: "bg-gray-400",
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "bg-amber-100 text-amber-700",
    dotColor: "bg-amber-500",
  },
  BLOCKED: {
    label: "Blocked",
    color: "bg-red-100 text-red-700",
    dotColor: "bg-red-500",
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-green-100 text-green-700",
    dotColor: "bg-green-500",
  },
  ON_HOLD: {
    label: "On Hold",
    color: "bg-slate-100 text-slate-600",
    dotColor: "bg-slate-400",
  },
};

export function getUnitStatusConfig(status: UnitStatus): StatusConfig {
  return UNIT_STATUS_CONFIG[status];
}
