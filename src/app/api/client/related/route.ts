import { productEmbed, productVariant } from "@/db/schema";
import { db } from "@/lib/db";
import { product } from "@/db/schema";
import { eq, and, sql, cosineDistance, desc } from "drizzle-orm";
import { CreateResponse } from "@/lib/backend/message";
export async function GET(req: Request) {
  const searchParams = new URL(req.url).searchParams;
  const slug = searchParams.get("slug");
  if (!slug) {
    return new Response("Missing slug parameter", { status: 400 });
  }
  let productData = [];
  let base = [];
  let currentEmbed = [];
  let similarProducts = [];
  try {
    productData = await db
      .select()
      .from(product)
      .where(eq(product.slug, slug))
      .limit(1);
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }

  if (!productData || productData.length === 0) {
    return new Response("Product not found", { status: 404 });
  }

  try {
    base = await db
      .select()
      .from(productVariant)
      .where(
        and(
          eq(productVariant.groupId, productData[0].id),
          eq(productVariant.kind, "base"),
        ),
      )
      .limit(1);
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }

  if (!base || base.length === 0) {
    return new Response("Base variant not found", { status: 404 });
  }

  try {
    currentEmbed = await db
      .select()
      .from(productEmbed)
      .where(eq(productEmbed.productId, productData[0].id))
      .limit(1);
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }

  if (!currentEmbed || currentEmbed.length === 0) {
    return new Response("Product embed not found", { status: 404 });
  }

  try {
    const similarity = sql<number>`
        1 - (${cosineDistance(productEmbed.embedding, currentEmbed[0].embedding)})
      `;

    similarProducts = await db
      .select({
        id: productEmbed.id,
        content: productEmbed.content,
        similarity,
      })
      .from(productEmbed)
      .orderBy(desc(similarity))
      .limit(5);
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }

  return CreateResponse({
    message: "Product fetched successfully",
    status: 200,
    ok: true,
    additionalData: {
      similarProducts,
    },
  });
}
