"use client";

import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
  className?: string;
}

export const TypingIndicator = ({ className }: TypingIndicatorProps) => (
  <div className={cn("flex items-center gap-1 h-5", className)}>
    <span className="size-2 rounded-full bg-current opacity-60 animate-bounce [animation-delay:-0.3s]" />
    <span className="size-2 rounded-full bg-current opacity-60 animate-bounce [animation-delay:-0.15s]" />
    <span className="size-2 rounded-full bg-current opacity-60 animate-bounce" />
  </div>
);
