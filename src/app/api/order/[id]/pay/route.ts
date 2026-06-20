import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { order } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.session.token) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [existing] = await db
    .select()
    .from(order)
    .where(and(eq(order.id, id), eq(order.userId, session.user.id)))
    .limit(1);

  if (!existing) {
    return Response.json({ message: "Order not found" }, { status: 404 });
  }

  if (existing.status !== "pending_payment") {
    return Response.json(
      { message: "Order is not awaiting payment" },
      { status: 409 },
    );
  }

  if (!existing.stripeSessionId) {
    return Response.json(
      { message: "No payment session found" },
      { status: 404 },
    );
  }

  const stripeSession = await stripe.checkout.sessions.retrieve(
    existing.stripeSessionId,
  );

  if (stripeSession.status === "expired") {
    const origin =
      request.headers.get("origin") ??
      process.env.NEXT_PUBLIC_BETTER_AUTH_URL ??
      "http://localhost:3000";

    const newStripeSession = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: existing.email,
      metadata: { orderId: existing.id },
      success_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/order/cancel?order_id=${existing.id}`,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: existing.totalCents,
            product_data: { name: `Order #${existing.id.slice(0, 8).toUpperCase()}` },
          },
          quantity: 1,
        },
      ],
    });

    await db
      .update(order)
      .set({ stripeSessionId: newStripeSession.id })
      .where(eq(order.id, existing.id));

    return Response.json({ url: newStripeSession.url });
  }

  return Response.json({ url: stripeSession.url });
}
