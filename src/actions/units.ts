"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions, canManageBuildings } from "@/lib/auth";

const unitSchema = z.object({
  buildingId: z.string().cuid(),
  unitNumber: z.string().min(1, "Unit number is required").max(20),
  floor: z.coerce.number().int().optional().or(z.literal("")),
  bedrooms: z.coerce.number().int().min(0).optional().or(z.literal("")),
  bathrooms: z.coerce.number().min(0).optional().or(z.literal("")),
  sqft: z.coerce.number().int().min(0).optional().or(z.literal("")),
  targetDate: z.string().optional().or(z.literal("")),
  notes: z.string().max(1000).optional(),
});

export type UnitActionResult = { success: true; id: string } | { success: false; error: string };

export async function createUnit(formData: FormData): Promise<UnitActionResult> {
  const session = await getServerSession(authOptions);
  if (!session || !canManageBuildings((session.user as any).role)) {
    return { success: false, error: "Permission denied" };
  }

  const raw = Object.fromEntries(formData);
  const parsed = unitSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Validation error" };
  }

  const { buildingId, unitNumber, floor, bedrooms, bathrooms, sqft, targetDate, notes } = parsed.data;

  try {
    // Check duplicate
    const existing = await prisma.unit.findUnique({ where: { buildingId_unitNumber: { buildingId, unitNumber } } });
    if (existing) return { success: false, error: `Unit ${unitNumber} already exists in this building` };

    // Get stage templates for workspace
    const building = await prisma.building.findUnique({ where: { id: buildingId }, select: { workspaceId: true } });
    if (!building) return { success: false, error: "Building not found" };

    const templates = await prisma.stageTemplate.findMany({ where: { workspaceId: building.workspaceId, isDefault: true }, orderBy: { sortOrder: "asc" } });

    const unit = await prisma.unit.create({
      data: {
        buildingId,
        unitNumber,
        floor: floor !== "" ? Number(floor) : undefined,
        bedrooms: bedrooms !== "" ? Number(bedrooms) : undefined,
        bathrooms: bathrooms !== "" ? Number(bathrooms) : undefined,
        sqft: sqft !== "" ? Number(sqft) : undefined,
        targetDate: targetDate && targetDate !== "" ? new Date(targetDate) : undefined,
        notes: notes || undefined,
        stages: {
          create: templates.map((t) => ({
            templateId: t.id,
            trade: t.trade,
            status: "NOT_STARTED",
          })),
        },
      },
    });

    revalidatePath(`/buildings/${buildingId}`);
    return { success: true, id: unit.id };
  } catch (e: any) {
    console.error("createUnit error:", e);
    return { success: false, error: "Failed to create unit" };
  }
}

export async function updateUnit(id: string, formData: FormData): Promise<UnitActionResult> {
  const session = await getServerSession(authOptions);
  if (!session || !canManageBuildings((session.user as any).role)) {
    return { success: false, error: "Permission denied" };
  }

  const raw = Object.fromEntries(formData);
  const parsed = unitSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Validation error" };
  }

  const { floor, bedrooms, bathrooms, sqft, targetDate, notes, unitNumber } = parsed.data;

  try {
    await prisma.unit.update({
      where: { id },
      data: {
        unitNumber,
        floor: floor !== "" ? Number(floor) : null,
        bedrooms: bedrooms !== "" ? Number(bedrooms) : null,
        bathrooms: bathrooms !== "" ? Number(bathrooms) : null,
        sqft: sqft !== "" ? Number(sqft) : null,
        targetDate: targetDate && targetDate !== "" ? new Date(targetDate) : null,
        notes: notes || null,
      },
    });
    revalidatePath(`/units/${id}`);
    return { success: true, id };
  } catch (e) {
    return { success: false, error: "Failed to update unit" };
  }
}
