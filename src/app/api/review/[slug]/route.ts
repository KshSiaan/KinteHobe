import { review, product, user } from "@/db/schema";
import { auth } from "@/lib/auth";
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

export async function DELETE(request: Request, { params }: { params: Promise<{ slug: string }> }) {

    const session = await auth.api.getSession({
        headers: request.headers,
    })

    if (!session?.session.token) {
        return new Response(JSON.stringify({
            message: "Unauthorized"
        }), { status: 401 });
    }


    if (session.user.role !== "admin" && session.user.role !== "manager") {
        return new Response(JSON.stringify({
            message: "Forbidden"
        }), { status: 403 });
    }



    const { slug } = await params;


    if (!slug) {
        return new Response(JSON.stringify({
            message: "Product slug is required"
        }), { status: 400 });
    }

    try{
        const deleteResult = await db.delete(review).where(eq(review.id, slug)).returning();
        return new Response(JSON.stringify({
            message: "Review deleted successfully",
            data: deleteResult,
        }));
    } catch (error) {
        return new Response(JSON.stringify({
            message: "Error deleting review",
            error: error instanceof Error ? error.message : "An error occurred",
            data: null,
        }), { status: 500 });
    }

}
