"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions, canCreateUpdates } from "@/lib/auth";
import { z } from "zod";

const createUpdateSchema = z.object({
  unitId: z.string().cuid(),
  unitStageId: z.string().cuid().optional(),
  notes: z.string().min(1, "Notes are required").max(2000),
  hoursWorked: z.number().positive().optional(),
  date: z.date().default(() => new Date()),
});

export type CreateUpdateResult = { success: true; id: string } | { success: false; error: string };

export async function createDailyUpdate(
  input: z.infer<typeof createUpdateSchema>
): Promise<CreateUpdateResult> {
  const session = await getServerSession(authOptions);
  if (!session || !canCreateUpdates((session.user as any).role)) {
    return { success: false, error: "Permission denied" };
  }

  const parsed = createUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Validation error" };
  }

  try {
    const update = await prisma.dailyUpdate.create({
      data: {
        unitId: parsed.data.unitId,
        unitStageId: parsed.data.unitStageId,
        notes: parsed.data.notes,
        hoursWorked: parsed.data.hoursWorked,
        date: parsed.data.date,
        authorId: (session.user as any).id,
      },
    });

    revalidatePath(`/units/${parsed.data.unitId}`);
    revalidatePath("/updates");

    return { success: true, id: update.id };
  } catch (error) {
    console.error("createDailyUpdate error:", error);
    return { success: false, error: "Failed to create update" };
  }
}
