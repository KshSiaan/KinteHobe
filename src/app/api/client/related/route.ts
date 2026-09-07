import { productEmbed, productVariant } from "@/db/schema";
import { db } from "@/lib/db";
import { product } from "@/db/schema";
import { eq, and, sql, cosineDistance, desc, ne } from "drizzle-orm";
import { CreateResponse } from "@/lib/backend/message";
import { toProductPublicUrl } from "../../product/route";
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
  } catch (_error) {
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
  } catch (_error) {
    return new Response("Internal Server Error", { status: 500 });
  }

  if (!base || base.length === 0) {
    return new Response("Base variant not found", { status: 404 });
  }

  try {
    currentEmbed = await db
      .select()
      .from(productEmbed)
      .where(
        and(
          eq(productEmbed.productId, productData[0].id),
          eq(productEmbed.variantId, base[0].id),
        ),
      )
      .limit(1);
  } catch (_error) {
    return new Response("Internal Server Error", { status: 500 });
  }

  if (!currentEmbed || currentEmbed.length === 0) {
    return new Response("Product embed not found", { status: 404 });
  }

  try {
    const distance = cosineDistance(
      productEmbed.embedding,
      currentEmbed[0].embedding,
    );

    const similarity = sql<number>`1 - (${distance})`;

    const results = await db
      .select({
        id: productEmbed.id,
        productId: productEmbed.productId,
        similarity,
        product: {
          id: product.id,
          slug: product.slug,
          categoryId: product.categoryId,
          status: product.status,
        },
        base: {
          id: productVariant.id,
          groupId: productVariant.groupId,
          image: productVariant.images,
          title: productVariant.title,
          details: productVariant.details,
          price: productVariant.price,
          compareAtPrice: productVariant.compareAtPrice,
          kind: productVariant.kind,
        },
      })
      .from(productEmbed)
      .innerJoin(product, eq(productEmbed.productId, product.id))
      .innerJoin(
        productVariant,
        and(
          eq(productVariant.groupId, product.id),
          eq(productVariant.kind, "base"),
          eq(productVariant.id, productEmbed.variantId),
        ),
      )
      .where(ne(productEmbed.productId, productData[0].id))
      .orderBy(desc(similarity))
      .limit(100);

    const uniqueProducts = new Map<string, (typeof results)[number]>();
    for (const item of results) {
      if (!item.productId) {
        continue;
      }

      if (!uniqueProducts.has(item.productId)) {
        uniqueProducts.set(item.productId, item);
      }
    }

    similarProducts = Array.from(uniqueProducts.values())
      .slice(0, 5)
      .map((item) => ({
        id: item.productId,
        productId: item.productId,
        similarity: item.similarity,
        product: {
          id: item.product.id,
          slug: item.product.slug,
          categoryId: item.product.categoryId,
          status: item.product.status,
          base: {
            ...item.base,
            publicImages: item.base.image.map(toProductPublicUrl),
          },
        },
      }));
  } catch (error) {
    console.error(error);
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
