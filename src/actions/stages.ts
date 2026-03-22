"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { StageStatus } from "@prisma/client";

const updateStageSchema = z.object({
  unitStageId: z.string().cuid(),
  status: z.enum(["NOT_STARTED", "READY", "IN_PROGRESS", "BLOCKED", "DONE", "SKIPPED"]),
  notes: z.string().max(1000).optional(),
  subcontractorId: z.string().cuid().nullable().optional(),
});

export type UpdateStageResult = { success: true } | { success: false; error: string };

export async function updateStageStatus(
  input: z.infer<typeof updateStageSchema>
): Promise<UpdateStageResult> {
  // PERMISSION CHECK: PROJECT_MANAGER and ADMIN only
  // const session = await getServerSession(authOptions);
  // if (!session || !canManageBuildings(session.user.role)) {
  //   return { success: false, error: "Permission denied" };
  // }

  const parsed = updateStageSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Validation error" };
  }

  try {
    const { unitStageId, status, notes, subcontractorId } = parsed.data;

    const stage = await prisma.unitStage.update({
      where: { id: unitStageId },
      data: {
        status: status as StageStatus,
        notes: notes ?? undefined,
        subcontractorId: subcontractorId,
        startedAt: status === "IN_PROGRESS" ? new Date() : undefined,
        completedAt: status === "DONE" ? new Date() : undefined,
      },
      include: { unit: true },
    });

    // Update unit-level status based on aggregate stage statuses
    await syncUnitStatus(stage.unitId);

    revalidatePath(`/units/${stage.unitId}`);
    revalidatePath(`/buildings/${stage.unit.buildingId}`);
    revalidatePath("/work-queue");

    return { success: true };
  } catch (error) {
    console.error("updateStageStatus error:", error);
    return { success: false, error: "Failed to update stage" };
  }
}

/**
 * Derives unit-level status from its stage statuses.
 * Called after any stage status change.
 */
async function syncUnitStatus(unitId: string) {
  const stages = await prisma.unitStage.findMany({
    where: { unitId },
    select: { status: true },
  });

  const statuses = stages.map((s) => s.status);
  let newStatus: string;

  if (statuses.every((s) => s === "DONE" || s === "SKIPPED")) {
    newStatus = "COMPLETED";
  } else if (statuses.some((s) => s === "BLOCKED")) {
    newStatus = "BLOCKED";
  } else if (statuses.some((s) => s === "IN_PROGRESS" || s === "READY")) {
    newStatus = "IN_PROGRESS";
  } else {
    newStatus = "NOT_STARTED";
  }

  await prisma.unit.update({
    where: { id: unitId },
    data: { status: newStatus as any },
  });
}
