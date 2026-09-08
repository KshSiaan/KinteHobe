import { order, orderItem, product } from "@/db/schema";
import { auth } from "@/lib/auth";
import { CreateResponse } from "@/lib/backend/message";
import { db } from "@/lib/db";
import { desc, eq, getTableColumns } from "drizzle-orm";
export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const recent = await db
      .select({
        id: order.id,
        orderItemId: orderItem.id,
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        productTitle: orderItem.productTitle,
        variantTitle: orderItem.variantTitle,
        sku: orderItem.sku,
        imageUrl: orderItem.imageUrl,
        quantity: orderItem.quantity,
        lineTotalCents: orderItem.lineTotalCents,
        product: {
          ...getTableColumns(product),
        },
      })
      .from(order)
      .innerJoin(orderItem, eq(order.id, orderItem.orderId))
      .leftJoin(product, eq(orderItem.productId, product.id))
      .where(eq(order.userId, session.user.id))
      .orderBy(desc(order.createdAt))
      .limit(1);

    return CreateResponse({
      message: "Recent orders fetched successfully",
      ok: true,
      status: 200,
      additionalData: {
        data: recent,
      },
    });
  } catch (error) {
    return CreateResponse({
      message: "Failed to fetch recent orders",
      ok: false,
      status: 500,
      additionalData: {
        error: (error as Error).message,
      },
    });
  }
}
