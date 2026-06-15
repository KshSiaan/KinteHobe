import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { XCircleIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Payment Cancelled — KinteHobe",
};

export default function CancelPage() {
  return (
    <main className="p-8 flex flex-col items-center justify-center min-h-[60dvh] gap-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
        <XCircleIcon className="size-10 text-destructive" />
      </div>
      <div className="space-y-2 max-w-sm">
        <h1 className="text-2xl font-bold">Payment Cancelled</h1>
        <p className="text-muted-foreground">
          Your payment was not completed. Your cart has been saved — you can try
          again whenever you're ready.
        </p>
      </div>
      <div className="flex gap-3">
        <Button asChild variant="outline">
          <Link href="/cart">Back to Cart</Link>
        </Button>
        <Button asChild>
          <Link href="/checkout">Try Again</Link>
        </Button>
      </div>
    </main>
  );
}
