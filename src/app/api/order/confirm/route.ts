import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { order, orderItem, transaction } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return Response.json({ message: "Missing session_id" }, { status: 400 });
  }

  const [existing] = await db
    .select()
    .from(transaction)
    .where(eq(transaction.stripeSessionId, sessionId))
    .limit(1);

  if (!existing) {
    return Response.json({ message: "Transaction not found" }, { status: 404 });
  }

  if (existing.status === "succeeded") {
    const [existingOrder] = await db
      .select()
      .from(order)
      .where(eq(order.id, existing.orderId))
      .limit(1);
    const items = await db
      .select()
      .from(orderItem)
      .where(eq(orderItem.orderId, existing.orderId));
    return Response.json({ order: existingOrder, items });
  }

  const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);

  if (stripeSession.payment_status !== "paid") {
    return Response.json(
      { message: "Payment not completed" },
      { status: 402 },
    );
  }

  await db
    .update(order)
    .set({ status: "paid" })
    .where(eq(order.id, existing.orderId));

  await db
    .update(transaction)
    .set({
      status: "succeeded",
      stripePaymentIntentId:
        typeof stripeSession.payment_intent === "string"
          ? stripeSession.payment_intent
          : (stripeSession.payment_intent?.id ?? null),
    })
    .where(eq(transaction.stripeSessionId, sessionId));

  const [confirmedOrder] = await db
    .select()
    .from(order)
    .where(eq(order.id, existing.orderId))
    .limit(1);

  const items = await db
    .select()
    .from(orderItem)
    .where(eq(orderItem.orderId, existing.orderId));

  return Response.json({ order: confirmedOrder, items });
}
