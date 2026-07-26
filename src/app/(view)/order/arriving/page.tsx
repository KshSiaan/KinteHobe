import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { order, orderItem, transaction } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createNotification } from "@/lib/notifications";
import { SuccessClient } from "./success-client";

export const metadata: Metadata = {
  title: "Order Confirmed — KinteHobe",
};

type Props = {
  searchParams: Promise<{ order_id?: string }>;
};

export default async function ArrivingPage({ searchParams }: Props) {
  const { order_id } = await searchParams;

  if (!order_id) redirect("/");

  const [tx] = await db
    .select()
    .from(order)
    .where(eq(order.id, order_id))
    .limit(1);

  if (!tx) redirect("/");

  if (tx.status !== "awaiting_cod") {
    await createNotification({
      userId: tx.userId ?? "",
      type: "order_status_changed",
      title: "Payment confirmed",
      body: `Payment for order #${tx.id.slice(0, 8).toUpperCase()} was successful. Your order is now being processed.`,
      metadata: { orderId: tx.id },
    });
  }

  const items = await db
    .select()
    .from(orderItem)
    .where(eq(orderItem.orderId, tx.id));

  return <SuccessClient order={tx} items={items} />;
}
