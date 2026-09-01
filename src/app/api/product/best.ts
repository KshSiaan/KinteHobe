import { category, orderItem, product, productVariant } from "@/db/schema";
import { db } from "@/lib/db";
import { withConcurrencyLimit, withRetry } from "@/lib/db-utils";
import { sql, eq } from "drizzle-orm";
import { toCategoryPublicUrl, toProductPublicUrl } from "./route";

export async function bestSellingProducts(limit: number) {
  try {
    const result = await db
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

        title: sql<string>`
                                coalesce(
                                    max(${productVariant.title})
                                        filter (where ${productVariant.kind} = 'base'),
                                    ''
                                )
                            `.as("title"),

        description: sql<string>`
                                coalesce(
                                    max(${productVariant.details})
                                        filter (where ${productVariant.kind} = 'base'),
                                    ''
                                )
                            `.as("description"),

        variants: sql<Array<typeof productVariant.$inferSelect>>`
                                coalesce(
                                    jsonb_agg(
                                        jsonb_build_object(
                                            'id', ${productVariant.id},
                                            'groupId', ${productVariant.groupId},
                                            'code', ${productVariant.code},
                                            'sku', ${productVariant.sku},
                                            'price', ${productVariant.price},
                                            'compareAtPrice', ${productVariant.compareAtPrice},
                                            'stockQuantity', ${productVariant.stockQuantity},
                                            'weight', ${productVariant.weight},
                                            'details', ${productVariant.details},
                                            'metadata', ${productVariant.metadata},
                                            'position', ${productVariant.position},
                                            'kind', ${productVariant.kind},
                                            'enabled', ${productVariant.enabled},
                                            'title', ${productVariant.title},
                                            'optionName', ${productVariant.optionName},
                                            'images', ${productVariant.images},
                                            'createdAt', ${productVariant.createdAt},
                                            'updatedAt', ${productVariant.updatedAt}
                                        )
                                        order by ${productVariant.position} asc
                                    )
                                    filter (where ${productVariant.id} is not null),
                                    '[]'::jsonb
                                )
                            `.as("variants"),
      })
      .from(product)
      .innerJoin(category, eq(product.categoryId, category.id))
      .innerJoin(productVariant, eq(product.id, productVariant.groupId))
      .groupBy(product.id, category.id, productVariant.groupId)
      .orderBy(sql`
                (
                    select count(*)
                    from ${orderItem}
                    where ${orderItem.productId} = ${product.id}
                )
        desc`)
      .limit(limit);

    const data = await withConcurrencyLimit(
      result.map((row) => async () => {
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
  } catch (err) {
    console.error("Failed to fetch products:", err);
    return {
      message: "Failed to fetch products",
      data: [],
      code: 500,
    };
  }
}
