"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import type { TradeType } from "@prisma/client";

const subSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  company: z.string().max(100).optional().or(z.literal("")),
  trade: z.string().min(1, "Trade is required"),
  phone: z.string().max(30).optional().or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export type SubActionResult = { success: true; id: string } | { success: false; error: string };

export async function createSubcontractor(formData: FormData): Promise<SubActionResult> {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role === "VIEWER") {
    return { success: false, error: "Permission denied" };
  }

  const parsed = subSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Validation error" };
  }

  const workspaceId = (session.user as any).workspaceId as string;

  try {
    const sub = await prisma.subcontractor.create({
      data: {
        workspaceId,
        name: parsed.data.name,
        company: parsed.data.company || null,
        trade: parsed.data.trade as TradeType,
        phone: parsed.data.phone || null,
        email: parsed.data.email || null,
        notes: parsed.data.notes || null,
      },
    });

    revalidatePath("/subcontractors");
    return { success: true, id: sub.id };
  } catch (e: any) {
    return { success: false, error: "Failed to create subcontractor" };
  }
}

export async function updateSubcontractor(id: string, formData: FormData): Promise<SubActionResult> {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role === "VIEWER") {
    return { success: false, error: "Permission denied" };
  }

  const parsed = subSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Validation error" };
  }

  try {
    await prisma.subcontractor.update({
      where: { id },
      data: {
        name: parsed.data.name,
        company: parsed.data.company || null,
        trade: parsed.data.trade as TradeType,
        phone: parsed.data.phone || null,
        email: parsed.data.email || null,
        notes: parsed.data.notes || null,
      },
    });
    revalidatePath("/subcontractors");
    return { success: true, id };
  } catch (e) {
    return { success: false, error: "Failed to update subcontractor" };
  }
}

export async function toggleSubcontractorActive(id: string, isActive: boolean): Promise<{ success: boolean }> {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role === "VIEWER") return { success: false };

  try {
    await prisma.subcontractor.update({ where: { id }, data: { isActive } });
    revalidatePath("/subcontractors");
    return { success: true };
  } catch {
    return { success: false };
  }
}
