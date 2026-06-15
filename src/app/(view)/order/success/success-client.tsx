"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCartStore, formatMoney } from "@/hooks/use-cart-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2Icon,
  MapPinIcon,
  PackageIcon,
  ReceiptIcon,
} from "lucide-react";
import type { order, orderItem } from "@/db/schema";

type Order = typeof order.$inferSelect;
type OrderItem = typeof orderItem.$inferSelect;

type Props = {
  order: Order;
  items: OrderItem[];
};

export function SuccessClient({ order: o, items }: Props) {
  const { clearCart } = useCartStore();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <main className="p-4 md:p-8 max-w-2xl mx-auto">
      <div className="flex flex-col items-center text-center gap-4 mb-8">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle2Icon className="size-10 text-green-600" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Payment Confirmed!</h1>
          <p className="text-muted-foreground">
            Thank you for your order. A confirmation email was sent to{" "}
            <span className="font-medium text-foreground">{o.email}</span>.
          </p>
        </div>
        <Badge variant="secondary" className="font-mono text-xs">
          Order #{o.id.slice(0, 8).toUpperCase()}
        </Badge>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <PackageIcon className="size-4 text-primary" />
              Items Ordered
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1">
                    {item.productTitle}
                  </p>
                  {item.variantTitle && (
                    <p className="text-xs text-muted-foreground">
                      {item.variantTitle}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Qty: {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-semibold tabular-nums shrink-0">
                  {formatMoney(item.lineTotalCents / 100)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <ReceiptIcon className="size-4 text-primary" />
              Order Total
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="tabular-nums">
                {formatMoney(o.subtotalCents / 100)}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span className="text-green-600 font-medium">Free</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax</span>
              <span className="tabular-nums">
                {formatMoney(o.taxCents / 100)}
              </span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-semibold text-base">
              <span>Total paid</span>
              <span className="tabular-nums">
                {formatMoney(o.totalCents / 100)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPinIcon className="size-4 text-primary" />
              Shipping To
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-0.5">
            <p className="font-medium">{o.shippingName}</p>
            <p className="text-muted-foreground">{o.shippingAddress}</p>
            <p className="text-muted-foreground">
              {o.shippingCity}, {o.shippingState} {o.shippingZip}
            </p>
            <p className="text-muted-foreground">{o.shippingCountry}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3 mt-8">
        <Button asChild variant="outline" className="flex-1">
          <Link href="/me/orders">View My Orders</Link>
        </Button>
        <Button asChild className="flex-1">
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    </main>
  );
}
