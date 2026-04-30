import { category, product, productVariant } from "@/db/schema";
import { getFullURL } from "@/lib/backend/image";
import { db } from "@/lib/db";
import { desc, eq, inArray } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const [existingCategory] = await db
    .select()
    .from(category)
    .where(eq(category.slug, slug));

  if (!existingCategory) {
    return Response.json(
      { message: "Category not found" },
      { status: 404 }
    );
  }

  // ✅ STEP 1: limit products FIRST
  const baseProducts = await db
    .select()
    .from(product)
    .where(eq(product.categoryId, existingCategory.id))
    .orderBy(desc(product.createdAt))
    .limit(12);

  const productIds = baseProducts.map((p) => p.id);

  if (productIds.length === 0) {
    return Response.json({
      message: "Category retrieved successfully",
      data: {
        ...existingCategory,
        image: existingCategory.image
          ? getFullURL({ bucket: "category", path: existingCategory.image })
          : null,
        banner: existingCategory.banner
          ? getFullURL({ bucket: "category", path: existingCategory.banner })
          : null,
        products: [],
      },
    });
  }

  // ✅ STEP 2: join only those 12 products
  const rows = await db
    .select({
      product,
      variant: productVariant,
    })
    .from(product)
    .leftJoin(productVariant, eq(product.id, productVariant.groupId))
    .where(inArray(product.id, productIds))
    .orderBy(desc(product.createdAt), desc(productVariant.position));

  // ✅ STEP 3: group
  const productMap = new Map<string, any>();

  for (const row of rows) {
    const p = row.product;

    if (!productMap.has(p.id)) {
      productMap.set(p.id, {
        ...p,
        title: "",
        description: "",
        variants: [],
      });
    }

    if (row.variant) {
      const v = row.variant;
      const entry = productMap.get(p.id);

      // prevent duplicates
      if (!entry.variants.some((x: any) => x.id === v.id)) {
        entry.variants.push({
          ...v,
          publicImages: v.images.map((img) =>
            getFullURL({ bucket: "product", path: img })
          ),
        });
      }

      // base variant drives main content
      if (v.kind === "base") {
        entry.title = v.title ?? entry.title;
        entry.description = v.details ?? entry.description;
      }
    }
  }

  // ✅ optional: sort variants
  const finalProducts = Array.from(productMap.values()).map((p) => ({
    ...p,
    variants: p.variants.sort((a: any, b: any) => b.position - a.position),
  }));

  return Response.json(
    {
      message: "Category retrieved successfully",
      data: {
        ...existingCategory,
        image: existingCategory.image
          ? getFullURL({ bucket: "category", path: existingCategory.image })
          : null,
        banner: existingCategory.banner
          ? getFullURL({ bucket: "category", path: existingCategory.banner })
          : null,
        products: finalProducts,
      },
    },
    { status: 200 }
  );
}