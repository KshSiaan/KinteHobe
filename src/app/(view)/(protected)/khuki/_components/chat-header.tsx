"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
  status: string;
}

export const ChatHeader = ({ status }: ChatHeaderProps) => {
  const isThinking = status === "streaming";

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0">
      <div className="relative shrink-0">
        <Image
          src="/assistant-icon.webp"
          alt="Khuki"
          width={38}
          height={38}
          className="rounded-xl shadow-sm"
          priority
        />
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-background transition-colors duration-300",
            isThinking ? "bg-amber-400 animate-pulse" : "bg-emerald-400",
          )}
        />
      </div>
      <div className="min-w-0">
        <div className="font-semibold text-sm leading-none">Khuki</div>
        <div
          className={cn(
            "text-xs mt-0.5 transition-colors duration-300",
            isThinking
              ? "text-amber-500 dark:text-amber-400"
              : "text-muted-foreground",
          )}
        >
          {isThinking ? "Thinking..." : "AI Shopping Assistant · Online"}
        </div>
      </div>
    </div>
  );
};
