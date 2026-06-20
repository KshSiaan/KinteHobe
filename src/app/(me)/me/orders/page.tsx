import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { order, orderItem } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PackageIcon } from "lucide-react";
import { PayButton } from "./_components/pay-button";

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Pending Payment",
  paid: "Paid",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

const STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "destructive" | "success" | "outline"
> = {
  pending_payment: "outline",
  paid: "secondary",
  processing: "secondary",
  shipped: "default",
  delivered: "success",
  cancelled: "destructive",
  refunded: "destructive",
};

async function getOrders(userId: string) {
  const orders = await db
    .select()
    .from(order)
    .where(eq(order.userId, userId))
    .orderBy(desc(order.createdAt));

  const ordersWithItems = await Promise.all(
    orders.map(async (o) => {
      const items = await db
        .select()
        .from(orderItem)
        .where(eq(orderItem.orderId, o.id));
      return { ...o, items };
    }),
  );

  return ordersWithItems;
}

type OrderWithItems = Awaited<ReturnType<typeof getOrders>>[number];

function OrderCard({ o }: { o: OrderWithItems }) {
  const date = new Date(o.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b py-3">
        <div className="flex items-center gap-3">
          <Badge variant={STATUS_VARIANTS[o.status] ?? "outline"}>
            {STATUS_LABELS[o.status] ?? o.status}
          </Badge>
          <span className="text-sm text-muted-foreground">{date}</span>
          <span className="font-mono text-xs text-muted-foreground">
            #{o.id.slice(0, 8).toUpperCase()}
          </span>
        </div>
        <CardTitle className="text-base">
          {formatMoney(o.totalCents / 100)}
        </CardTitle>
      </CardHeader>

      <CardContent className="divide-y py-0">
        {o.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between py-3 gap-4"
          >
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

      <CardFooter className="border-t py-3 flex items-center justify-between gap-4">
        <span className="text-xs text-muted-foreground">
          {o.shippingAddress}, {o.shippingCity}, {o.shippingState}{" "}
          {o.shippingZip}, {o.shippingCountry}
        </span>
        {o.status === "pending_payment" && <PayButton orderId={o.id} />}
      </CardFooter>
    </Card>
  );
}

function EmptyOrders() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <PackageIcon className="size-8 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="font-medium">No orders yet</p>
        <p className="text-sm text-muted-foreground">
          Your orders will appear here after you make a purchase.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Start Shopping</Link>
      </Button>
    </div>
  );
}

export default async function OrdersPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/login");

  const orders = await getOrders(session.user.id);

  const byStatus = {
    all: orders,
    pending: orders.filter((o) =>
      ["pending_payment", "paid", "processing"].includes(o.status),
    ),
    shipped: orders.filter((o) => o.status === "shipped"),
    delivered: orders.filter((o) => o.status === "delivered"),
    cancelled: orders.filter((o) =>
      ["cancelled", "refunded"].includes(o.status),
    ),
  };

  return (
    <section className="p-8">
      <h1 className="text-4xl font-semibold border-b pb-4">My Orders</h1>
      <div className="mt-8">
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">
              All ({byStatus.all.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({byStatus.pending.length})
            </TabsTrigger>
            <TabsTrigger value="shipped">
              Shipped ({byStatus.shipped.length})
            </TabsTrigger>
            <TabsTrigger value="delivered">
              Delivered ({byStatus.delivered.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled ({byStatus.cancelled.length})
            </TabsTrigger>
          </TabsList>

          {(
            Object.entries(byStatus) as [
              keyof typeof byStatus,
              OrderWithItems[],
            ][]
          ).map(([tab, list]) => (
            <TabsContent key={tab} value={tab} className="mt-4 space-y-4">
              {list.length === 0 ? (
                <EmptyOrders />
              ) : (
                list.map((o) => <OrderCard key={o.id} o={o} />)
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
