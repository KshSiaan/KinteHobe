"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingCartIcon } from "lucide-react";

export function EmptyCartView() {
  return (
    <main className="p-8 flex flex-col items-center justify-center min-h-[60dvh] gap-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <ShoppingCartIcon className="size-10 text-muted-foreground" />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">Your cart is empty</h2>
        <p className="text-muted-foreground text-sm">
          Add some items before checking out.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Browse Products</Link>
      </Button>
    </main>
  );
}
