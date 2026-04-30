

import { category, product, productVariant } from "@/db/schema";
import { db } from "@/lib/db";
import { createSupabaseStorageClient } from "@/lib/storage/supabase";
import { desc, eq } from "drizzle-orm";

function toProductPublicUrl(path: string) {
  return createSupabaseStorageClient().storage.from("product").getPublicUrl(path).data
    .publicUrl;
}

function toCategoryPublicUrl(path: string | null | undefined) {
  if (!path) return null;
  return createSupabaseStorageClient().storage.from("category").getPublicUrl(path).data
    .publicUrl;
}

export async function GET() {
  try {
    const rows = await db
      .select({
        product,
        category,
        variant: productVariant,
      })
      .from(product)
      .leftJoin(category, eq(product.categoryId, category.id))
      .leftJoin(productVariant, eq(product.id, productVariant.groupId))
      .orderBy(desc(product.createdAt), desc(productVariant.position));

    const productMap = new Map<
      string,
      {
        id: string;
        slug: string;
        title: string;
        description:string;
        category: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image: string | null;
          banner: string | null;
          isActive: boolean | null;
          metaTitle: string | null;
          metaDescription: string | null;
          createdAt: Date;
          updatedAt: Date;
        };
        categoryId: string;
        status: typeof product.$inferSelect.status;
        variantIds: string[];
        createdAt: Date;
        updatedAt: Date;
        variants: Array<
          typeof productVariant.$inferSelect & {
            publicImages: string[];
          }
        >;
      }
    >();

    for (const row of rows) {
      const currentProduct = row.product;
      const currentCategory = row.category;

      if (!currentCategory) {
        continue;
      }

      if (!productMap.has(currentProduct.id)) {
        productMap.set(currentProduct.id, {
          id: currentProduct.id,
          slug: currentProduct.slug,
          title: "",
          description: "",
          category: {
            id: currentCategory.id,
            name: currentCategory.name,
            slug: currentCategory.slug,
            description: currentCategory.description,
            image: toCategoryPublicUrl(currentCategory.image),
            banner: toCategoryPublicUrl(currentCategory.banner),
            isActive: currentCategory.isActive,
            metaTitle: currentCategory.metaTitle,
            metaDescription: currentCategory.metaDescription,
            createdAt: currentCategory.createdAt,
            updatedAt: currentCategory.updatedAt,
          },
          categoryId: currentProduct.categoryId,
          status: currentProduct.status,
          variantIds: currentProduct.variantIds,
          createdAt: currentProduct.createdAt,
          updatedAt: currentProduct.updatedAt,
          variants: [],
        });
      }

      if (row.variant) {
        const variant = row.variant;
        const productEntry = productMap.get(currentProduct.id);

        if (!productEntry) {
          continue;
        }

        productEntry.variants.push({
          ...variant,
          publicImages: variant.images.map((imagePath) => toProductPublicUrl(imagePath)),
        });

        if (variant.kind === "base") {
          productEntry.title = variant.title ?? "";
          productEntry.description = variant.details ?? "";
        }
      }
    }

    return Response.json(
      {
        message: "Products fetched successfully",
        data: Array.from(productMap.values()),
      },
      { status: 200 },
    );
  } catch (error) {
    return Response.json(
      {
        message: error instanceof Error ? error.message : "Failed to fetch products",
      },
      { status: 500 },
    );
  }
}