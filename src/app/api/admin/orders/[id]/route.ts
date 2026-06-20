import { order } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createNotification } from "@/lib/notifications";
import { eq } from "drizzle-orm";

const VALID_STATUSES = [
  "pending_payment",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;

type OrderStatus = (typeof VALID_STATUSES)[number];

const STATUS_NOTIFICATION: Record<
  OrderStatus,
  { title: string; body: (orderId: string) => string; type: "order_placed" | "order_status_changed" | "order_cancelled" | "order_refunded" | "order_delivered" }
> = {
  pending_payment: {
    type: "order_status_changed",
    title: "Order Awaiting Payment",
    body: (id) => `Your order #${id} is awaiting payment.`,
  },
  paid: {
    type: "order_placed",
    title: "Payment Confirmed",
    body: (id) => `Payment for order #${id} was confirmed.`,
  },
  processing: {
    type: "order_status_changed",
    title: "Order Being Processed",
    body: (id) => `Your order #${id} is now being processed.`,
  },
  shipped: {
    type: "order_status_changed",
    title: "Order Shipped",
    body: (id) => `Your order #${id} has been shipped and is on its way.`,
  },
  delivered: {
    type: "order_delivered",
    title: "Order Delivered",
    body: (id) => `Your order #${id} has been delivered. Enjoy!`,
  },
  cancelled: {
    type: "order_cancelled",
    title: "Order Cancelled",
    body: (id) => `Your order #${id} has been cancelled.`,
  },
  refunded: {
    type: "order_refunded",
    title: "Order Refunded",
    body: (id) => `A refund has been issued for order #${id}.`,
  },
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.session?.token || session?.user?.role !== "admin") {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const status = (body as Record<string, unknown>)?.status;

  if (
    typeof status !== "string" ||
    !VALID_STATUSES.includes(status as OrderStatus)
  ) {
    return Response.json({ message: "Invalid status value" }, { status: 400 });
  }

  const [existing] = await db
    .select({ id: order.id, userId: order.userId, status: order.status })
    .from(order)
    .where(eq(order.id, id));

  if (!existing) {
    return Response.json({ message: "Order not found" }, { status: 404 });
  }

  if (existing.status === status) {
    return Response.json({ message: "Status unchanged" }, { status: 200 });
  }

  await db
    .update(order)
    .set({ status: status as OrderStatus })
    .where(eq(order.id, id));

  if (existing.userId) {
    const notif = STATUS_NOTIFICATION[status as OrderStatus];
    await createNotification({
      userId: existing.userId,
      type: notif.type,
      title: notif.title,
      body: notif.body(id),
      metadata: { orderId: id, oldStatus: existing.status, newStatus: status },
    }).catch(() => {});
  }

  return Response.json({ message: "Order status updated" }, { status: 200 });
}
