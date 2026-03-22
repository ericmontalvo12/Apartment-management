"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(5, "ZIP is required"),
  totalUnits: z.coerce.number().int().min(1, "At least 1 unit"),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

interface BuildingFormProps {
  action: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
  defaultValues?: Partial<FormData>;
  submitLabel?: string;
}

export function BuildingForm({ action, defaultValues, submitLabel = "Create Building" }: BuildingFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit, formState: { errors }, setError } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? { totalUnits: 1 },
  });

  function onSubmit(data: FormData) {
    startTransition(async () => {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => fd.append(k, String(v ?? "")));
      const result = await action(fd as any);
      if (result && result.success && (result as any).id) {
        router.push(`/buildings/${(result as any).id}`);
      } else if (result && !result.success && result.error) {
        setError("root", { message: result.error });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2 space-y-1">
          <label className="text-sm font-medium">Building Name</label>
          <input className="input-field" placeholder="Oakwood Terrace" {...register("name")} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="sm:col-span-2 space-y-1">
          <label className="text-sm font-medium">Street Address</label>
          <input className="input-field" placeholder="1200 Oak Street" {...register("address")} />
          {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">City</label>
          <input className="input-field" placeholder="Austin" {...register("city")} />
          {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">State</label>
            <input className="input-field" placeholder="TX" maxLength={2} {...register("state")} />
            {errors.state && <p className="text-xs text-destructive">{errors.state.message}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">ZIP</label>
            <input className="input-field" placeholder="78701" {...register("zip")} />
            {errors.zip && <p className="text-xs text-destructive">{errors.zip.message}</p>}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Total Units</label>
          <input type="number" min={1} className="input-field" {...register("totalUnits")} />
          {errors.totalUnits && <p className="text-xs text-destructive">{errors.totalUnits.message}</p>}
        </div>

        <div className="sm:col-span-2 space-y-1">
          <label className="text-sm font-medium">Notes <span className="text-muted-foreground font-normal">(optional)</span></label>
          <textarea className="input-field min-h-[80px] resize-none" placeholder="Any special instructions or notes…" {...register("notes")} />
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
