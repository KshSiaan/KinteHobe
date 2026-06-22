"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BugIcon } from "lucide-react";

type DatasetPreviewSheetProps = {
  motherObject: {
    baseVariant: unknown;
    sizeVariant: unknown;
    colorAndCustomVariants: unknown;
  };
};

export default function DatasetPreviewSheet({
  motherObject,
}: DatasetPreviewSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="fixed top-4 right-4 z-50"
        >
          <BugIcon data-icon="inline-start" />
          Live Dataset
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[78dvh]">
        <SheetHeader>
          <SheetTitle>Live Product Dataset</SheetTitle>
          <SheetDescription>
            Temporary debug panel showing the mother object in real time.
          </SheetDescription>
        </SheetHeader>
        <div className="px-6 pb-6">
          <pre className="max-h-[60dvh] overflow-auto rounded-lg border bg-muted/30 p-4 text-xs leading-relaxed">
            <code>{JSON.stringify(motherObject, null, 2)}</code>
          </pre>
        </div>
      </SheetContent>
    </Sheet>
  );
}
