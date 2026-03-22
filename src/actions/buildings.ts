"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions, canManageBuildings } from "@/lib/auth";

const buildingSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required").max(2),
  zip: z.string().min(5, "ZIP is required"),
  totalUnits: z.coerce.number().int().min(1, "Must have at least 1 unit"),
  notes: z.string().max(1000).optional(),
});

export type BuildingActionResult = { success: true; id: string } | { success: false; error: string };

export async function createBuilding(formData: FormData): Promise<BuildingActionResult> {
  const session = await getServerSession(authOptions);
  if (!session || !canManageBuildings((session.user as any).role)) {
    return { success: false, error: "Permission denied" };
  }

  const parsed = buildingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Validation error" };
  }

  const workspaceId = (session.user as any).workspaceId as string;

  try {
    const building = await prisma.building.create({
      data: { ...parsed.data, workspaceId },
    });
    revalidatePath("/buildings");
    return { success: true, id: building.id };
  } catch (e) {
    console.error("createBuilding error:", e);
    return { success: false, error: "Failed to create building" };
  }
}

export async function updateBuilding(id: string, formData: FormData): Promise<BuildingActionResult> {
  const session = await getServerSession(authOptions);
  if (!session || !canManageBuildings((session.user as any).role)) {
    return { success: false, error: "Permission denied" };
  }

  const parsed = buildingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Validation error" };
  }

  try {
    await prisma.building.update({ where: { id }, data: parsed.data });
    revalidatePath(`/buildings/${id}`);
    revalidatePath("/buildings");
    return { success: true, id };
  } catch (e) {
    return { success: false, error: "Failed to update building" };
  }
}

export async function deleteBuilding(id: string): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return { success: false, error: "Only admins can delete buildings" };
  }

  try {
    await prisma.building.update({ where: { id }, data: { isActive: false } });
    revalidatePath("/buildings");
    return { success: true };
  } catch (e) {
    return { success: false, error: "Failed to delete building" };
  }
}
