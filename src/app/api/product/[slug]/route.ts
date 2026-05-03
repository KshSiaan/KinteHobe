import { category, product, productVariant } from "@/db/schema";
import { CreateResponse } from "@/lib/backend/message";
import { db } from "@/lib/db";
import { createSupabaseStorageClient } from "@/lib/storage/supabase";
import { asc, eq } from "drizzle-orm";

function toProductPublicUrl(path: string) {
  return createSupabaseStorageClient().storage.from("product").getPublicUrl(path).data
    .publicUrl;
}

function toCategoryPublicUrl(path: string | null | undefined) {
  if (!path) return null;
  return createSupabaseStorageClient().storage.from("category").getPublicUrl(path).data
    .publicUrl;
}

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ slug: string }> },
) {
    const slug = (await params)?.slug;
    const existingProduct = await db
        .select({
            product,
            category,
            variant: productVariant,
        })
        .from(product)
        .where(eq(product.slug, slug))
        .leftJoin(category, eq(product.categoryId, category.id))
        .leftJoin(productVariant, eq(product.id, productVariant.groupId))
        .orderBy(asc(productVariant.position));

    if (!existingProduct.length) {
        return Response.json(
            {
                message: "Product not found",
            },
            { status: 404 },
        );
    }


    const firstRow = existingProduct[0];
    const variants = existingProduct
        .map((row) => row.variant)
        .filter((variant): variant is NonNullable<typeof variant> => variant !== null)
        .map((variant) => ({
            ...variant,
            images: variant.images.map((imagePath) => toProductPublicUrl(imagePath)),
        }));

    return CreateResponse({
        message: "Product retrieved successfully",
        ok: true,
        status: 200,
        additionalData: {
            data: {
                product: firstRow.product,
                category: firstRow.category ? {
                    ...firstRow.category,
                    image: toCategoryPublicUrl(firstRow.category.image),
                    banner: toCategoryPublicUrl(firstRow.category.banner),
                } : firstRow.category,
                variants,
            },
        },
    });
    }


