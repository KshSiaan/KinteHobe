import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { order, orderItem, transaction } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { CartLineItem } from "@/hooks/use-cart-store";
import type { ShippingForm } from "@/app/(view)/checkout/types";
import { createNotification } from "@/lib/notifications";
import z from "zod";

const shippingSchema = z.object({
  fullName: z.string().min(1),
  email: z.email(),
  phone: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(1),
  country: z.string().min(1),
});

const bodySchema = z.object({
  shipping: shippingSchema,
  items: z.array(z.object({
    productId: z.string(),
    productSlug: z.string(),
    productTitle: z.string(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
    lineTotal: z.number().positive(),
    selection: z.object({
      variantId: z.string(),
      title: z.string().optional().nullable(),
      sku: z.string().optional().nullable(),
      images: z.array(z.string()).default([]),
    }),
  })).min(1),
});

function toCents(dollars: number) {
  return Math.round(dollars * 100);
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });


  if (!session?.session.token) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const raw = await request.json();
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return Response.json(
      { message: "Invalid request", issues: z.flattenError(parsed.error).fieldErrors },
      { status: 400 },
    );
  }

  const { shipping, items } = parsed.data as {
    shipping: ShippingForm;
    items: CartLineItem[];
  };

  const subtotalCents = items.reduce((sum, i) => sum + toCents(i.lineTotal), 0);
  const taxCents = 0;
  const totalCents = subtotalCents;

  const orderId = crypto.randomUUID();
  const origin =
    request.headers.get("origin") ??
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ??
    "http://localhost:3000";

  await db.insert(order).values({
    id: orderId,
    userId: session?.user.id ?? null,
    email: shipping.email,
    status: "pending_payment",
    shippingName: shipping.fullName,
    shippingPhone: shipping.phone,
    shippingAddress: shipping.address,
    shippingCity: shipping.city,
    shippingState: shipping.state,
    shippingZip: shipping.zip,
    shippingCountry: shipping.country,
    subtotalCents,
    taxCents,
    shippingCents: 0,
    totalCents,
  });

  await db.insert(orderItem).values(
    items.map((item) => ({
      id: crypto.randomUUID(),
      orderId,
      productId: item.productId,
      variantId: item.selection.variantId,
      productTitle: item.productTitle,
      variantTitle: item.selection.title ?? null,
      sku: item.selection.sku ?? null,
      quantity: item.quantity,
      unitPriceCents: toCents(item.unitPrice),
      lineTotalCents: toCents(item.lineTotal),
      imageUrl: item.selection.images?.[0] ?? null,
    })),
  );

  await createNotification({
    userId: session.user.id,
    type: "order_placed",
    title: "Order placed",
    body: `Your order #${orderId.slice(0, 8).toUpperCase()} has been placed and is awaiting payment.`,
    metadata: { orderId },
  });

  const lineItems: import("stripe").Stripe.Checkout.SessionCreateParams.LineItem[] = [
    ...items.map((item) => ({
      price_data: {
        currency: "usd",
        unit_amount: toCents(item.unitPrice),
        product_data: {
          name: item.productTitle,
          description: item.selection.title ?? undefined,
          images: item.selection.images?.slice(0, 1) ?? [],
        },
      },
      quantity: item.quantity,
    })),
  ];

  const stripeSession = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    customer_email: shipping.email,
    metadata: { orderId },
    success_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/order/cancel?order_id=${orderId}`,
  });

  await db.insert(transaction).values({
    id: crypto.randomUUID(),
    orderId,
    stripeSessionId: stripeSession.id,
    amountCents: totalCents,
    currency: "usd",
    status: "pending",
  });

  await db
    .update(order)
    .set({ stripeSessionId: stripeSession.id })
    .where(eq(order.id, orderId));

  return Response.json({ url: stripeSession.url, orderId });
}
