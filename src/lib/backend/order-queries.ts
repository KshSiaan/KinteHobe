import "server-only";

import { order, orderItem } from "@/db/schema";
import { db } from "@/lib/db";
import { desc, eq } from "drizzle-orm";

export async function getOrders(userId: string) {
  const orders = await db
    .select()
    .from(order)
    .where(eq(order.userId, userId))
    .orderBy(desc(order.createdAt));

  return Promise.all(
    orders.map(async (currentOrder) => {
      const items = await db
        .select()
        .from(orderItem)
        .where(eq(orderItem.orderId, currentOrder.id));

      return { ...currentOrder, items };
    }),
  );
}
