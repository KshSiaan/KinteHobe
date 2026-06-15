"use client";

import { CheckCircle2Icon, PackageIcon, TruckIcon } from "lucide-react";
import type { CheckoutStep } from "../types";

const STEPS: { id: CheckoutStep; label: string; icon: React.ElementType }[] = [
  { id: "shipping", label: "Shipping", icon: TruckIcon },
  { id: "review", label: "Review", icon: PackageIcon },
];

const STEP_ORDER: CheckoutStep[] = ["shipping", "review"];

export function StepIndicator({ current }: { current: CheckoutStep }) {
  const currentIndex = STEP_ORDER.indexOf(current);
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        const Icon = step.icon;
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={[
                  "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors",
                  done
                    ? "border-primary bg-primary text-primary-foreground"
                    : active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-muted bg-muted text-muted-foreground",
                ].join(" ")}
              >
                {done ? (
                  <CheckCircle2Icon className="size-4" />
                ) : (
                  <Icon className="size-4" />
                )}
              </div>
              <span
                className={[
                  "text-xs font-medium",
                  active
                    ? "text-primary"
                    : done
                      ? "text-foreground"
                      : "text-muted-foreground",
                ].join(" ")}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={[
                  "mb-5 h-0.5 w-16 transition-colors",
                  done ? "bg-primary" : "bg-muted",
                ].join(" ")}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
