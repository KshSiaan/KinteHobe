"use client";

import Image from "next/image";
import { CheckIcon } from "lucide-react";
import { useTheme } from "next-themes";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const themes = [
  {
    id: "light",
    label: "Light",
    image: "/illust/light mode.svg",
  },
  {
    id: "dark",
    label: "Dark",
    image: "/illust/dark mode.svg",
  },
  {
    id: "system",
    label: "System",
    image: "/illust/system mode.svg",
  },
] as const;

export default function Appearance() {
  const { theme, setTheme } = useTheme();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>

        <CardDescription>
          Select how the interface should look across the platform.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <Label>Theme</Label>

        <div className="grid gap-4 sm:grid-cols-3">
          {themes.map((item) => {
            const active = theme === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTheme(item.id)}
                aria-label={`Switch to ${item.label} theme`}
                aria-pressed={active}
                className={cn(
                  "group relative overflow-hidden rounded-xl border bg-background text-left transition-all duration-200",
                  "hover:border-primary/40 hover:bg-accent/40 hover:shadow-sm",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active && "border-primary ring-2 ring-primary/20",
                )}
              >
                {/* Preview */}
                <div className="relative aspect-video border-b bg-muted">
                  {item.id === "system" && (
                    <div className="absolute inset-y-0 left-0 w-1/2 bg-foreground" />
                  )}

                  {item.id === "dark" && (
                    <div className="absolute inset-0 bg-foreground" />
                  )}

                  <Image
                    src={item.image}
                    alt={item.label}
                    width={400}
                    height={240}
                    draggable={false}
                    className="relative z-10 h-full w-full object-contain p-6 select-none"
                  />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>

                    <p className="text-muted-foreground text-xs">
                      {item.id === "system"
                        ? "Match device appearance"
                        : `${item.label} interface`}
                    </p>
                  </div>

                  <div
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full border transition-all duration-200",
                      active
                        ? "border-primary bg-primary text-primary-foreground opacity-100"
                        : "border-muted-foreground/30 opacity-0 group-hover:opacity-100",
                    )}
                  >
                    <CheckIcon className="h-3 w-3" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
