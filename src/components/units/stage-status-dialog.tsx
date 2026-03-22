"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateStageStatus } from "@/actions/stages";
import type { StageStatus, TradeType } from "@prisma/client";

const STATUS_OPTIONS: { value: StageStatus; label: string }[] = [
  { value: "NOT_STARTED", label: "Not Started" },
  { value: "READY", label: "Ready" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "BLOCKED", label: "Blocked" },
  { value: "DONE", label: "Done" },
  { value: "SKIPPED", label: "Skipped" },
];

interface Subcontractor {
  id: string;
  name: string;
  company: string | null;
  trade: TradeType;
}

interface StageStatusDialogProps {
  stage: {
    id: string;
    status: StageStatus;
    notes: string | null;
    subcontractorId: string | null;
    template: { name: string };
  };
  availableSubs: Subcontractor[];
  onClose: () => void;
}

export function StageStatusDialog({ stage, availableSubs, onClose }: StageStatusDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<StageStatus>(stage.status);
  const [notes, setNotes] = useState(stage.notes ?? "");
  const [subcontractorId, setSubcontractorId] = useState(stage.subcontractorId ?? "");
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    startTransition(async () => {
      const result = await updateStageStatus({
        unitStageId: stage.id,
        status,
        notes: notes || undefined,
        subcontractorId: subcontractorId || null,
      });

      if (result.success) {
        onClose();
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-card border rounded-xl shadow-xl w-full max-w-md p-6 space-y-4 mx-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{stage.template.name}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Status</label>
            <select
              className="input-field"
              value={status}
              onChange={(e) => setStatus(e.target.value as StageStatus)}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {availableSubs.length > 0 && (
            <div className="space-y-1">
              <label className="text-sm font-medium">Subcontractor <span className="text-muted-foreground font-normal">(optional)</span></label>
              <select
                className="input-field"
                value={subcontractorId}
                onChange={(e) => setSubcontractorId(e.target.value)}
              >
                <option value="">Unassigned</option>
                {availableSubs.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}{s.company ? ` — ${s.company}` : ""}</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium">Notes <span className="text-muted-foreground font-normal">(optional)</span></label>
            <textarea
              className="input-field min-h-[80px] resize-none"
              placeholder="Any notes about this stage…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="button" onClick={handleSave} disabled={isPending} className="flex-1">
              {isPending ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
