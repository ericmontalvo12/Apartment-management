/**
 * Prisma seed script — Property Renovation Operations Platform
 *
 * Generates realistic demo data:
 *   - 1 workspace
 *   - 3 admin/PM users
 *   - 5 subcontractors (multi-trade)
 *   - 6 buildings
 *   - ~4-8 units per building
 *   - 9 stage templates (renovation sequence)
 *   - Stage instances per unit with realistic statuses
 *   - Daily updates with notes
 *
 * Run: npm run db:seed
 */

import { PrismaClient, TradeType, StageStatus, UnitStatus, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

// ─── Stage Templates (ordered renovation sequence) ───────────────────────────

const STAGE_TEMPLATES: { name: string; trade: TradeType; sortOrder: number }[] = [
  { name: "Demolition", trade: "DEMOLITION", sortOrder: 1 },
  { name: "Rough Plumbing", trade: "PLUMBING", sortOrder: 2 },
  { name: "Rough Electrical", trade: "ROUGH_ELECTRICAL", sortOrder: 3 },
  { name: "HVAC Rough-in", trade: "HVAC", sortOrder: 4 },
  { name: "Insulation", trade: "INSULATION", sortOrder: 5 },
  { name: "Drywall", trade: "DRYWALL", sortOrder: 6 },
  { name: "Painting", trade: "PAINTING", sortOrder: 7 },
  { name: "Tile", trade: "TILE", sortOrder: 8 },
  { name: "Flooring", trade: "FLOORING", sortOrder: 9 },
  { name: "Cabinets", trade: "CABINETS", sortOrder: 10 },
  { name: "Countertops", trade: "COUNTERTOPS", sortOrder: 11 },
  { name: "Appliances", trade: "APPLIANCES", sortOrder: 12 },
  { name: "Plumbing Fixtures", trade: "PLUMBING", sortOrder: 13 },
  { name: "Electrical Fixtures", trade: "ROUGH_ELECTRICAL", sortOrder: 14 },
  { name: "Baseboards & Trim", trade: "BASEBOARDS_TRIM", sortOrder: 15 },
  { name: "Final Punch", trade: "FINAL_PUNCH", sortOrder: 16 },
  { name: "Cleaning", trade: "CLEANING", sortOrder: 17 },
  { name: "Final Inspection", trade: "INSPECTION", sortOrder: 18 },
];

// ─── Buildings ────────────────────────────────────────────────────────────────

const BUILDINGS = [
  { name: "Oakwood Terrace", address: "1200 Oak Street", city: "Austin", state: "TX", zip: "78701", totalUnits: 12 },
  { name: "Riverside Commons", address: "450 River Drive", city: "Austin", state: "TX", zip: "78704", totalUnits: 8 },
  { name: "Maple Ridge", address: "89 Maple Avenue", city: "Austin", state: "TX", zip: "78702", totalUnits: 6 },
  { name: "Sunset Lofts", address: "2200 Sunset Blvd", city: "Austin", state: "TX", zip: "78703", totalUnits: 10 },
  { name: "Cedar Heights", address: "301 Cedar Lane", city: "Austin", state: "TX", zip: "78705", totalUnits: 8 },
  { name: "Pinecrest Manor", address: "750 Pine Street", city: "Austin", state: "TX", zip: "78706", totalUnits: 4 },
];

// Units per building (unit numbers)
const BUILDING_UNITS: Record<string, { unitNumber: string; floor: number; bedrooms: number; bathrooms: number; sqft: number }[]> = {
  "Oakwood Terrace": [
    { unitNumber: "101", floor: 1, bedrooms: 1, bathrooms: 1, sqft: 650 },
    { unitNumber: "102", floor: 1, bedrooms: 2, bathrooms: 1, sqft: 850 },
    { unitNumber: "103", floor: 1, bedrooms: 2, bathrooms: 2, sqft: 950 },
    { unitNumber: "201", floor: 2, bedrooms: 1, bathrooms: 1, sqft: 650 },
    { unitNumber: "202", floor: 2, bedrooms: 2, bathrooms: 1, sqft: 850 },
    { unitNumber: "203", floor: 2, bedrooms: 3, bathrooms: 2, sqft: 1100 },
  ],
  "Riverside Commons": [
    { unitNumber: "1A", floor: 1, bedrooms: 1, bathrooms: 1, sqft: 700 },
    { unitNumber: "1B", floor: 1, bedrooms: 2, bathrooms: 1, sqft: 900 },
    { unitNumber: "2A", floor: 2, bedrooms: 1, bathrooms: 1, sqft: 700 },
    { unitNumber: "2B", floor: 2, bedrooms: 2, bathrooms: 2, sqft: 950 },
  ],
  "Maple Ridge": [
    { unitNumber: "101", floor: 1, bedrooms: 2, bathrooms: 1, sqft: 800 },
    { unitNumber: "102", floor: 1, bedrooms: 1, bathrooms: 1, sqft: 600 },
    { unitNumber: "201", floor: 2, bedrooms: 2, bathrooms: 2, sqft: 900 },
  ],
  "Sunset Lofts": [
    { unitNumber: "L1", floor: 1, bedrooms: 1, bathrooms: 1, sqft: 750 },
    { unitNumber: "L2", floor: 1, bedrooms: 2, bathrooms: 1, sqft: 950 },
    { unitNumber: "L3", floor: 2, bedrooms: 2, bathrooms: 2, sqft: 1000 },
    { unitNumber: "L4", floor: 2, bedrooms: 3, bathrooms: 2, sqft: 1200 },
  ],
  "Cedar Heights": [
    { unitNumber: "C1", floor: 1, bedrooms: 1, bathrooms: 1, sqft: 620 },
    { unitNumber: "C2", floor: 1, bedrooms: 2, bathrooms: 1, sqft: 820 },
    { unitNumber: "C3", floor: 2, bedrooms: 2, bathrooms: 2, sqft: 900 },
  ],
  "Pinecrest Manor": [
    { unitNumber: "P1", floor: 1, bedrooms: 2, bathrooms: 1, sqft: 850 },
    { unitNumber: "P2", floor: 1, bedrooms: 3, bathrooms: 2, sqft: 1100 },
  ],
};

/**
 * Generate a realistic stage status sequence for a unit.
 * Stages are ordered — early stages done, middle stage active, later stages not started.
 */
function generateStageStatuses(
  templates: { id: string; sortOrder: number }[],
  unitProgress: "early" | "mid" | "late" | "complete" | "blocked"
): Record<string, StageStatus> {
  const sorted = [...templates].sort((a, b) => a.sortOrder - b.sortOrder);
  const result: Record<string, StageStatus> = {};

  const thresholds = {
    early: 3,
    mid: 8,
    late: 14,
    complete: sorted.length,
    blocked: 6,
  };

  const doneThrough = thresholds[unitProgress];

  sorted.forEach((t, idx) => {
    if (idx < doneThrough) {
      result[t.id] = "DONE";
    } else if (idx === doneThrough) {
      result[t.id] = unitProgress === "blocked" ? "BLOCKED" : "IN_PROGRESS";
    } else if (idx === doneThrough + 1) {
      result[t.id] = "READY";
    } else {
      result[t.id] = "NOT_STARTED";
    }
  });

  return result;
}

function getUnitStatus(progress: string): UnitStatus {
  if (progress === "complete") return "COMPLETED";
  if (progress === "blocked") return "BLOCKED";
  return "IN_PROGRESS";
}

// ─── Main seed function ───────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding database...");

  // Clean up existing data (order matters due to FK constraints)
  await prisma.attachment.deleteMany();
  await prisma.dailyUpdate.deleteMany();
  await prisma.stageAssignment.deleteMany();
  await prisma.unitStage.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.building.deleteMany();
  await prisma.stageTemplate.deleteMany();
  await prisma.subcontractor.deleteMany();
  await prisma.workspaceTrade.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.workspace.deleteMany();

  // ── Workspace ──────────────────────────────────────────────────────────────
  const workspace = await prisma.workspace.create({
    data: {
      name: "Acme Renovation Group",
      slug: "acme-renovation",
    },
  });
  console.log(`✅ Workspace: ${workspace.name}`);

  // ── Users ──────────────────────────────────────────────────────────────────
  const users = await Promise.all([
    prisma.user.create({
      data: {
        workspaceId: workspace.id,
        email: "admin@acmereno.com",
        name: "Alex Admin",
        role: UserRole.ADMIN,
      },
    }),
    prisma.user.create({
      data: {
        workspaceId: workspace.id,
        email: "jordan@acmereno.com",
        name: "Jordan Lee",
        role: UserRole.PROJECT_MANAGER,
      },
    }),
    prisma.user.create({
      data: {
        workspaceId: workspace.id,
        email: "sam@acmereno.com",
        name: "Sam Rivera",
        role: UserRole.PROJECT_MANAGER,
      },
    }),
  ]);
  console.log(`✅ Users: ${users.length}`);

  const [, pm1, pm2] = users;

  // ── Stage Templates ────────────────────────────────────────────────────────
  const templates = await Promise.all(
    STAGE_TEMPLATES.map((t) =>
      prisma.stageTemplate.create({
        data: {
          workspaceId: workspace.id,
          name: t.name,
          trade: t.trade,
          sortOrder: t.sortOrder,
          isDefault: true,
        },
      })
    )
  );
  console.log(`✅ Stage Templates: ${templates.length}`);

  // ── Subcontractors ─────────────────────────────────────────────────────────
  const subcontractors = await Promise.all([
    prisma.subcontractor.create({
      data: {
        workspaceId: workspace.id,
        name: "Mike Torres",
        company: "Torres Plumbing Co.",
        trade: TradeType.PLUMBING,
        phone: "(512) 555-0121",
        email: "mike@torresplumbing.com",
        isActive: true,
      },
    }),
    prisma.subcontractor.create({
      data: {
        workspaceId: workspace.id,
        name: "Ana Reyes",
        company: "Reyes Painting",
        trade: TradeType.PAINTING,
        phone: "(512) 555-0188",
        email: "ana@reyespainting.com",
        isActive: true,
      },
    }),
    prisma.subcontractor.create({
      data: {
        workspaceId: workspace.id,
        name: "Carlos Vega",
        company: "Vega Electric",
        trade: TradeType.ROUGH_ELECTRICAL,
        phone: "(512) 555-0144",
        email: "carlos@vegaelectric.com",
        isActive: true,
      },
    }),
    prisma.subcontractor.create({
      data: {
        workspaceId: workspace.id,
        name: "Linda Chen",
        company: "Chen Flooring",
        trade: TradeType.FLOORING,
        phone: "(512) 555-0199",
        email: "linda@chenflooring.com",
        isActive: true,
      },
    }),
    prisma.subcontractor.create({
      data: {
        workspaceId: workspace.id,
        name: "Dave Okafor",
        company: "Okafor Drywall",
        trade: TradeType.DRYWALL,
        phone: "(512) 555-0177",
        email: "dave@okafordrywall.com",
        isActive: true,
      },
    }),
    prisma.subcontractor.create({
      data: {
        workspaceId: workspace.id,
        name: "Rosa Medina",
        company: "Medina Tile & Stone",
        trade: TradeType.TILE,
        phone: "(512) 555-0155",
        email: "rosa@medinatile.com",
        isActive: true,
      },
    }),
  ]);
  console.log(`✅ Subcontractors: ${subcontractors.length}`);

  const [subPlumbing, subPainting, subElectrical, subFlooring, subDrywall, subTile] = subcontractors;

  // Assign subs by trade
  const TRADE_SUBS: Partial<Record<string, typeof subcontractors[0]>> = {
    PLUMBING: subPlumbing,
    PAINTING: subPainting,
    ROUGH_ELECTRICAL: subElectrical,
    FLOORING: subFlooring,
    DRYWALL: subDrywall,
    TILE: subTile,
  };

  // ── Buildings and Units ────────────────────────────────────────────────────
  const unitProgressions = ["early", "mid", "mid", "late", "blocked", "complete"] as const;
  let buildingIdx = 0;

  for (const bldgData of BUILDINGS) {
    const building = await prisma.building.create({
      data: {
        workspaceId: workspace.id,
        name: bldgData.name,
        address: bldgData.address,
        city: bldgData.city,
        state: bldgData.state,
        zip: bldgData.zip,
        totalUnits: bldgData.totalUnits,
      },
    });

    const unitDefs = BUILDING_UNITS[bldgData.name] ?? [];

    for (let i = 0; i < unitDefs.length; i++) {
      const unitDef = unitDefs[i];
      const progress = unitProgressions[i % unitProgressions.length];
      const stageStatuses = generateStageStatuses(templates, progress);

      const unit = await prisma.unit.create({
        data: {
          buildingId: building.id,
          unitNumber: unitDef.unitNumber,
          floor: unitDef.floor,
          bedrooms: unitDef.bedrooms,
          bathrooms: unitDef.bathrooms,
          sqft: unitDef.sqft,
          status: getUnitStatus(progress),
          targetDate: new Date(Date.now() + (30 + i * 7) * 24 * 60 * 60 * 1000),
        },
      });

      // Create unit stages from templates
      for (const template of templates) {
        const status = stageStatuses[template.id] ?? "NOT_STARTED";
        const sub = TRADE_SUBS[template.trade as string] ?? null;

        await prisma.unitStage.create({
          data: {
            unitId: unit.id,
            templateId: template.id,
            trade: template.trade,
            status,
            subcontractorId: (status === "NOT_STARTED" ? null : sub?.id) ?? null,
            notes:
              status === "BLOCKED"
                ? "Blocked — awaiting materials or inspection clearance"
                : status === "IN_PROGRESS"
                ? "Work underway"
                : null,
            startedAt: ["IN_PROGRESS", "DONE"].includes(status) ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) : null,
            completedAt: status === "DONE" ? new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) : null,
          },
        });
      }

      // Add daily updates for units that are in progress
      if (["mid", "late", "blocked"].includes(progress)) {
        const author = i % 2 === 0 ? pm1 : pm2;

        await prisma.dailyUpdate.create({
          data: {
            unitId: unit.id,
            authorId: author.id,
            notes: `Day ${i + 1} check: Work progressing as planned in Unit ${unitDef.unitNumber}. Crew on site.`,
            date: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        });

        if (progress === "blocked") {
          await prisma.dailyUpdate.create({
            data: {
              unitId: unit.id,
              authorId: author.id,
              notes: `Unit ${unitDef.unitNumber} blocked — inspector flagged issue. Following up with subcontractor to resolve.`,
              date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            },
          });
        }
      }
    }

    console.log(`✅ Building: ${building.name} (${unitDefs.length} units)`);
    buildingIdx++;
  }

  console.log("\n🎉 Seed complete!");
  console.log("─────────────────────────────────");
  console.log("Demo login: jordan@acmereno.com");
  console.log("─────────────────────────────────");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
