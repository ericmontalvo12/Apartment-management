"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";

const TRADES = [
  "DEMOLITION", "PLUMBING", "ROUGH_ELECTRICAL", "HVAC", "FRAMING", "INSULATION",
  "DRYWALL", "PAINTING", "FLOORING", "TILE", "CABINETS", "COUNTERTOPS",
  "APPLIANCES", "BASEBOARDS_TRIM", "DOORS_HARDWARE", "FINAL_PUNCH", "CLEANING", "INSPECTION",
] as const;

const TRADE_LABELS: Record<string, string> = {
  DEMOLITION: "Demolition", PLUMBING: "Plumbing", ROUGH_ELECTRICAL: "Electrical",
  HVAC: "HVAC", FRAMING: "Framing", INSULATION: "Insulation", DRYWALL: "Drywall",
  PAINTING: "Painting", FLOORING: "Flooring", TILE: "Tile", CABINETS: "Cabinets",
  COUNTERTOPS: "Countertops", APPLIANCES: "Appliances", BASEBOARDS_TRIM: "Baseboards & Trim",
  DOORS_HARDWARE: "Doors & Hardware", FINAL_PUNCH: "Final Punch", CLEANING: "Cleaning",
  INSPECTION: "Inspection",
};

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  company: z.string().optional(),
  trade: z.string().min(1, "Trade is required"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

interface SubcontractorFormProps {
  action: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
  defaultValues?: Partial<FormData>;
  submitLabel?: string;
}

export function SubcontractorForm({ action, defaultValues, submitLabel = "Add Subcontractor" }: SubcontractorFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit, formState: { errors }, setError } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  function onSubmit(data: FormData) {
    startTransition(async () => {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => fd.append(k, String(v ?? "")));
      const result = await action(data);
      if (result && result.success) {
        router.push("/subcontractors");
      } else if (result && !result.success && result.error) {
        setError("root", { message: result.error });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium">Full Name</label>
          <input className="input-field" placeholder="Mike Torres" {...register("name")} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Company <span className="text-muted-foreground font-normal">(optional)</span></label>
          <input className="input-field" placeholder="Torres Plumbing Co." {...register("company")} />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Trade</label>
          <select className="input-field" {...register("trade")}>
            <option value="">Select trade…</option>
            {TRADES.map((t) => (
              <option key={t} value={t}>{TRADE_LABELS[t] ?? t}</option>
            ))}
          </select>
          {errors.trade && <p className="text-xs text-destructive">{errors.trade.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Phone <span className="text-muted-foreground font-normal">(optional)</span></label>
          <input type="tel" className="input-field" placeholder="(512) 555-0100" {...register("phone")} />
        </div>

        <div className="sm:col-span-2 space-y-1">
          <label className="text-sm font-medium">Email <span className="text-muted-foreground font-normal">(optional)</span></label>
          <input type="email" className="input-field" placeholder="mike@example.com" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="sm:col-span-2 space-y-1">
          <label className="text-sm font-medium">Notes <span className="text-muted-foreground font-normal">(optional)</span></label>
          <textarea className="input-field min-h-[80px] resize-none" placeholder="Any notes…" {...register("notes")} />
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
