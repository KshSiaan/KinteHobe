import { review } from "@/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
    // Implementation for handling GET requests
    const { slug } = await params;

    if (!slug) {
        return new Response(JSON.stringify({
            message: "Product slug is required"
        }), { status: 400 });
    }

    const reviewData = await db.select().from(review).where(eq(review.productId, slug)).all();



    return new Response(JSON.stringify({
        message: "This is a placeholder response for GET /api/review/[slug]",
        slug,
    }));
}