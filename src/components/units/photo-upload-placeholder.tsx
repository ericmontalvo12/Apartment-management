"use client";

import { ImagePlus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PhotoUploadPlaceholderProps {
  unitId: string;
}

/**
 * Photo upload section placeholder.
 *
 * TODO: Integrate UploadThing:
 *   1. npm install uploadthing @uploadthing/react
 *   2. Create src/app/api/uploadthing/core.ts with fileRouter
 *   3. Create src/app/api/uploadthing/route.ts
 *   4. Replace this component with <UploadButton> from uploadthing
 *   5. On upload complete: call server action to create Attachment record
 */
export function PhotoUploadPlaceholder({ unitId }: PhotoUploadPlaceholderProps) {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      {/* Mock existing photos */}
      <div className="grid grid-cols-2 gap-2">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="aspect-video rounded-md bg-muted/60 flex items-center justify-center text-muted-foreground/30"
          >
            <ImagePlus className="h-6 w-6" />
          </div>
        ))}
      </div>

      {/* Upload button */}
      <Button variant="outline" className="w-full" size="sm">
        <Upload className="h-3.5 w-3.5 mr-2" />
        Upload Photos
      </Button>

      <p className="text-[10px] text-muted-foreground text-center">
        JPG, PNG up to 10MB · Linked to daily update or stage
      </p>
    </div>
  );
}
