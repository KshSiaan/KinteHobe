import { product, productVariant, review } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { and, eq } from "drizzle-orm";
import z from "zod";

export async function POST(request: Request) {
    const user = await auth.api.getSession({
        headers: request.headers,
    })
    if (!user?.session.token) {
        return new Response(JSON.stringify({
            message: "Unauthorized"
        }), { status: 401 });
    }

    if (user?.user.banned) {
        return new Response(JSON.stringify({
            message: "You are banned from submitting reviews"
        }), { status: 403 });
    }

    const data = await request.json();
    const { ratingFloat, reviewText, productSlug } = data;

    const productData = await db.select({
        product,
        baseVariant: productVariant,
    }).from(product)
        .leftJoin(productVariant, and(
            eq(productVariant.groupId, product.id),
            eq(productVariant.kind, "base"),
        ))
        .where(eq(product.slug, productSlug))
        .limit(1);

    if (productData.length === 0) {
        return new Response(JSON.stringify({
            message: "Product not found"
        }), { status: 404 });
    }

    try {
        const parsedRating = parseFloat(ratingFloat);

        const parsedDataset = z.object({
            authorId: z.string().min(1),
            productId: z.string().min(1),
            ratingFloat: z.number().min(0).max(5),
            reviewText: z.string().min(1).max(500),
            productSlug: z.string().min(1),
        }).safeParse({
            authorId: user.user.id,
            productId: productData[0].product.id,
            ratingFloat: parsedRating,
            reviewText,
            productSlug,
        });
        if (!parsedDataset.success) {
            const { fieldErrors: issues } = z.flattenError(parsedDataset.error);
            return new Response(JSON.stringify({
                message: "Validation failed",
                issues,
            }), { status: 400 });
        }
        const data = await db.insert(review).values({
            id: crypto.randomUUID(),
            authorId: user.user.id,
            productId: productData[0].product.id,
            ratingFloat: parsedRating,
            reviewText: reviewText,
            createdAt: new Date(),
        }).returning()

        return new Response(JSON.stringify({
            message: "Review submitted successfully",
            review: data[0],
        }));
    } catch (error) {
        console.error("Error inserting review:", error);
        return new Response(JSON.stringify({
            message: "Error submitting review"
        }), { status: 500 });

    }

    return new Response(JSON.stringify({
        user,
        review: reviewText,
        productName: productData[0].baseVariant?.title
    }));
}