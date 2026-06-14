import { review, product, user } from "@/db/schema";
import { db } from "@/lib/db";
import { eq, and, sql, gte, lt } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const { searchParams } = new URL(request.url)
    const ratingNumber = searchParams.get("rating")


    if (!slug) {
        return new Response(JSON.stringify({
            message: "Product slug is required"
        }), { status: 400 });
    }
    const productData = await db.select().from(product).where(eq(product.slug, slug)).limit(1);
    if (productData.length === 0) {
        return new Response(JSON.stringify({
            message: "Product not found",
            data: null,
        }), { status: 404 });
    }

    const floatRating = ratingNumber ? parseFloat(ratingNumber) : null;

    const reviewData = await db
        .select()
        .from(review)
        .where(
            and(
                eq(review.productId, productData[0].id),
                floatRating !== null
                    ? and(
                        gte(review.ratingFloat, floatRating),
                        lt(review.ratingFloat, floatRating + 1)
                    )
                    : undefined
            )
        ).leftJoin(user, eq(user.id, review.authorId))

    if (reviewData.length === 0) {
        return new Response(JSON.stringify({
            message: "No reviews found for this product",
            data: [],
        }));
    }

    return new Response(JSON.stringify({
        message: "This is a placeholder response for GET /api/review/[slug]",
        data: reviewData,
    }));
}