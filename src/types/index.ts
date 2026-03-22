// Central type exports for the Property Renovation Operations Platform
// Re-exports Prisma types + extends with app-specific types

export type {
  User,
  Workspace,
  Building,
  Unit,
  UnitStage,
  StageTemplate,
  DailyUpdate,
  Attachment,
  Subcontractor,
  StageAssignment,
  WorkspaceTrade,
} from "@prisma/client";

export type {
  UserRole,
  UnitStatus,
  StageStatus,
  TradeType,
  AttachmentType,
} from "@prisma/client";

// ─── Extended / Composed Types ───────────────────────────────────────────────

import type { Building, Unit, UnitStage, StageTemplate, Subcontractor, DailyUpdate, Attachment, User } from "@prisma/client";
import type { UnitStatus, StageStatus, TradeType } from "@prisma/client";

/** Building with aggregated unit stats */
export type BuildingWithStats = Building & {
  units: UnitWithStages[];
  _count: {
    units: number;
  };
  stats: BuildingStats;
};

export type BuildingStats = {
  total: number;
  notStarted: number;
  inProgress: number;
  blocked: number;
  completed: number;
  onHold: number;
  completionPercent: number;
};

/** Unit with all stages loaded */
export type UnitWithStages = Unit & {
  stages: UnitStageWithRelations[];
  building: Building;
  completionPercent: number;
};

/** UnitStage with template and subcontractor */
export type UnitStageWithRelations = UnitStage & {
  template: StageTemplate;
  subcontractor: Subcontractor | null;
  _count?: {
    dailyUpdates: number;
  };
};

/** DailyUpdate with author and attachments */
export type DailyUpdateWithRelations = DailyUpdate & {
  author: Pick<User, "id" | "name" | "image">;
  attachments: Attachment[];
  unitStage?: (UnitStage & { template: StageTemplate }) | null;
  unit: Pick<Unit, "id" | "unitNumber">;
};

// ─── Work Queue Types ─────────────────────────────────────────────────────────

export type WorkQueueItem = {
  unitStageId: string;
  unitId: string;
  unitNumber: string;
  buildingId: string;
  buildingName: string;
  stageName: string;
  trade: TradeType;
  status: StageStatus;
  subcontractor: Pick<Subcontractor, "id" | "name" | "company"> | null;
  dueDate: Date | null;
  notes: string | null;
};

export type WorkQueueByTrade = {
  trade: TradeType;
  displayName: string;
  count: number;
  items: WorkQueueItem[];
};

export type WorkQueueBySubcontractor = {
  subcontractorId: string;
  subcontractorName: string;
  trade: TradeType;
  count: number;
  items: WorkQueueItem[];
};

// ─── Dashboard Types ──────────────────────────────────────────────────────────

export type DashboardStats = {
  totalBuildings: number;
  totalUnits: number;
  unitsNotStarted: number;
  unitsInProgress: number;
  unitsBlocked: number;
  unitsCompleted: number;
  openStagesByTrade: TradeWorkSummary[];
  recentUpdates: DailyUpdateWithRelations[];
};

export type TradeWorkSummary = {
  trade: TradeType;
  displayName: string;
  openCount: number;
  inProgressCount: number;
  blockedCount: number;
};

// ─── Form Types ───────────────────────────────────────────────────────────────

export type CreateDailyUpdateInput = {
  unitId: string;
  unitStageId?: string;
  notes: string;
  hoursWorked?: number;
  date: Date;
};

export type UpdateStageStatusInput = {
  unitStageId: string;
  status: StageStatus;
  notes?: string;
  subcontractorId?: string;
};

export type CreateBuildingInput = {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  totalUnits: number;
  notes?: string;
};

export type CreateUnitInput = {
  buildingId: string;
  unitNumber: string;
  floor?: number;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  targetDate?: Date;
};

// ─── Filter Types ─────────────────────────────────────────────────────────────

export type UnitFilters = {
  status?: UnitStatus;
  trade?: TradeType;
  search?: string;
};

export type WorkQueueFilters = {
  trade?: TradeType;
  subcontractorId?: string;
  buildingId?: string;
  status?: StageStatus;
};
