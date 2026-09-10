import { order, orderItem, product, productVariant } from "@/db/schema";
import { CreateResponse } from "@/lib/backend/message";
import { db } from "@/lib/db";
import { desc, eq } from "drizzle-orm";
export async function GET() {
  try {
    const res = await db
      .select({
        title: productVariant.title,
        slug: product.slug,
      })
      .from(orderItem)
      .innerJoin(order, eq(orderItem.orderId, order.id))
      .innerJoin(product, eq(orderItem.productId, product.id))
      .innerJoin(productVariant, eq(orderItem.variantId, productVariant.id))
      .orderBy(desc(order.createdAt))
      .limit(4);
    return CreateResponse({
      message: "Recent orders fetched successfully",
      ok: true,
      status: 200,
      additionalData: {
        data: res,
      },
    });
  } catch (error) {
    console.error("Error fetching recent orders:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
