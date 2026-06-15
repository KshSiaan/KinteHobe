import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { order, orderItem, transaction } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SuccessClient } from "./success-client";

export const metadata: Metadata = {
  title: "Order Confirmed — KinteHobe",
};

type Props = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function SuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams;

  if (!session_id) redirect("/");

  const [tx] = await db
    .select()
    .from(transaction)
    .where(eq(transaction.stripeSessionId, session_id))
    .limit(1);

  if (!tx) redirect("/");

  if (tx.status !== "succeeded") {
    const stripeSession = await stripe.checkout.sessions.retrieve(session_id);

    if (stripeSession.payment_status !== "paid") {
      redirect("/order/cancel?reason=unpaid");
    }

    await db
      .update(order)
      .set({ status: "paid" })
      .where(eq(order.id, tx.orderId));

    await db
      .update(transaction)
      .set({
        status: "succeeded",
        stripePaymentIntentId:
          typeof stripeSession.payment_intent === "string"
            ? stripeSession.payment_intent
            : (stripeSession.payment_intent?.id ?? null),
      })
      .where(eq(transaction.stripeSessionId, session_id));
  }

  const [confirmedOrder] = await db
    .select()
    .from(order)
    .where(eq(order.id, tx.orderId))
    .limit(1);

  if (!confirmedOrder) redirect("/");

  const items = await db
    .select()
    .from(orderItem)
    .where(eq(orderItem.orderId, tx.orderId));

  return <SuccessClient order={confirmedOrder} items={items} />;
}
