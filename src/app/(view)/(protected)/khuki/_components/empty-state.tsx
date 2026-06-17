"use client";

import Image from "next/image";
import { Shimmer } from "@/components/ai-elements/shimmer";

const SUGGESTIONS = [
  "What's on sale today?",
  "Track my order",
  "Best deals this week",
  "Return policy",
];

interface ChatEmptyStateProps {
  onSuggest: (text: string) => void;
}

export const ChatEmptyState = ({ onSuggest }: ChatEmptyStateProps) => (
  <div className="flex flex-col items-center justify-center h-full gap-6 p-8 text-center select-none">
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-purple-600/20 rounded-3xl blur-2xl scale-150" />
      <Image
        src="/assistant-icon.webp"
        alt="Khuki"
        width={72}
        height={72}
        className="relative rounded-2xl shadow-xl"
        priority
      />
    </div>
    <div className="space-y-1.5">
      <Shimmer as="h2" className="text-lg font-semibold" duration={3}>
        Hi! I&apos;m Khuki
      </Shimmer>
      <p className="text-muted-foreground text-sm max-w-[260px] leading-relaxed">
        Your AI shopping companion. Ask me anything about products, orders, or
        deals.
      </p>
    </div>
    <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
      {SUGGESTIONS.map((suggestion) => (
        <button
          key={suggestion}
          type="button"
          onClick={() => onSuggest(suggestion)}
          className="text-xs text-left px-3 py-2.5 rounded-xl border bg-muted/40 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground font-medium cursor-pointer"
        >
          {suggestion}
        </button>
      ))}
    </div>
  </div>
);
