import { category, product, productVariant } from "@/db/schema";
import { db } from "@/lib/db";
import { desc, eq, sql } from "drizzle-orm";
import { createSupabaseStorageClient } from "@/lib/storage/supabase";
import { toCategoryPublicUrl, toProductPublicUrl } from "./route";
import {
  withRetry,
  handleQueryError,
  withConcurrencyLimit,
} from "@/lib/db-utils";

export async function recentProducts(limit: number) {
  try {
    // First, get products with their categories
    const products = await db
      .select({
        id: product.id,
        slug: product.slug,
        categoryId: product.categoryId,
        status: product.status,
        variantIds: product.variantIds,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        category: {
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          image: category.image,
          banner: category.banner,
          isActive: category.isActive,
          metaTitle: category.metaTitle,
          metaDescription: category.metaDescription,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
        },
      })
      .from(product)
      .innerJoin(category, eq(product.categoryId, category.id))
      .orderBy(desc(product.createdAt))
      .limit(limit);

    // For each product, get its variants and base variant info
    // Use concurrency limiting to avoid exhausting database connection pool
    const data = await withConcurrencyLimit(
      products.map((row) => async () => {
        try {
          // Fetch variants with retry logic for transient errors
          const variants = await withRetry(
            () =>
              db
                .select({
                  id: productVariant.id,
                  groupId: productVariant.groupId,
                  code: productVariant.code,
                  sku: productVariant.sku,
                  price: productVariant.price,
                  compareAtPrice: productVariant.compareAtPrice,
                  stockQuantity: productVariant.stockQuantity,
                  weight: productVariant.weight,
                  details: productVariant.details,
                  metadata: productVariant.metadata,
                  position: productVariant.position,
                  kind: productVariant.kind,
                  enabled: productVariant.enabled,
                  title: productVariant.title,
                  optionName: productVariant.optionName,
                  images: productVariant.images,
                  createdAt: productVariant.createdAt,
                  updatedAt: productVariant.updatedAt,
                })
                .from(productVariant)
                .where(eq(productVariant.groupId, row.id))
                .orderBy(productVariant.position),
            {
              maxRetries: 3,
              initialDelayMs: 50,
            },
          );

          // Get the base variant for title and description
          const baseVariant = variants.find((v) => v.kind === "base");

          return {
            id: row.id,
            slug: row.slug,
            title: baseVariant?.title || "",
            description: baseVariant?.details || "",
            category: {
              id: row.category.id,
              name: row.category.name,
              slug: row.category.slug,
              description: row.category.description,
              image: toCategoryPublicUrl(row.category.image),
              banner: toCategoryPublicUrl(row.category.banner),
              isActive: row.category.isActive,
              metaTitle: row.category.metaTitle,
              metaDescription: row.category.metaDescription,
              createdAt: row.category.createdAt,
              updatedAt: row.category.updatedAt,
            },
            categoryId: row.categoryId,
            status: row.status,
            variantIds: row.variantIds,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            variants: variants.map((variant) => ({
              ...variant,
              publicImages: variant.images.map((imagePath) =>
                toProductPublicUrl(imagePath),
              ),
            })),
          };
        } catch (error) {
          // Graceful fallback: return product with empty variants
          console.error(
            `[Variant Fetch Error] Product ${row.id}:`,
            error instanceof Error ? error.message : String(error),
          );

          return {
            id: row.id,
            slug: row.slug,
            title: "",
            description: "",
            category: {
              id: row.category.id,
              name: row.category.name,
              slug: row.category.slug,
              description: row.category.description,
              image: toCategoryPublicUrl(row.category.image),
              banner: toCategoryPublicUrl(row.category.banner),
              isActive: row.category.isActive,
              metaTitle: row.category.metaTitle,
              metaDescription: row.category.metaDescription,
              createdAt: row.category.createdAt,
              updatedAt: row.category.updatedAt,
            },
            categoryId: row.categoryId,
            status: row.status,
            variantIds: row.variantIds,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            variants: [], // Fallback to empty variants
          };
        }
      }),
      5, // Limit to 5 concurrent variant queries at a time
    );

    return {
      message: "Products fetched successfully",
      data,
      code: 200,
    };
  } catch (error) {
    console.error("Failed to fetch products:", error);

    return {
      message: "Failed to fetch products",
      data: [],
      code: 500,
    };
  }
}
