"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";

const schema = z.object({
  unitNumber: z.string().min(1, "Unit number is required"),
  floor: z.coerce.number().int().optional().or(z.literal("")),
  bedrooms: z.coerce.number().int().min(0).optional().or(z.literal("")),
  bathrooms: z.coerce.number().min(0).optional().or(z.literal("")),
  sqft: z.coerce.number().int().min(0).optional().or(z.literal("")),
  targetDate: z.string().optional(),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

interface UnitFormProps {
  buildingId: string;
  action: (buildingId: string, formData: FormData) => Promise<{ success: boolean; error?: string }>;
  defaultValues?: Partial<FormData>;
  submitLabel?: string;
}

export function UnitForm({ buildingId, action, defaultValues, submitLabel = "Create Unit" }: UnitFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit, formState: { errors }, setError } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  function onSubmit(data: FormData) {
    startTransition(async () => {
      const fd = new FormData();
      fd.append("buildingId", buildingId);
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== "") fd.append(k, String(v));
      });
      const result = await action(buildingId, data);
      if (result && result.success && (result as any).id) {
        router.push(`/units/${(result as any).id}`);
      } else if (result && !result.success && result.error) {
        setError("root", { message: result.error });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium">Unit Number</label>
          <input className="input-field" placeholder="101" {...register("unitNumber")} />
          {errors.unitNumber && <p className="text-xs text-destructive">{errors.unitNumber.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Floor <span className="text-muted-foreground font-normal">(optional)</span></label>
          <input type="number" min={1} className="input-field" placeholder="1" {...register("floor")} />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Bedrooms</label>
          <input type="number" min={0} className="input-field" placeholder="2" {...register("bedrooms")} />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Bathrooms</label>
          <input type="number" min={0} step="0.5" className="input-field" placeholder="1" {...register("bathrooms")} />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Square Feet</label>
          <input type="number" min={0} className="input-field" placeholder="850" {...register("sqft")} />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Target Date <span className="text-muted-foreground font-normal">(optional)</span></label>
          <input type="date" className="input-field" {...register("targetDate")} />
        </div>

        <div className="sm:col-span-2 space-y-1">
          <label className="text-sm font-medium">Notes <span className="text-muted-foreground font-normal">(optional)</span></label>
          <textarea className="input-field min-h-[80px] resize-none" placeholder="Any notes about this unit…" {...register("notes")} />
        </div>
      </div>

      {errors.root && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{errors.root.message}</p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
