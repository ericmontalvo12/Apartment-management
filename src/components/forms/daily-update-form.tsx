"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createDailyUpdate } from "@/actions/daily-updates";

const schema = z.object({
  notes: z.string().min(1, "Notes are required").max(2000),
  hoursWorked: z.coerce.number().positive().optional().or(z.literal("")),
  date: z.string().min(1, "Date is required"),
  unitStageId: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

interface Stage {
  id: string;
  template: { name: string };
}

interface DailyUpdateFormProps {
  unitId: string;
  stages?: Stage[];
  onClose: () => void;
  onSuccess: () => void;
}

export function DailyUpdateForm({ unitId, stages, onClose, onSuccess }: DailyUpdateFormProps) {
  const [isPending, startTransition] = useTransition();
  const today = new Date().toISOString().split("T")[0];

  const { register, handleSubmit, formState: { errors }, setError } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { date: today },
  });

  function onSubmit(data: FormData) {
    startTransition(async () => {
      const result = await createDailyUpdate({
        unitId,
        unitStageId: data.unitStageId || undefined,
        notes: data.notes,
        hoursWorked: data.hoursWorked !== "" ? Number(data.hoursWorked) : undefined,
        date: new Date(data.date),
      });

      if (result.success) {
        onSuccess();
      } else {
        setError("root", { message: result.error });
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-card border rounded-xl shadow-xl w-full max-w-md p-6 space-y-4 mx-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Log Daily Update</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {stages && stages.length > 0 && (
            <div className="space-y-1">
              <label className="text-sm font-medium">Stage <span className="text-muted-foreground font-normal">(optional)</span></label>
              <select className="input-field" {...register("unitStageId")}>
                <option value="">General unit update</option>
                {stages.map((s) => (
                  <option key={s.id} value={s.id}>{s.template.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium">Notes</label>
            <textarea
              className="input-field min-h-[100px] resize-none"
              placeholder="Describe the work done today…"
              {...register("notes")}
            />
            {errors.notes && <p className="text-xs text-destructive">{errors.notes.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Date</label>
              <input type="date" className="input-field" {...register("date")} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Hours <span className="text-muted-foreground font-normal">(optional)</span></label>
              <input type="number" step="0.5" min="0" className="input-field" placeholder="4" {...register("hoursWorked")} />
            </div>
          </div>

          {errors.root && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{errors.root.message}</p>
          )}

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending ? "Saving…" : "Log Update"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
