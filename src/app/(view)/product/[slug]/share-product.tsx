"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon, Share2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ShareProduct() {
  const [copied, setCopied] = useState(false);

  const url = typeof window !== "undefined" ? window.location.href : "";

  const canShare =
    typeof window !== "undefined" && typeof navigator.share === "function";

  const handleShare = async () => {
    try {
      if (canShare) {
        await navigator.share({
          title: document.title,
          text: "Check out this product 👀",
          url,
        });

        return;
      }

      await navigator.clipboard.writeText(url);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        Share this product with your friends and family.
      </p>

      <div className="flex gap-2">
        <Input value={url} readOnly />

        <Button onClick={handleShare} className="shrink-0">
          {canShare ? (
            <>
              <Share2Icon className="mr-2 size-4" />
              Share
            </>
          ) : copied ? (
            <>
              <CheckIcon className="mr-2 size-4" />
              Copied
            </>
          ) : (
            <>
              <CopyIcon className="mr-2 size-4" />
              Copy
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
