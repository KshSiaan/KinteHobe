"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ProductErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ProductError({ error, reset }: ProductErrorProps) {
  useEffect(() => {
    console.error("Product page error:", error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] items-center justify-center p-6">
      <Card className="w-full max-w-xl border-destructive/40">
        <CardHeader>
          <CardTitle>Unable to load this product</CardTitle>
          <CardDescription>
            An error occurred while rendering the product page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="break-words rounded-md bg-destructive/10 p-3 font-mono text-sm text-destructive">
            {error.message || "Unknown product page error"}
          </p>
          <Button onClick={reset}>Try again</Button>
        </CardContent>
      </Card>
    </main>
  );
}
