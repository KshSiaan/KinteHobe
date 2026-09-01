import { category, product, productVariant, wishlist } from "@/db/schema";
import { db } from "@/lib/db";
import { sql, eq, desc } from "drizzle-orm";
import { toCategoryPublicUrl, toProductPublicUrl } from "./route";
import { withRetry } from "@/lib/db-utils";

export async function favouriteProducts(limit: number) {
  // wishlistCount: sql<number>`count(${wishlist.id})`,

  try {
    // Use retry logic for transient database errors
    const result = await withRetry(
      () =>
        db
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

            wishlistCount: sql<number>`
                            (
                                select count(*)
                                from ${wishlist}
                                where ${wishlist.productId} = ${product.id}
                            )
                        `.as("wishlistCount"),
          })
          .from(product)
          .innerJoin(category, eq(category.id, product.categoryId))
          .leftJoin(productVariant, eq(productVariant.groupId, product.id))
          .groupBy(product.id, category.id)
          .orderBy(
            desc(sql`
                            (
                                select count(*)
                                from ${wishlist}
                                where ${wishlist.productId} = ${product.id}
                            )
                        `),
          )
          .limit(limit),
      {
        maxRetries: 3,
        initialDelayMs: 50,
      },
    );

    const data = result.map((row) => ({
      id: row.id,
      slug: row.slug,

      title: row.title,
      description: row.description,

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

      variants: row.variants.map((variant) => ({
        ...variant,
        publicImages: variant.images.map((imagePath) =>
          toProductPublicUrl(imagePath),
        ),
      })),
    }));

    return {
      message: "Products fetched successfully",
      data: data,
      code: 200,
    };
  } catch (e) {
    console.error("Error fetching favourite products:", e);
    return {
      message: "Failed to fetch products",
      data: [],
      code: 500,
    };
  }
}
