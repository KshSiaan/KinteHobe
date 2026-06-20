"use client";

import Image from "next/image";
import { useCartStore, formatMoney } from "@/hooks/use-cart-store";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBagIcon, ShoppingCartIcon, TruckIcon } from "lucide-react";

export function OrderSummary() {
  const { items, subtotal, itemCount } = useCartStore();

  return (
    <Card className="sticky top-28">
      <CardHeader className="border-b pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShoppingBagIcon className="size-4 text-primary" />
            Order Summary
          </CardTitle>
          <Badge variant="secondary">
            {itemCount} item{itemCount !== 1 ? "s" : ""}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
          {items.map((item) => {
            const image = item.selection.images?.[0] ?? null;
            return (
              <div key={item.id} className="flex gap-3 items-start">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border bg-muted">
                  {image ? (
                    <Image
                      src={image}
                      alt={item.productTitle}
                      width={56}
                      height={56}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ShoppingCartIcon className="size-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1">
                    {item.productTitle}
                  </p>
                  {item.selection.title && (
                    <p className="text-xs text-muted-foreground">
                      {item.selection.title}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Qty: {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-semibold tabular-nums shrink-0">
                  {formatMoney(item.lineTotal)}
                </p>
              </div>
            );
          })}
        </div>

        <Separator className="my-4" />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatMoney(subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Shipping</span>
            <span className="text-green-600 font-medium">Free</span>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex justify-between font-semibold text-base">
          <span>Total</span>
          <span className="tabular-nums">{formatMoney(subtotal)}</span>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-green-500/10 px-3 py-2">
          <TruckIcon className="size-4 text-green-600 shrink-0" />
          <p className="text-xs text-green-700 dark:text-green-400">
            Free standard shipping on this order
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
